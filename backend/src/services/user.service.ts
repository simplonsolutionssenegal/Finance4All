import { PrismaClient } from '@prisma/client';

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}
}
