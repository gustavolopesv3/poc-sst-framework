import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { container } from "../shared/container";
import { success, badRequest } from "../shared/response";
import { handleError } from "../shared/error-handler";
import { parseBody } from "../shared/request-parser";
import type { LoginDTO } from "../../../application/user/dtos/UserDTO";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = parseBody<LoginDTO>(event);

    if (!body || !body.email || !body.password) {
      return badRequest("Email and password are required");
    }

    const loginUseCase = container.loginUseCase();
    const result = await loginUseCase.execute(body);

    return success(result);
  } catch (error) {
    return handleError(error, "login");
  }
};

