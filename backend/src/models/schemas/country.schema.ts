import mongoose, { Schema } from 'mongoose';
import { ICountry } from '../interfaces/country.interface';

const countrySchema = new Schema<ICountry>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const CountryModel = mongoose.model<ICountry>('Country', countrySchema);
