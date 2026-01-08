import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { buildOpenApiSpec } from "./openapi-spec";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const host = event.headers.host || "localhost";
  const protocol = event.headers["x-forwarded-proto"] || "https";
  const apiUrl = `${protocol}://${host}`;

  const spec = buildOpenApiSpec(apiUrl);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(spec, null, 2),
  };
};
