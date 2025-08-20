import { Types } from 'mongoose';

export interface IAdmin {
    _id?: string;
    userId: Types.ObjectId;
    country: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
  }
  