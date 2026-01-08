import type { APIGatewayProxyResultV2 } from "aws-lambda";

const defaultHeaders = {
  "Content-Type": "application/json",
};

export function success<T>(data: T, statusCode = 200): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(data),
  };
}

export function created<T>(data: T): APIGatewayProxyResultV2 {
  return success(data, 201);
}

export function noContent(): APIGatewayProxyResultV2 {
  return {
    statusCode: 204,
    headers: defaultHeaders,
    body: "",
  };
}

export function badRequest(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    headers: defaultHeaders,
    body: JSON.stringify({ error: message }),
  };
}

export function unauthorized(message = "Unauthorized"): APIGatewayProxyResultV2 {
  return {
    statusCode: 401,
    headers: defaultHeaders,
    body: JSON.stringify({ error: message }),
  };
}

export function notFound(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 404,
    headers: defaultHeaders,
    body: JSON.stringify({ error: message }),
  };
}

export function conflict(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 409,
    headers: defaultHeaders,
    body: JSON.stringify({ error: message }),
  };
}

export function serverError(message = "Internal server error"): APIGatewayProxyResultV2 {
  return {
    statusCode: 500,
    headers: defaultHeaders,
    body: JSON.stringify({ error: message }),
  };
}
