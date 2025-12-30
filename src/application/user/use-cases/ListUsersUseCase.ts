import { IUserRepository } from "../../../domain/user/repository/IUserRepository";
import { UserResponseDTO } from "../dtos/UserDTO";

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => user.toJSON() as UserResponseDTO);
  }
}

