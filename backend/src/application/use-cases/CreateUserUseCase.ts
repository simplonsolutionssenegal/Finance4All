import { User } from "@prisma/client";
export interface CreateUserUseCase {
  execute(name: string): Promise<User>;
}