import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getPathParam } from "../shared/request-parser";
import { handleError } from "../shared/error-handler";
import { container } from "../shared/container";
import { success } from "../shared/response";
import { validateUserId } from "./validators/user-validators";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const id = getPathParam(event, "id");

    const validationError = validateUserId(id);
    if (validationError) return validationError;

    const useCase = container.getUserUseCase();
    const user = await useCase.execute(id!);

    return success(user);
  } catch (error) {
    return handleError(error, "getUser");
  }
};
