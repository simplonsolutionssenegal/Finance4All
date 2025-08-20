import { Request, Response } from 'express';
import * as OrganisationService from '../services/organisation.service';
import { catchAsync } from '../utils/catchAsync';

export const createOrganisation = catchAsync(async (req: Request, res: Response) => {
  const logoFile = req.file;
  if (!logoFile) {
    return res.status(400).json({ message: 'Le logo est requis.' });
  }

  const organisation = await OrganisationService.createOrganisation(req.body, logoFile, req.user);
  res.status(201).json({ message: 'Organisation créée avec succès.', organisation });
});

export const getOrganisations = catchAsync(async (_req: Request, res: Response) => {
  const organisations = await OrganisationService.getOrganisations();
  res.status(200).json({ organisations });
});

export const getOrganisationById = catchAsync(async (req: Request, res: Response) => {
  const organisation = await OrganisationService.getOrganisationById(req.params.id);
  res.status(200).json({ organisation });
});

export const updateOrganisation = catchAsync(async (req: Request, res: Response) => {
  const updated = await OrganisationService.updateOrganisation(req.params.id, req.body);
  res.status(200).json({ message: 'Organisation mise à jour.', organisation: updated });
});

export const deleteOrganisation = catchAsync(async (req: Request, res: Response) => {
  await OrganisationService.deleteOrganisation(req.params.id);
  res.status(200).json({ message: 'Organisation supprimée.' });
});
