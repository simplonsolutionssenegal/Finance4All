export type Money = number;

export type Tranche = { min: Money; max?: Money; fee: Money };

export enum TypeCalculation {
  FREE,
  POURCENTAGE,
  FIX,
}

export interface FraisDTO {
  montantFixe?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
}

export abstract class Frais {
  abstract readonly _typeCalculation: TypeCalculation;
  abstract describe(): string;
  abstract isGratuit(): boolean;
  abstract toDTO(): FraisDTO;
}

export class FraisGratuit extends Frais {
  readonly _typeCalculation = TypeCalculation.FREE;

  describe(): string {
    return 'Gratuit';
  }

  isGratuit(): boolean {
    return true;
  }
  get typeCalculation(): TypeCalculation {
    return this._typeCalculation;
  }
  toDTO(): FraisDTO {
    return {}; // Objet vide = gratuit
  }
}

export class FraisFixes extends Frais {
  readonly _typeCalculation = TypeCalculation.FIX;

  protected _amount: Money;
  protected _rate?: number;
  protected _fxSurcharge?: Money;

  constructor(amount: Money, rate?: number, fxSurcharge?: Money) {
    super();
    this._amount = amount;
    this._rate = rate;
    this._fxSurcharge = fxSurcharge;
  }

  describe(): string {
    let description = `${this._amount}`;
    if (this._rate) {
      description += ` + ${(this._rate * 100).toFixed(2).replace(/\.00$/, '')}%`;
    }
    if (this._fxSurcharge) {
      description += ` + Frais de change`;
    }
    return description;
  }

  toDTO(): FraisDTO {
    const dto: FraisDTO = {};

    // Montant fixe + frais de change combinés
    if (this._amount > 0 || (this._fxSurcharge && this._fxSurcharge > 0)) {
      dto.montantFixe = this._amount + (this._fxSurcharge || 0);
    }

    // Taux additionnel converti en pourcentage
    if (this._rate && this._rate > 0) {
      dto.pourcentage = this._rate * 100; // 0.005 → 0.5
    }

    return dto;
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

  get fxSurcharge(): Money | undefined {
    return this._fxSurcharge;
  }

  isGratuit(): boolean {
    return (
      this._amount === 0 &&
      (!this._rate || this._rate === 0) &&
      (!this._fxSurcharge || this._fxSurcharge === 0)
    );
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

  toDTO(): FraisDTO {
    const dto: FraisDTO = {};

    // Taux converti en pourcentage
    if (this._rate > 0) {
      dto.pourcentage = this._rate * 100; // 0.015 → 1.5
    }

    // Limites
    if (this._floor && this._floor > 0) {
      dto.minimum = this._floor;
    }

    if (this._cap && this._cap > 0) {
      dto.maximum = this._cap;
    }

    return dto;
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

  isGratuit(): boolean {
    return this._rate === 0;
  }
}
