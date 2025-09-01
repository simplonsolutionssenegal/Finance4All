import { User } from '@/domain/models/user.entity';
import { UserStatus } from '@prisma/client';

export interface UserRepositoryPort {
    findAll(): Promise<User[]>;
    findByOrganisationId(organisationId: number): Promise<User[]>; // ✅ Ajout ici
    create(data: {
        email: string; 
        firstName: string,
        lastName: string,
        status : UserStatus,
        lastLoginAt : Date,
        avatar: string,
        isActive: boolean,
        username: string; 
        password: string; 
        roleId: number
    }): Promise<User>;


    
}