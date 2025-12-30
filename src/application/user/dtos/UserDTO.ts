export interface CreateUserDTO {
  name: string;
  email: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

