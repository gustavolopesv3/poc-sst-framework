import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { parseBody } from "../shared/request-parser";
import { handleError } from "../shared/error-handler";
import { container } from "../shared/container";
import { created } from "../shared/response";
import { validateCreateUser } from "./validators/user-validators";
import { CreateUserDTO } from "../../../application/user/dtos/UserDTO";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = parseBody<CreateUserDTO>(event);

    const validationError = validateCreateUser(body);
    if (validationError) return validationError;

    const useCase = container.createUserUseCase();
    const user = await useCase.execute(body);

    return created(user);
  } catch (error) {
    return handleError(error, "createUser");
  }
};
