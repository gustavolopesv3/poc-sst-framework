import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { badRequest } from "../../shared/response";
import { CreateUserDTO, UpdateUserDTO } from "../../../../application/user/dtos/UserDTO";

// Returns null if valid, or error response if invalid
export function validateCreateUser(body: Partial<CreateUserDTO>): APIGatewayProxyResultV2 | null {
  if (!body.name?.trim()) {
    return badRequest("Name is required");
  }

  if (!body.email?.trim()) {
    return badRequest("Email is required");
  }

  return null;
}

export function validateUpdateUser(body: Partial<UpdateUserDTO>): APIGatewayProxyResultV2 | null {
  if (!body.name?.trim() && !body.email?.trim()) {
    return badRequest("At least name or email must be provided");
  }

  return null;
}

export function validateUserId(id: string | undefined): APIGatewayProxyResultV2 | null {
  if (!id?.trim()) {
    return badRequest("User ID is required");
  }

  return null;
}
