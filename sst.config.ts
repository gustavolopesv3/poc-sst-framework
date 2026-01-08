/// <reference path="./.sst/platform/config.d.ts" />

interface RouteConfig {
  name: string;
  handler: string;
  event: {
    type: "http" | "sqs" | "stepfunction";
    path?: string;
    method?: string;
    queueName?: string;
    batchSize?: number;
    maximumConcurrency?: number;
    dlq?: {
      enabled: boolean;
      maxReceiveCount?: number;
    };
  };
}

interface ProviderConfig {
  routes?: RouteConfig[];
  // Legacy single config support
  name?: string;
  handler?: string;
  event?: RouteConfig["event"];
}

export default $config({
  app(input) {
    return {
      name: "poc-sst",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const fs = await import("fs");
    const path = await import("path");

    function findProviderConfigs(dir: string): string[] {
      const results: string[] = [];

      if (!fs.existsSync(dir)) {
        return results;
      }

      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          results.push(...findProviderConfigs(fullPath));
        } else if (item.name === "provider.conf.json") {
          results.push(fullPath);
        }
      }

      return results;
    }

    function loadProviderConfigs(): RouteConfig[] {
      const srcDir = path.join(process.cwd(), "src");
      const configPaths = findProviderConfigs(srcDir);
      const configs: RouteConfig[] = [];

      for (const configPath of configPaths) {
        const rawConfig: ProviderConfig = JSON.parse(
          fs.readFileSync(configPath, "utf-8")
        );

        // Support new format with routes array
        if (rawConfig.routes) {
          configs.push(...rawConfig.routes);
        }
        // Support legacy single config format
        else if (rawConfig.name && rawConfig.handler && rawConfig.event) {
          configs.push({
            name: rawConfig.name,
            handler: rawConfig.handler,
            event: rawConfig.event,
          });
        }
      }

      return configs;
    }

    const configs = loadProviderConfigs();

    // Environment variables for all functions
    const environment = {
      MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017",
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "poc-sst",
      JWT_SECRET: process.env.JWT_SECRET || "poc-sst-secret-key-change-in-production",
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
    };

    // API Gateway para rotas HTTP
    const api = new sst.aws.ApiGatewayV2("Api");

    // Filas SQS
    const queues: Record<string, sst.aws.Queue> = {};
    const dlqs: Record<string, sst.aws.Queue> = {};

    // Armazenar funções criadas
    const functions: Record<string, sst.aws.Function> = {};

    // Primeiro passo: criar todas as funções (exceto userApprovalTrigger que é criada depois)
    for (const config of configs) {
      // Pular userApprovalTrigger - será criado com configurações especiais
      if (config.name === "userApprovalTrigger") {
        continue;
      }

      const functionName = `${$app.name}-${$app.stage}-${config.name}`;
      
      functions[config.name] = new sst.aws.Function(config.name, {
        handler: config.handler,
        environment,
        transform: {
          function: {
            name: functionName,
          },
        },
      });
    }

    // ============================================
    // Step Function: User Approval Workflow
    // ============================================
    const validateUserFn = functions["validateUser"];
    const registerUserFn = functions["registerUser"];

    let workflow: aws.sfn.StateMachine | undefined;

    if (validateUserFn && registerUserFn) {
      // IAM Role para Step Function
      const stepFunctionRole = new aws.iam.Role("UserApprovalWorkflowRole", {
        assumeRolePolicy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "states.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        }),
      });

      // Policy para invocar Lambdas
      new aws.iam.RolePolicy("UserApprovalWorkflowPolicy", {
        role: stepFunctionRole.id,
        policy: $interpolate`{
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": ["lambda:InvokeFunction"],
              "Resource": [
                "${validateUserFn.arn}",
                "${registerUserFn.arn}"
              ]
            }
          ]
        }`,
      });

      // Definição da Step Function
      const definition = $interpolate`{
        "Comment": "User Approval Workflow - Validates and registers users",
        "StartAt": "ValidateUser",
        "States": {
          "ValidateUser": {
            "Type": "Task",
            "Resource": "${validateUserFn.arn}",
            "Next": "CheckValidation",
            "Catch": [
              {
                "ErrorEquals": ["States.ALL"],
                "Next": "ValidationFailed"
              }
            ]
          },
          "CheckValidation": {
            "Type": "Choice",
            "Choices": [
              {
                "Variable": "$.isValid",
                "BooleanEquals": true,
                "Next": "RegisterUser"
              }
            ],
            "Default": "ValidationFailed"
          },
          "RegisterUser": {
            "Type": "Task",
            "Resource": "${registerUserFn.arn}",
            "End": true,
            "Catch": [
              {
                "ErrorEquals": ["States.ALL"],
                "Next": "RegistrationFailed"
              }
            ]
          },
          "ValidationFailed": {
            "Type": "Fail",
            "Error": "ValidationError",
            "Cause": "User validation failed"
          },
          "RegistrationFailed": {
            "Type": "Fail",
            "Error": "RegistrationError",
            "Cause": "User registration failed"
          }
        }
      }`;

      workflow = new aws.sfn.StateMachine("UserApprovalWorkflow", {
        name: `${$app.name}-${$app.stage}-UserApprovalWorkflow`,
        roleArn: stepFunctionRole.arn,
        definition,
      });

      // Criar trigger com link para Step Function
      const triggerFunctionName = `${$app.name}-${$app.stage}-userApprovalTrigger`;
      
      // IAM Role para Lambda invocar Step Function e ler SQS
      const triggerRole = new aws.iam.Role("UserApprovalTriggerRole", {
        assumeRolePolicy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "lambda.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        }),
        managedPolicyArns: [
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
          "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole",
        ],
      });

      new aws.iam.RolePolicy("UserApprovalTriggerPolicy", {
        role: triggerRole.id,
        policy: $interpolate`{
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": ["states:StartExecution"],
              "Resource": "${workflow.arn}"
            }
          ]
        }`,
      });

      // Recriar função trigger com as permissões corretas
      functions["userApprovalTrigger"] = new sst.aws.Function("userApprovalTriggerFn", {
        handler: "src/interfaces/stepfunctions/user-approval/trigger.handler",
        environment: {
          ...environment,
          STEP_FUNCTION_ARN: workflow.arn,
        },
        transform: {
          function: {
            name: triggerFunctionName,
            role: triggerRole.arn,
          },
        },
      });
    }

    // Segundo passo: configurar rotas HTTP
    for (const config of configs) {
      if (config.event.type === "http") {
        const route = `${config.event.method} ${config.event.path}`;
        api.route(route, functions[config.name].arn);
      }
    }

    // Terceiro passo: configurar filas SQS
    for (const config of configs) {
      if (config.event.type === "sqs") {
        const queueName = config.event.queueName!;

        if (!queues[queueName]) {
          // Criar DLQ se configurada
          if (config.event.dlq?.enabled) {
            const dlqName = `${queueName}DLQ`;
            dlqs[dlqName] = new sst.aws.Queue(dlqName);

            queues[queueName] = new sst.aws.Queue(queueName, {
              dlq: {
                queue: dlqs[dlqName].arn,
                retry: config.event.dlq.maxReceiveCount ?? 3,
              },
            });
          } else {
            queues[queueName] = new sst.aws.Queue(queueName);
          }
        }

        // Configurar subscriber com opções
        const subscriberOptions: Record<string, any> = {};

        if (config.event.batchSize) {
          subscriberOptions.batch = { size: config.event.batchSize };
        }

        if (config.event.maximumConcurrency) {
          subscriberOptions.transform = {
            eventSourceMapping: (args: Record<string, any>) => {
              args.scalingConfig = {
                maximumConcurrency: config.event.maximumConcurrency,
              };
            },
          };
        }

        queues[queueName].subscribe(functions[config.name].arn, subscriberOptions);
      }
    }

    return {
      apiUrl: api.url,
      ...(workflow && { UserApprovalWorkflowArn: workflow.arn }),
      ...Object.fromEntries(
        Object.entries(queues).map(([name, queue]) => [`${name}Url`, queue.url])
      ),
      ...Object.fromEntries(
        Object.entries(dlqs).map(([name, queue]) => [`${name}Url`, queue.url])
      ),
    };
  },
});
