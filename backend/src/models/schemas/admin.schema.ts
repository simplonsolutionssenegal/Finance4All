import mongoose, { Schema, Types } from 'mongoose';
import { IAdmin } from '../interfaces/admin.interface';

const adminSchema = new Schema<IAdmin>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: Schema.Types.ObjectId, ref: 'country', required: true },
  },
  { timestamps: true }
);

export const AdminModel = mongoose.model<IAdmin>('Admin', adminSchema);
