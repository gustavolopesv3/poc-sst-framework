import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { parseBody, getPathParam } from "../shared/request-parser";
import { handleError } from "../shared/error-handler";
import { container } from "../shared/container";
import { success } from "../shared/response";
import { validateUserId, validateUpdateUser } from "./validators/user-validators";
import { UpdateUserDTO } from "../../../application/user/dtos/UserDTO";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const id = getPathParam(event, "id");
    const body = parseBody<UpdateUserDTO>(event);

    const idError = validateUserId(id);
    if (idError) return idError;

    const bodyError = validateUpdateUser(body);
    if (bodyError) return bodyError;

    const useCase = container.updateUserUseCase();
    const user = await useCase.execute(id!, body);

    return success(user);
  } catch (error) {
    return handleError(error, "updateUser");
  }
};
