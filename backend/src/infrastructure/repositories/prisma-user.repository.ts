
import { Prisma, PrismaClient, UserStatus, } from '@prisma/client';
import { User } from '@/domain/models/user.entity';
import { Role } from '@/domain/models/role.entity';
import { UserRepositoryPort } from '@/ports/user.repository.port';
import { Organisation } from '@/domain/models/organisation.entity';

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepositoryPort {
    async findAll(): Promise<User[]> {
        const users = await prisma.user.findMany({
            include: {
                role: true,
                organisation: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return users.map(u => new User(
            u.id,
            u.email,
            u.username,
            u.firstName,
            u.lastName,
            u.avatar,
            u.password,
            u.isActive,
            new Role(u.role.id, u.role.name, u.role.createdAt, u.role.updatedAt),
            u.status,
            u.lastLoginAt,
            u.organisationId, // ajoute organisationId
            u.organisation ? new Organisation(
                u.organisation.id,
                u.organisation.name,
                u.organisation.avatar || '',
                u.organisation.address,
                u.organisation.phone,
                u.organisation.createdAt,
                u.organisation.updatedAt
            ) : null, // ajoute l'objet organisation
            u.createdAt,
            u.updatedAt
        ));
    }

    async create(data: {
        email: string;
        username: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        status: UserStatus,
        lastLoginAt: Date,
        avatar?: string;
        password: string;
        isActive?: boolean;
        roleId: number;
    }): Promise<User> {
        const user = await prisma.user.create({
            data,
            include: { role: true, organisation: true }
        });

        return new User(
            user.id,
            user.email,
            user.username,
            user.firstName,
            user.lastName,
            user.avatar,
            user.password,
            user.isActive,
            new Role(user.role.id, user.role.name, user.role.createdAt, user.role.updatedAt),
            user.status, // ✅ status avant lastLoginAt
            user.lastLoginAt, // ✅ date à la bonne position
            user.organisationId ?? null, // organisationId
            user.organisation
                ? new Organisation(
                    user.organisation.id,
                    user.organisation.name,
                    user.organisation.avatar ?? '',
                    user.organisation.address,
                    user.organisation.phone,
                    user.organisation.createdAt,
                    user.organisation.updatedAt
                )
                : null, // organisation
            user.createdAt,
            user.updatedAt
        );
    }

    async findUsersByStatus(statuses: UserStatus[]): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: { 
                status: { in: statuses }
            },
            include: {
                role: true,
                organisation: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return users.map(u => new User(
            u.id,
            u.email,
            u.username,
            u.firstName,
            u.lastName,
            u.avatar,
            u.password,
            u.isActive,
            new Role(u.role.id, u.role.name, u.role.createdAt, u.role.updatedAt),
            u.status,
            u.lastLoginAt,
            u.organisationId,
            u.organisation ? new Organisation(
                u.organisation.id,
                u.organisation.name,
                u.organisation.avatar || '',
                u.organisation.address,
                u.organisation.phone,
                u.organisation.createdAt,
                u.organisation.updatedAt
            ) : null,
            u.createdAt,
            u.updatedAt
        ));
    }

    async findUsersByOrganisationAndStatus(organisationId: number, statuses: UserStatus[]): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: { 
                organisationId,
                status: { in: statuses }
            },
            include: {
                role: true,
                organisation: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return users.map(u => new User(
            u.id,
            u.email,
            u.username,
            u.firstName,
            u.lastName,
            u.avatar,
            u.password,
            u.isActive,
            new Role(u.role.id, u.role.name, u.role.createdAt, u.role.updatedAt),
            u.status,
            u.lastLoginAt,
            u.organisationId,
            u.organisation ? new Organisation(
                u.organisation.id,
                u.organisation.name,
                u.organisation.avatar || '',
                u.organisation.address,
                u.organisation.phone,
                u.organisation.createdAt,
                u.organisation.updatedAt
            ) : null,
            u.createdAt,
            u.updatedAt
        ));
    }

    async findByOrganisationId(organisationId: number): Promise<User[]> {
        const users = await prisma.user.findMany({
            where: { organisationId },
            include: {
                role: true,
                organisation: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return users.map(u => new User(
            u.id,
            u.email,
            u.username,
            u.firstName,
            u.lastName,
            u.avatar,
            u.password,
            u.isActive,
            new Role(u.role.id, u.role.name, u.role.createdAt, u.role.updatedAt),
            u.status, // ✅ status avant lastLoginAt
            u.lastLoginAt, // ✅ date à la bonne position
            u.organisationId ?? null,
            u.organisation ? new Organisation(
                u.organisation.id,
                u.organisation.name,
                u.organisation.avatar || '',
                u.organisation.address,
                u.organisation.phone,
                u.organisation.createdAt,
                u.organisation.updatedAt
            ) : null,
            u.createdAt,
            u.updatedAt
        ));
    }

    
}

