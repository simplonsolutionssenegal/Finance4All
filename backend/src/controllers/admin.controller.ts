import { Request, Response } from 'express';
import * as AdminService from '../services/admin.service';

export const createAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.createAdmin(req.body);
  res.status(201).json(result);
};

export const getAdmins = async (req: Request, res: Response) => {
  const result = await AdminService.getAdmins();
  res.json(result);
};

export const getAdminById = async (req: Request, res: Response) => {
  const result = await AdminService.getAdminById(req.params.id);
  res.json(result);
};

export const updateAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.updateAdmin(req.params.id, req.body);
  res.json(result);
};

export const deleteAdmin = async (req: Request, res: Response) => {
  await AdminService.deleteAdmin(req.params.id);
  res.status(204).send();
};
