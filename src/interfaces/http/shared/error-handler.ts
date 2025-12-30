import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { UserNotFoundError, UserAlreadyExistsError, InvalidUserDataError } from "../../../domain/user/errors/UserErrors";
import { badRequest, notFound, conflict, serverError } from "./response";

export function handleError(error: unknown, context: string): APIGatewayProxyResultV2 {
  console.error(`Error in ${context}:`, error);

  if (error instanceof UserNotFoundError) {
    return notFound(error.message);
  }

  if (error instanceof UserAlreadyExistsError) {
    return conflict(error.message);
  }

  if (error instanceof InvalidUserDataError) {
    return badRequest(error.message);
  }

  if (error instanceof Error && error.message.includes("Invalid email")) {
    return badRequest(error.message);
  }

  return serverError();
}

