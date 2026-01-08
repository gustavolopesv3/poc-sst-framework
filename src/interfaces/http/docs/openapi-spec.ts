// OpenAPI Spec - Adicione novos endpoints aqui de forma simples

// ============ SCHEMAS ============
const schemas = {
  CreateUserRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string", minLength: 2, example: "João Silva" },
      email: { type: "string", format: "email", example: "joao@email.com" },
      password: { type: "string", minLength: 6, example: "senha123" },
    },
  },
  UpdateUserRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 2, example: "João Santos" },
      email: { type: "string", format: "email", example: "joao@email.com" },
      password: { type: "string", minLength: 6, example: "novasenha" },
    },
  },
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "joao1@email.com" },
      password: { type: "string", example: "senha123" },
    },
  },
  UserResponse: {
    type: "object",
    properties: {
      id: { type: "string", example: "507f1f77bcf86cd799439011" },
      name: { type: "string", example: "João Silva" },
      email: { type: "string", example: "joao@email.com" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },
  LoginResponse: {
    type: "object",
    properties: {
      token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
      user: { $ref: "#/components/schemas/UserResponse" },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      error: { type: "string", example: "Error message" },
    },
  },
};

// ============ HELPERS ============
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name: string) => ({ type: "array", items: ref(name) });

const jsonContent = (schema: any) => ({
  content: { "application/json": { schema } },
});

const pathParam = (name: string, description = "ID") => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
  description,
  example: "507f1f77bcf86cd799439011",
});

// ============ ENDPOINTS ============
// Adicione novos endpoints aqui - formato simplificado!

const paths = {
  // AUTH
  "/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login",
      description: "Autentica e retorna JWT",
      requestBody: { required: true, ...jsonContent(ref("LoginRequest")) },
      responses: {
        "200": { description: "Sucesso", ...jsonContent(ref("LoginResponse")) },
        "401": { description: "Credenciais inválidas", ...jsonContent(ref("ErrorResponse")) },
      },
    },
  },

  // USERS
  "/users": {
    get: {
      tags: ["Users"],
      summary: "Listar usuários",
      responses: {
        "200": { description: "Lista de usuários", ...jsonContent(arrayOf("UserResponse")) },
      },
    },
    post: {
      tags: ["Users"],
      summary: "Criar usuário",
      requestBody: { required: true, ...jsonContent(ref("CreateUserRequest")) },
      responses: {
        "201": { description: "Criado", ...jsonContent(ref("UserResponse")) },
        "400": { description: "Dados inválidos", ...jsonContent(ref("ErrorResponse")) },
        "409": { description: "Email existe", ...jsonContent(ref("ErrorResponse")) },
      },
    },
  },

  "/users/{id}": {
    get: {
      tags: ["Users"],
      summary: "Buscar usuário",
      parameters: [pathParam("id", "ID do usuário")],
      responses: {
        "200": { description: "Dados do usuário", ...jsonContent(ref("UserResponse")) },
        "404": { description: "Não encontrado", ...jsonContent(ref("ErrorResponse")) },
      },
    },
    put: {
      tags: ["Users"],
      summary: "Atualizar usuário",
      parameters: [pathParam("id", "ID do usuário")],
      requestBody: { required: true, ...jsonContent(ref("UpdateUserRequest")) },
      responses: {
        "200": { description: "Atualizado", ...jsonContent(ref("UserResponse")) },
        "400": { description: "Dados inválidos", ...jsonContent(ref("ErrorResponse")) },
        "404": { description: "Não encontrado", ...jsonContent(ref("ErrorResponse")) },
        "409": { description: "Email existe", ...jsonContent(ref("ErrorResponse")) },
      },
    },
    delete: {
      tags: ["Users"],
      summary: "Deletar usuário",
      parameters: [pathParam("id", "ID do usuário")],
      responses: {
        "204": { description: "Deletado" },
        "404": { description: "Não encontrado", ...jsonContent(ref("ErrorResponse")) },
      },
    },
  },
};

// ============ SPEC COMPLETO ============
export function buildOpenApiSpec(serverUrl: string) {
  return {
    openapi: "3.0.3",
    info: {
      title: "POC SST Framework API",
      version: "1.0.0",
      description: "API Serverless com SST, DDD e MongoDB",
    },
    servers: [{ url: serverUrl, description: "API Server" }],
    tags: [
      { name: "Auth", description: "Autenticação" },
      { name: "Users", description: "Gerenciamento de usuários" },
    ],
    paths,
    components: { schemas },
  };
}

