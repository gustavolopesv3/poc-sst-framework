import type { APIGatewayProxyEventV2 } from "aws-lambda";

export function parseBody<T>(event: APIGatewayProxyEventV2): T {
  try {
    return JSON.parse(event.body || "{}") as T;
  } catch {
    return {} as T;
  }
}

export function getPathParam(event: APIGatewayProxyEventV2, name: string): string | undefined {
  return event.pathParameters?.[name];
}

export function getQueryParam(event: APIGatewayProxyEventV2, name: string): string | undefined {
  return event.queryStringParameters?.[name];
}

