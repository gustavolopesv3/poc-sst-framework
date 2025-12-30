import { MongoUserRepository } from "../../../infrastructure/database/mongodb/repositories/MongoUserRepository";
import { CreateUserUseCase } from "../../../application/user/use-cases/CreateUserUseCase";
import { GetUserUseCase } from "../../../application/user/use-cases/GetUserUseCase";
import { ListUsersUseCase } from "../../../application/user/use-cases/ListUsersUseCase";
import { UpdateUserUseCase } from "../../../application/user/use-cases/UpdateUserUseCase";
import { DeleteUserUseCase } from "../../../application/user/use-cases/DeleteUserUseCase";

// Simple dependency injection container
// In a larger project, use a DI library like tsyringe or inversify

const userRepository = new MongoUserRepository();

export const container = {
  createUserUseCase: () => new CreateUserUseCase(userRepository),
  getUserUseCase: () => new GetUserUseCase(userRepository),
  listUsersUseCase: () => new ListUsersUseCase(userRepository),
  updateUserUseCase: () => new UpdateUserUseCase(userRepository),
  deleteUserUseCase: () => new DeleteUserUseCase(userRepository),
};

