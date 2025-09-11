export class Organization {
  constructor(
    public id: string,
    public name: string,
    public type: string,
    public description: string,
    public status?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}