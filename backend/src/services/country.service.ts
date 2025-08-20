import { CountryModel } from '../models/schemas/country.schema';
import { ICountry } from '../models/interfaces/country.interface';

export const createCountry = async (data: Partial<ICountry>) => {
  return await CountryModel.create(data);
};

export const getCountries = async () => {
  return await CountryModel.find();
};

export const getCountryById = async (id: string) => {
  const country = await CountryModel.findById(id);
  if (!country) throw new Error('Pays introuvable');
  return country;
};

export const updateCountry = async (id: string, data: Partial<ICountry>) => {
  const country = await CountryModel.findByIdAndUpdate(id, data, { new: true });
  if (!country) throw new Error('Pays introuvable');
  return country;
};

export const deleteCountry = async (id: string) => {
  const country = await CountryModel.findByIdAndDelete(id);
  if (!country) throw new Error('Pays introuvable');
  return country;
};
