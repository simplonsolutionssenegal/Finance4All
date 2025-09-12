import { User } from './User';
export class Organisation {
  constructor(
    public id: number,
    public name: string,
    public address: string,
    public phone: string,
    public avatar?: string | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public users?: User[],
  ) {}
}
