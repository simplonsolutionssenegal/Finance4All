import { DomainEntity } from '@/domain/shared/Entity';
import type { EntityId } from '@/domain/shared/EntityId';
import { type Frais } from '@/domain/institutions/entities/Frais';
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';

export enum TypeService {
  PAIEMENT_MARCHAND = 'paiement marchand',
  ACHAT_CREDIT = 'achat de crédit',
  PAIEMENT_FACTURES = 'paiement de factures',
  DEPOT_SIMPLE = 'dépôts simples',
  DEPOT_RETRAIT_SIMPLE = 'dépôts et retraits simples',
  RETRAIT_SIMPLE = 'retraits simples',
  TRANSFERT_ARGENT = "transferts d'argent",
  BANQUE_WALLET = 'banque vers wallet',
  WALLET_BANQUE = 'wallet vers banque',
  EPARGNE = 'épargne',
  CREDIT = 'crédit',
  ASSURANCE = 'assurance',
  AUTRES = 'autres services',
}

export enum TypeCalculation {
  FREE = 'fee',
  POURCENTAGE = 'pourcentage',
  FIX = 'fix',
}

interface SerciceProps {
  id: EntityId;
  name: string;
  longName: string;
  type: TypeService;
  frais: Frais;
  typeFrais: TypeCalculation;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}

export class Service extends DomainEntity<EntityId> {
  private _name: string;
  private _longName: string;
  private _type: TypeService;
  private _typeFrais: TypeCalculation;
  private _frais: Frais;
  private _conditionAccess: string[];
  private _plafonds: string[];
  private _infrastructureAccess: string[];

  constructor(service: SerciceProps) {
    super(service.id);
    this._name = service.name;
    this._longName = service.longName;
    this._type = service.type;
    this._typeFrais = service.typeFrais;
    this._frais = service.frais;
    this._conditionAccess = service.conditionAccess;
    this._plafonds = service.plafonds;
    this._infrastructureAccess = service.infrastructureAccess;
  }

  get name(): string {
    return this._name;
  }

  get longName(): string {
    return this._longName;
  }

  get type(): TypeService {
    return this._type;
  }

  get frais(): Frais {
    return this._frais;
  }

  get conditionAccess(): string[] {
    return this._conditionAccess;
  }

  get plafonds(): string[] {
    return this._plafonds;
  }

  get infrastructureAccess(): string[] {
    return this._infrastructureAccess;
  }

  get typeFrais(): TypeCalculation {
    // Ajout
    return this._typeFrais;
  }

  public toDTO(): ServiceDTO {
    return {
      id: this.id.getValue(),
      name: this._name,
      longName: this._longName,
      type: this._type,
      typeFrais: this._typeFrais,
      frais: this._frais.toDTO(),
      conditionAccess: this._conditionAccess,
      plafonds: this._plafonds,
      infrastructureAccess: this._infrastructureAccess,
    };
  }
}
