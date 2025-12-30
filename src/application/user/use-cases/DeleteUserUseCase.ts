import { UserNotFoundError } from "../../../domain/user/errors/UserErrors";
import { IUserRepository } from "../../../domain/user/repository/IUserRepository";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new UserNotFoundError(id);
    }

    await this.userRepository.delete(id);
  }
}

