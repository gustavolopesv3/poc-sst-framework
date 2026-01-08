import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { badRequest } from "../../shared/response";
import { CreateUserDTO, UpdateUserDTO } from "../../../../application/user/dtos/UserDTO";

// Returns null if valid, or error response if invalid
export function validateCreateUser(body: Partial<CreateUserDTO>): APIGatewayProxyResultV2 | null {
  if (!body.name?.trim()) {
    return badRequest("Name is required");
  }

  if (body.name.trim().length < 2) {
    return badRequest("Name must have at least 2 characters");
  }

  if (!body.email?.trim()) {
    return badRequest("Email is required");
  }

  if (!body.password) {
    return badRequest("Password is required");
  }

  if (body.password.length < 6) {
    return badRequest("Password must have at least 6 characters");
  }

  return null;
}

export function validateUpdateUser(body: Partial<UpdateUserDTO>): APIGatewayProxyResultV2 | null {
  if (!body.name?.trim() && !body.email?.trim() && !body.password) {
    return badRequest("At least name, email or password must be provided");
  }

  if (body.name && body.name.trim().length < 2) {
    return badRequest("Name must have at least 2 characters");
  }

  if (body.password && body.password.length < 6) {
    return badRequest("Password must have at least 6 characters");
  }

  return null;
}

export function validateUserId(id: string | undefined): APIGatewayProxyResultV2 | null {
  if (!id?.trim()) {
    return badRequest("User ID is required");
  }

  return null;
}
