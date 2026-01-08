import { ValidateUserUseCase } from "../../../application/user/use-cases/ValidateUserUseCase";
import { MongoUserRepository } from "../../../infrastructure/database/mongodb/repositories/MongoUserRepository";
import { CreateUserDTO } from "../../../application/user/dtos/UserDTO";

interface StepFunctionEvent {
  userData: CreateUserDTO;
}

interface StepFunctionOutput {
  isValid: boolean;
  reason?: string;
  userData?: CreateUserDTO;
}

export const handler = async (event: StepFunctionEvent): Promise<StepFunctionOutput> => {
  console.log("Validating user:", JSON.stringify(event));

  const userRepository = new MongoUserRepository();
  const validateUserUseCase = new ValidateUserUseCase(userRepository);

  const result = await validateUserUseCase.execute(event.userData);

  console.log("Validation result:", JSON.stringify(result));

  return result;
};

