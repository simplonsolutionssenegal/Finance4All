import { Request, Response } from 'express';

export class UserController {
  constructor() {}

  async create(req: Request, res: Response) {
    const { name, email } = req.body;
    res.status(201).json({});
  }
}
