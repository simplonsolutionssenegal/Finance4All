
import { User } from './User';

export class Role {
  constructor(
    public id: number,
    public name: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public users?: User[],
  ) {}
}