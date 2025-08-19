import mongoose, { Schema } from 'mongoose';
import { IOrganisation } from '../interfaces/Organisation.interface';

const organisationSchema = new Schema<IOrganisation>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    logoUrl: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country', required: true },
  },
  { timestamps: true }
);

export const OrganisationModel = mongoose.model<IOrganisation>('Organisation', organisationSchema);
