import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { handleError } from "../shared/error-handler";
import { container } from "../shared/container";
import { success } from "../shared/response";

export const handler = async (): Promise<APIGatewayProxyResultV2> => {
  try {
    const useCase = container.listUsersUseCase();
    const users = await useCase.execute();

    return success(users);
  } catch (error) {
    return handleError(error, "listUsers");
  }
};
