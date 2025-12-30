/// <reference path="./.sst/platform/config.d.ts" />

interface RouteConfig {
  name: string;
  handler: string;
  event: {
    type: "http" | "sqs";
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
    };

    // API Gateway para rotas HTTP
    const api = new sst.aws.ApiGatewayV2("Api");

    // Filas SQS
    const queues: Record<string, sst.aws.Queue> = {};
    const dlqs: Record<string, sst.aws.Queue> = {};

    for (const config of configs) {
      if (config.event.type === "http") {
        const route = `${config.event.method} ${config.event.path}`;
        api.route(route, {
          handler: config.handler,
          environment,
        });
      }

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

        queues[queueName].subscribe(
          {
            handler: config.handler,
            environment,
          },
          subscriberOptions
        );
      }
    }

    return {
      apiUrl: api.url,
      ...Object.fromEntries(
        Object.entries(queues).map(([name, queue]) => [`${name}Url`, queue.url])
      ),
      ...Object.fromEntries(
        Object.entries(dlqs).map(([name, queue]) => [`${name}Url`, queue.url])
      ),
    };
  },
});
