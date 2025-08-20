import { Types } from 'mongoose';

export interface IToken {
    _id?: string;
    userId: Types.ObjectId;
    token: string;
    type: 'RESET_PASSWORD' | 'ACCESS';
    expiresAt: Date;
    createdAt?: Date;
  }
   