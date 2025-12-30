import { UserNotFoundError } from "../../../domain/user/errors/UserErrors";
import { IUserRepository } from "../../../domain/user/repository/IUserRepository";
import { UserResponseDTO } from "../dtos/UserDTO";

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    return user.toJSON() as UserResponseDTO;
  }
}

