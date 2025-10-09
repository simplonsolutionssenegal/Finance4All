import type { EntityId } from '@/domain/shared/EntityId';
import type { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { DomainEntity } from '@/domain/shared/Entity';

export interface InstitutionProps {
  id: EntityId;
  name: string;
  description: string;
  website: UrlValueObject;
  geographicZones: string[];
  status: InstitutionStatus;
  logoUrl: UrlValueObject;
}

export enum InstitutionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export class Institution extends DomainEntity<EntityId> {
  private _name: string;
  private _description: string;
  private _website: UrlValueObject;
  private _geographicZones: Set<string>;
  private _status: InstitutionStatus;
  private _logoUrl: UrlValueObject;

  constructor(props: InstitutionProps) {
    super(props.id);
    this._name = props.name;
    this._description = props.description;
    this._website = props.website;
    this._geographicZones = new Set(props.geographicZones);
    this._status = props.status;
    this._logoUrl = props.logoUrl;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get website(): UrlValueObject {
    return this._website;
  }

  get geographicZones(): string[] {
    return Array.from(this._geographicZones);
  }

  get status(): InstitutionStatus {
    return this._status;
  }

  activate(): void {
    this._status = InstitutionStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = InstitutionStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  pending(): void {
    this._status = InstitutionStatus.PENDING;
    this._updatedAt = new Date();
  }

  get logoUrl(): UrlValueObject {
    return this._logoUrl;
  }

  addGeographicZone(zone: string): void {
    this._geographicZones.add(zone);
    this._updatedAt = new Date();
  }

  removeGeographicZone(zone: string): void {
    this._geographicZones.delete(zone);
    this._updatedAt = new Date();
  }

  operatesInZone(zone: string): boolean {
    return this._geographicZones.has(zone);
  }

  updateName(name: string): void {
    this._name = name;
    this._updatedAt = new Date();
  }

  updateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }
    this._description = description;
    this._updatedAt = new Date();
  }

  updateWebsite(website: UrlValueObject): void {
    this._website = website;
    this._updatedAt = new Date();
  }

  updateLogo(logoUrl: UrlValueObject): void {
    this._logoUrl = logoUrl;
    this._updatedAt = new Date();
  }
}
