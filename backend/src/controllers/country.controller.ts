import { Request, Response } from 'express';
import * as CountryService from '../services/country.service';

export const createCountry = async (req: Request, res: Response) => {
  const country = await CountryService.createCountry(req.body);
  res.status(201).json(country);
};

export const getCountries = async (_req: Request, res: Response) => {
  const countries = await CountryService.getCountries();
  res.status(200).json(countries);
};

export const getCountryById = async (req: Request, res: Response) => {
  const country = await CountryService.getCountryById(req.params.id);
  res.status(200).json(country);
};

export const updateCountry = async (req: Request, res: Response) => {
  const country = await CountryService.updateCountry(req.params.id, req.body);
  res.status(200).json(country);
};

export const deleteCountry = async (req: Request, res: Response) => {
  const country = await CountryService.deleteCountry(req.params.id);
  res.status(200).json(country);
};
