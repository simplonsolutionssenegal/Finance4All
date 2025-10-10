export type Money = number;

export type Tranche = { min: Money; max?: Money; fee: Money };

enum TypeCalculation {
  FREE,
  POURCENTAGE,
  FIX,
}

export abstract class Frais {
  abstract readonly _typeCalculation: TypeCalculation;
  abstract describe(): string;
}

export class FraisGratuit extends Frais {
  readonly _typeCalculation = TypeCalculation.FREE;
  describe(): string {
    return 'Gratuit';
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
    const rateString = this._rate
      ? ` + ${(this._rate * 100).toFixed(2).replace(/\.00$/, '')}%`
      : '';
    const fxString = this._fxSurcharge ? ` + Frais de change` : '';
    return `${this._amount} ${rateString} ${fxString}`;
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
    const capString = this._cap ?? `(plafonné à ${this._cap})`;
    const floorString = this._floor ?? `(frais minimum ${this._floor})`;

    let addInfo = '';

    if (this._cap !== undefined) {
      addInfo += capString;
    }

    if (this._floor !== undefined) {
      addInfo += floorString;
    }

    if (this._cap !== undefined && this._floor !== undefined) {
      addInfo = `Frais min ${this._floor} et frais max ${this._cap}`;
    }

    return `${(this._rate * 100).toFixed(2).replace(/\.00$/, '')}% ${addInfo}`;
  }
}
