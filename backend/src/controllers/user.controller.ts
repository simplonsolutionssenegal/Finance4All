import { toggleUserActiveStatus, updateUserRole } from "../services/user.service";
import { Request, Response } from "express";

export const changeRole = async (req: Request, res: Response) => {
    try {
      const { userId, newRole } = req.body;
      const updatedUser = await updateUserRole(userId, newRole);
      res.json({ message: 'Rôle mis à jour', user: updatedUser });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };
  
  export const disableOrEnableUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const updatedUser = await toggleUserActiveStatus(userId);
      res.json({ message: 'Statut utilisateur mis à jour', user: updatedUser });
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  };
  