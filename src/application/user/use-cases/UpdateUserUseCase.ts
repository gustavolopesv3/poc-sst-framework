import { Email } from "../../../domain/user/value-objects/Email";
import { UserNotFoundError, UserAlreadyExistsError } from "../../../domain/user/errors/UserErrors";
import { IUserRepository } from "../../../domain/user/repository/IUserRepository";
import { UpdateUserDTO, UserResponseDTO } from "../dtos/UserDTO";

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, data: UpdateUserDTO): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    if (data.email) {
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new UserAlreadyExistsError(data.email);
      }
      user.updateEmail(new Email(data.email));
    }

    if (data.name) {
      user.updateName(data.name);
    }

    const updatedUser = await this.userRepository.update(user);

    return updatedUser.toJSON() as UserResponseDTO;
  }
}

