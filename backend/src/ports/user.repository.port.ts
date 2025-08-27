import { User } from '@/domain/models/user.entity';

export interface UserRepositoryPort {
    findAll(): Promise<User[]>;
    findByOrganisationId(organisationId: number): Promise<User[]>; // ✅ Ajout ici
    create(data: {
        email: string; 
        firstName: string,
        lastName: string,
        avatar: string,
        isActive: boolean,
        username: string; 
        password: string; 
        roleId: number
    }): Promise<User>;


    
}