import mongoose, { Schema } from 'mongoose';
import { IToken } from '../interfaces/token.interface';

const tokenSchema = new Schema<IToken>(
  {
    userId: { type: Schema.Types.ObjectId , ref: 'User', required: true },
    token: { type: String, required: true },
    type: { type: String, enum: ['RESET_PASSWORD', 'ACCESS'], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const TokenModel = mongoose.model<IToken>('Token', tokenSchema);
