import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { UserRole } from '../../constant/roles';
import { status } from '../../constant/statut';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string;
  status: status;
  country: Types.ObjectId;
  organisationId?: Types.ObjectId;
  isAdminOrganisation?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
