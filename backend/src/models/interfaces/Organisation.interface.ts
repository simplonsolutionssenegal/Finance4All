import { Types } from 'mongoose';
export interface IOrganisation {
  _id?: string;
  name: string;
  description: string;
  logoUrl: string;
  email: string;
  phone: string;
  address: string;
  createdBy: Types.ObjectId;
  isActive: boolean;
  country: Types.ObjectId;
}
