import { IUserRepository } from "../../../domain/user/repository/IUserRepository";
import { CreateUserDTO } from "../dtos/UserDTO";

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  userData?: CreateUserDTO;
}

export class ValidateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<ValidationResult> {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        isValid: false,
        reason: "Invalid email format",
      };
    }

    // Validar nome
    if (!data.name || data.name.trim().length < 2) {
      return {
        isValid: false,
        reason: "Name must have at least 2 characters",
      };
    }

    // Validar senha
    if (!data.password || data.password.length < 6) {
      return {
        isValid: false,
        reason: "Password must have at least 6 characters",
      };
    }

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      return {
        isValid: false,
        reason: "Email already registered",
      };
    }

    return {
      isValid: true,
      userData: data,
    };
  }
}
