import mongoose, { Schema } from 'mongoose';
import { UserRole } from '../../constant/roles';
import { IUser } from '../interfaces/User.interface';
import { status } from '../../constant/statut';

const userSchema = new Schema<IUser>({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: Object.values(status), default: status.ACTIF },
  country: { type: Schema.Types.ObjectId, required: true },
  organisationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', default: null },
  isAdminOrganisation: { type: Boolean, default: false },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', userSchema);
