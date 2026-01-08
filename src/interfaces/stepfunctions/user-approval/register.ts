import { CreateUserUseCase } from "../../../application/user/use-cases/CreateUserUseCase";
import { MongoUserRepository } from "../../../infrastructure/database/mongodb/repositories/MongoUserRepository";
import { CreateUserDTO, UserResponseDTO } from "../../../application/user/dtos/UserDTO";

interface StepFunctionEvent {
  isValid: boolean;
  userData: CreateUserDTO;
}

interface StepFunctionOutput {
  success: boolean;
  user?: UserResponseDTO;
  error?: string;
}

export const handler = async (event: StepFunctionEvent): Promise<StepFunctionOutput> => {
  console.log("Registering user:", JSON.stringify(event));

  try {
    const userRepository = new MongoUserRepository();
    const createUserUseCase = new CreateUserUseCase(userRepository);

    const user = await createUserUseCase.execute(event.userData);

    console.log("User registered successfully:", JSON.stringify(user));

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error registering user:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};


