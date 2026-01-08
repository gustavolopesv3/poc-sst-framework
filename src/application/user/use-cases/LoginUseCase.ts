import * as jwt from "jsonwebtoken";
import { InvalidCredentialsError } from "../../../domain/user/errors/UserErrors";
import { IUserRepository } from "../../../domain/user/repository/IUserRepository";
import { LoginDTO, LoginResponseDTO } from "../dtos/UserDTO";

const JWT_SECRET = process.env.JWT_SECRET || "poc-sst-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: LoginDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await user.comparePassword(data.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email.value,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email.value,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }
}

