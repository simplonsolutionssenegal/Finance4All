import type { FraisDTO } from '@/domain/institutions/value-objects/FraisDTO';

export type Money = number;
export type Tranche = { min: Money; max?: Money; fee: Money };

export enum TypeCalculation {
  FREE,
  POURCENTAGE,
  FIX,
}

export type FraisChange = {
  fxSurcharge: Money;
  devise: string;
};

export abstract class Frais {
  abstract readonly _typeCalculation: TypeCalculation;
  abstract describe(): string;
  abstract toDTO(): FraisDTO;
}

export class FraisGratuit extends Frais {
  readonly _typeCalculation = TypeCalculation.FREE;

  describe(): string {
    return 'Gratuit';
  }

  get typeCalculation(): TypeCalculation {
    return this._typeCalculation;
  }

  toDTO(): FraisDTO {
    return {
      typeCalculation: this._typeCalculation,
    };
  }
}

export class FraisFixes extends Frais {
  readonly _typeCalculation = TypeCalculation.FIX;
  protected _amount: Money;
  protected _rate?: number;
  protected _fraisChange?: FraisChange;

  constructor(amount: Money, rate?: number, fraisChange?: FraisChange) {
    super();
    this._amount = amount;
    this._rate = rate;
    this._fraisChange = fraisChange;
  }

  describe(): string {
    let description = `${this._amount}`;
    if (this._rate) {
      description += ` + ${(this._rate * 100).toFixed(2).replace(/\.00$/, '')}%`;
    }
    if (this._fraisChange) {
      description += ` + Frais de change`;
    }
    return description;
  }

  get typeCalculation(): TypeCalculation {
    return this._typeCalculation;
  }

  get amount(): Money {
    return this._amount;
  }

  get rate(): number | undefined {
    return this._rate;
  }

  get fraisChange(): FraisChange | undefined {
    return this._fraisChange;
  }

  get fxSurcharge(): Money | undefined {
    return this._fraisChange?.fxSurcharge;
  }

  get devise(): string | undefined {
    return this._fraisChange?.devise;
  }

  toDTO(): FraisDTO {
    return {
      typeCalculation: this._typeCalculation,
      montantFixe: this._amount,
      pourcentage: this._rate,
      fraisChange: this._fraisChange,
    };
  }
}

export class FraisPourcentage extends Frais {
  readonly _typeCalculation = TypeCalculation.POURCENTAGE;
  protected _rate: number;
  protected _cap?: Money;
  protected _floor?: Money;

  constructor(rate: number, cap?: Money, floor?: Money) {
    super();
    this._rate = rate;
    this._cap = cap;
    this._floor = floor;
  }

  describe(): string {
    let addInfo = '';
    if (this._cap !== undefined && this._floor !== undefined) {
      addInfo = `(frais min ${this._floor} et frais max ${this._cap})`;
    } else if (this._cap !== undefined) {
      addInfo = `(plafonné à ${this._cap})`;
    } else if (this._floor !== undefined) {
      addInfo = `(frais minimum ${this._floor})`;
    }
    return `${(this._rate * 100).toFixed(2).replace(/\.00$/, '')}% ${addInfo}`.trim();
  }

  get typeCalculation(): TypeCalculation {
    return this._typeCalculation;
  }

  get rate(): number {
    return this._rate;
  }

  get cap(): Money | undefined {
    return this._cap;
  }

  get floor(): Money | undefined {
    return this._floor;
  }

  toDTO(): FraisDTO {
    return {
      typeCalculation: this._typeCalculation,
      pourcentage: this._rate,
      maximum: this._cap,
      minimum: this._floor,
    };
  }
}
