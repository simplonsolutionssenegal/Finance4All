import type { PrismaClient, StreamToken as PrismaStreamToken } from '@prisma/client';
import { StreamToken } from '@/domain/streaming/entities/StreamToken';
import type { StreamTokenRepository } from '@/domain/streaming/ports/out/StreamTokenRepository';

export class PrismaStreamTokenRepository implements StreamTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(token: StreamToken): Promise<StreamToken> {
    const saved = await this.prisma.streamToken.create({
      data: {
        id: token.id.getValue(),
        userId: token.userId,
        mediaId: token.mediaId,
        token: token.token,
        expiresAt: token.expiresAt,
      },
    });

    return this.toDomain(saved);
  }

  async findByToken(tokenValue: string): Promise<StreamToken | null> {
    const token = await this.prisma.streamToken.findUnique({
      where: { token: tokenValue },
    });

    return token ? this.toDomain(token) : null;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.streamToken.deleteMany({
      where: {
        expiresAt: { lte: new Date() },
      },
    });

    return result.count;
  }

  async deleteByMediaId(mediaId: string): Promise<void> {
    await this.prisma.streamToken.deleteMany({
      where: { mediaId },
    });
  }

  private toDomain(prismaToken: PrismaStreamToken): StreamToken {
    return StreamToken.fromPersistence({
      id: prismaToken.id,
      userId: prismaToken.userId,
      mediaId: prismaToken.mediaId,
      token: prismaToken.token,
      expiresAt: prismaToken.expiresAt,
      createdAt: prismaToken.createdAt,
    });
  }
}
