# POC SST Framework

POC de uma API Serverless usando **SST v3** com arquitetura **DDD (Domain-Driven Design)** e **MongoDB**.

## 🚀 Tecnologias

- **SST v3** - Framework serverless para AWS
- **TypeScript** - Linguagem de programação
- **MongoDB** - Banco de dados NoSQL
- **AWS Lambda** - Funções serverless
- **API Gateway** - Gerenciamento de APIs
- **Node.js 22** - Runtime

## 📁 Estrutura do Projeto (DDD)

```
src/
├── domain/                          # Camada de Domínio
│   └── user/
│       ├── entity/
│       │   └── User.ts              # Entidade User
│       ├── value-objects/
│       │   └── Email.ts             # Value Object Email
│       ├── repository/
│       │   └── IUserRepository.ts   # Interface do repositório
│       └── errors/
│           └── UserErrors.ts        # Erros de domínio
│
├── application/                     # Camada de Aplicação
│   └── user/
│       ├── dtos/
│       │   └── UserDTO.ts           # DTOs de entrada/saída
│       └── use-cases/
│           ├── CreateUserUseCase.ts
│           ├── GetUserUseCase.ts
│           ├── ListUsersUseCase.ts
│           ├── UpdateUserUseCase.ts
│           └── DeleteUserUseCase.ts
│
├── infrastructure/                  # Camada de Infraestrutura
│   └── database/
│       └── mongodb/
│           ├── connection.ts        # Conexão MongoDB
│           └── repositories/
│               └── MongoUserRepository.ts
│
└── interfaces/                      # Camada de Interfaces
    └── http/
        ├── shared/
        │   ├── response.ts          # Helpers de resposta HTTP
        │   ├── request-parser.ts    # Parsing de body e parâmetros
        │   ├── error-handler.ts     # Tratamento centralizado de erros
        │   └── container.ts         # Injeção de dependências
        └── user/
            ├── validators/
            │   └── user-validators.ts
            ├── create.ts            # POST /users
            ├── get.ts               # GET /users/{id}
            ├── list.ts              # GET /users
            ├── update.ts            # PUT /users/{id}
            ├── delete.ts            # DELETE /users/{id}
            └── provider.conf.json   # Configuração das rotas
```

## 🛠️ Pré-requisitos

- Node.js 22 (use `nvm use`)
- MongoDB rodando localmente ou URI de conexão
- AWS CLI configurado com credenciais
- SST CLI

## ⚙️ Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar AWS

```bash
aws configure
# ou
export AWS_PROFILE=seu-profile
```

### 3. Configurar MongoDB

O projeto usa MongoDB local por padrão (`mongodb://localhost:27017`).

Para usar outro MongoDB, defina a variável de ambiente:

```bash
export MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net
export MONGODB_DB_NAME=poc-sst
```

## 🚀 Executando

### Desenvolvimento

```bash
npm run dev
```

### Deploy

```bash
# Staging
npm run deploy:staging

# Production
npm run deploy:production
```

### Remover recursos

```bash
# Staging
npm run remove:staging

# Production
npm run remove:production
```

## 📡 API Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/users` | Criar usuário |
| GET | `/users` | Listar todos os usuários |
| GET | `/users/{id}` | Buscar usuário por ID |
| PUT | `/users/{id}` | Atualizar usuário |
| DELETE | `/users/{id}` | Deletar usuário |

### Exemplos

```bash
# Criar usuário
curl -X POST https://<api-url>/users \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@email.com"}'

# Listar usuários
curl https://<api-url>/users

# Buscar usuário
curl https://<api-url>/users/<id>

# Atualizar usuário
curl -X PUT https://<api-url>/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"name": "João Santos"}'

# Deletar usuário
curl -X DELETE https://<api-url>/users/<id>
```

## 📝 Configuração de Rotas

As rotas são configuradas via `provider.conf.json`:

```json
{
    "routes": [
        {
            "name": "createUser",
            "handler": "src/interfaces/http/user/create.handler",
            "event": {
                "type": "http",
                "path": "/users",
                "method": "POST"
            }
        }
    ]
}
```

### Configuração SQS (opcional)

```json
{
    "name": "queueConsumer",
    "handler": "src/interfaces/sqs/consumer.handler",
    "event": {
        "type": "sqs",
        "queueName": "MyQueue",
        "batchSize": 2,
        "maximumConcurrency": 2,
        "dlq": {
            "enabled": true,
            "maxReceiveCount": 3
        }
    }
}
```

## 🏗️ Arquitetura

### Fluxo de uma requisição HTTP

```
Request → Handler → Validator → UseCase → Repository → MongoDB
                                    ↓
Response ← Handler ← UseCase ← Entity
```

### Princípios seguidos

- **DDD** - Domain-Driven Design
- **Clean Architecture** - Separação de responsabilidades
- **SOLID** - Princípios de design
- **DRY** - Don't Repeat Yourself

## 📦 Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia ambiente de desenvolvimento |
| `npm run deploy:staging` | Deploy para staging |
| `npm run deploy:production` | Deploy para production |
| `npm run remove:staging` | Remove recursos de staging |
| `npm run remove:production` | Remove recursos de production |

## 🔒 Stages

| Stage | Proteção | Remoção |
|-------|----------|---------|
| staging | Não | Automática |
| production | Sim | Retém recursos |

## 📄 Licença

ISC

