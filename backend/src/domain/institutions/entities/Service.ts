import { DomainEntity } from '@/domain/shared/Entity';
import type { EntityId } from '@/domain/shared/EntityId';
import type { Frais } from '@/domain/institutions/entities/Frais';

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

interface SerciceProps {
  id: EntityId;
  name: string;
  longName: string;
  type: TypeService;
  frais: Frais;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}

export class Service extends DomainEntity<EntityId> {
  private _name: string;
  private _longName: string;
  private _type: TypeService;
  private _frais: Frais;
  private _conditionAccess: string[];
  private _plafonds: string[];
  private _infrastructureAccess: string[];

  constructor(service: SerciceProps) {
    super(service.id);
    this._name = service.name;
    this._longName = service.longName;
    this._type = service.type;
    this._frais = service.frais;
    this._conditionAccess = service.conditionAccess;
    this._plafonds = service.plafonds;
    this._infrastructureAccess = service.infrastructureAccess;
  }
}
