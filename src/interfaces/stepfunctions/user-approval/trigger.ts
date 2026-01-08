import type { SQSEvent } from "aws-lambda";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const sfnClient = new SFNClient({});

export const handler = async (event: SQSEvent): Promise<void> => {
  console.log("Received SQS messages:", JSON.stringify(event));

  const stateMachineArn = process.env.STEP_FUNCTION_ARN;

  if (!stateMachineArn) {
    throw new Error("STEP_FUNCTION_ARN environment variable is not set");
  }

  for (const record of event.Records) {
    try {
      const messageBody = JSON.parse(record.body);

      console.log("Processing message:", JSON.stringify(messageBody));

      // Iniciar execução da Step Function
      const command = new StartExecutionCommand({
        stateMachineArn,
        input: JSON.stringify({
          userData: messageBody,
        }),
      });

      const response = await sfnClient.send(command);

      console.log("Step Function execution started:", response.executionArn);
    } catch (error) {
      console.error("Error processing message:", error);
      throw error; // Re-throw to mark message as failed
    }
  }
};
