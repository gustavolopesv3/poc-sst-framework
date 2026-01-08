import { User } from "../../../domain/user/entity/User";
import { UserAlreadyExistsError } from "../../../domain/user/errors/UserErrors";
import { IUserRepository } from "../../../domain/user/repository/IUserRepository";
import { CreateUserDTO, UserResponseDTO } from "../dtos/UserDTO";

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<UserResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new UserAlreadyExistsError(data.email);
    }

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    const createdUser = await this.userRepository.create(user);

    return createdUser.toJSON() as UserResponseDTO;
  }
}
