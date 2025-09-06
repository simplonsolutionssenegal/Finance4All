export class Organisation {
  constructor(
    public id: number,
    public name: string,
    public avatar: string | null,
    public address: string,
    public phone: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}