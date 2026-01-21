import { z } from 'zod';
import { TypeService, type CreateServiceDto } from '@/types/Service';

export enum Currency {
  XOF = 'XOF',
  XAF = 'XAF',
  EUR = 'EUR',
  USD = 'USD',
}

export type FeeTypeUI = 'FREE' | 'FIX' | 'MIXTE' | 'POURCENTAGE' | 'CHANGE';

export const FEE_OPTIONS: Array<{
  id: string;
  value: FeeTypeUI;
  title: string;
  description?: string;
}> = [
  { id: 'fee-free', value: 'FREE', title: 'Gratuit' },
  { id: 'fee-fix', value: 'FIX', title: 'Frais fixe', description: 'Montant constant en FCFA' },
  {
    id: 'fee-percent',
    value: 'POURCENTAGE',
    title: 'Frais en pourcentage',
    description: 'Taux sur le montant',
  },
  {
    id: 'fee-mixte',
    value: 'MIXTE',
    title: 'Frais mixte (fixe + %)',
    description: 'Combinaison des deux',
  },
  {
    id: 'fee-change',
    value: 'CHANGE',
    title: 'Frais selon devise / taux de change',
    description: 'Montant ajusté selon la devise',
  },
];

export const serviceSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Le champ nom service est obligatoire *')
      .refine(val => val.trim().length >= 2, {
        message: 'Le nom doit contenir au moins 2 caractères (hors espaces) *',
      }),
    longName: z
      .string()
      .min(1, 'Le champ description est obligatoire *')
      .refine(val => val.trim().length >= 2, {
        message: 'La description doit contenir au moins 2 caractères (hors espaces) *',
      }),
    type: z.enum(
      [
        TypeService.PAIEMENT_MARCHAND,
        TypeService.ACHAT_CREDIT,
        TypeService.PAIEMENT_FACTURES,
        TypeService.DEPOT_SIMPLE,
        TypeService.DEPOT_RETRAIT_SIMPLE,
        TypeService.RETRAIT_SIMPLE,
        TypeService.TRANSFERT_ARGENT,
        TypeService.BANQUE_WALLET,
        TypeService.WALLET_BANQUE,
        TypeService.EPARGNE,
        TypeService.CREDIT,
        TypeService.ASSURANCE,
        TypeService.AUTRES,
      ],
      { message: '* Veuillez sélectionner un type de service' }
    ),
    montantMin: z.number().nonnegative('Doit être ≥ 0').optional(),
    montantMax: z.number().nonnegative('Doit être ≥ 0').optional(),

    feeTypeUI: z.enum(['FREE', 'FIX', 'MIXTE', 'POURCENTAGE', 'CHANGE'], {
      message: '* Veuillez sélectionner un type de frais',
    }),

    frais: z.object({
      montantFixe: z.number().nonnegative('Doit être ≥ 0').optional(),
      pourcentage: z.number().nonnegative('Doit être ≥ 0').max(100, 'Doit être ≤ 100').optional(),
      minimum: z.number().nonnegative('Doit être ≥ 0').optional(),
      maximum: z.number().nonnegative('Doit être ≥ 0').optional(),
      fraisChange: z
        .object({
          fxSurcharge: z.number().nonnegative('Doit être ≥ 0'),
          devise: z.enum([Currency.XOF, Currency.XAF, Currency.EUR, Currency.USD]),
        })
        .optional(),
    }),

    conditionAccess: z.array(z.string()),
    plafonds: z.array(z.string()),
    infrastructureAccess: z.array(z.string()),
  })
  // ✅ mieux: erreur sur les 2 champs (ça résout ton souci d’ordre de saisie)
  .superRefine((v, ctx) => {
    if (v.montantMin != null && v.montantMax != null && v.montantMin > v.montantMax) {
      ctx.addIssue({
        code: 'custom',
        message: 'Le montant minimum doit être ≤ au montant maximum',
        path: ['montantMin'],
      });
      ctx.addIssue({
        code: 'custom',
        message: 'Le montant maximum doit être ≥ au montant minimum',
        path: ['montantMax'],
      });
    }

    if (v.feeTypeUI === 'FREE') {
      const anyFee =
        v.frais.montantFixe != null ||
        v.frais.pourcentage != null ||
        v.frais.minimum != null ||
        v.frais.maximum != null ||
        v.frais.fraisChange != null;

      if (anyFee) {
        ctx.addIssue({
          code: 'custom',
          message: "Le service est gratuit : n'indiquez aucun frais.",
          path: ['frais'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'FIX') {
      if (v.frais.montantFixe == null || Number.isNaN(v.frais.montantFixe)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ montant fixe est obligatoire *',
          path: ['frais', 'montantFixe'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'MIXTE') {
      if (v.frais.montantFixe == null || Number.isNaN(v.frais.montantFixe)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ montant fixe est obligatoire *',
          path: ['frais', 'montantFixe'],
        });
      }
      if (v.frais.pourcentage == null || Number.isNaN(v.frais.pourcentage)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ pourcentage est obligatoire *',
          path: ['frais', 'pourcentage'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'POURCENTAGE') {
      if (v.frais.pourcentage == null || Number.isNaN(v.frais.pourcentage)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Le champ pourcentage est obligatoire *',
          path: ['frais', 'pourcentage'],
        });
      }
      if (
        v.frais.minimum != null &&
        v.frais.maximum != null &&
        !Number.isNaN(v.frais.minimum) &&
        !Number.isNaN(v.frais.maximum) &&
        v.frais.minimum > v.frais.maximum
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'minimum doit être ≤ maximum',
          path: ['frais', 'maximum'],
        });
      }
      return;
    }

    if (v.feeTypeUI === 'CHANGE') {
      if (!v.frais.fraisChange) {
        ctx.addIssue({
          code: 'custom',
          message: 'Les frais de change sont obligatoires *',
          path: ['frais', 'fraisChange'],
        });
      } else {
        if (
          v.frais.fraisChange.fxSurcharge == null ||
          Number.isNaN(v.frais.fraisChange.fxSurcharge)
        ) {
          ctx.addIssue({
            code: 'custom',
            message: 'Le champ montant devise est obligatoire *',
            path: ['frais', 'fraisChange', 'fxSurcharge'],
          });
        }
        if (!v.frais.fraisChange.devise) {
          ctx.addIssue({
            code: 'custom',
            message: 'La devise de référence est obligatoire *',
            path: ['frais', 'fraisChange', 'devise'],
          });
        }
      }
    }
  });

export type ServiceFormData = z.infer<typeof serviceSchema>;

export function inferFeeTypeUI(frais: any): FeeTypeUI {
  if (!frais) return 'FREE';
  if (frais.fraisChange) return 'CHANGE';
  const hasFix = frais.montantFixe != null;
  const hasPct = frais.pourcentage != null;
  const hasMinMax = frais.minimum != null || frais.maximum != null;
  if (hasFix && hasPct) return 'MIXTE';
  if (hasFix) return 'FIX';
  if (hasPct || hasMinMax) return 'POURCENTAGE';
  return 'FREE';
}

const TYPE_MAP: Record<string, TypeService> = {
  PAIEMENT_MARCHAND: TypeService.PAIEMENT_MARCHAND,
  ACHAT_CREDIT: TypeService.ACHAT_CREDIT,
  PAIEMENT_FACTURES: TypeService.PAIEMENT_FACTURES,
  DEPOT_SIMPLE: TypeService.DEPOT_SIMPLE,
  DEPOT_RETRAIT_SIMPLE: TypeService.DEPOT_RETRAIT_SIMPLE,
  RETRAIT_SIMPLE: TypeService.RETRAIT_SIMPLE,
  TRANSFERT_ARGENT: TypeService.TRANSFERT_ARGENT,
  BANQUE_WALLET: TypeService.BANQUE_WALLET,
  WALLET_BANQUE: TypeService.WALLET_BANQUE,
  EPARGNE: TypeService.EPARGNE,
  CREDIT: TypeService.CREDIT,
  ASSURANCE: TypeService.ASSURANCE,
  AUTRES: TypeService.AUTRES,
};

export function normalizeTypeService(t: unknown): TypeService {
  if (typeof t !== 'string') return TypeService.AUTRES;
  if (Object.values(TypeService).includes(t as TypeService)) return t as TypeService;
  const key = t.trim().toUpperCase();
  return TYPE_MAP[key] ?? TypeService.AUTRES;
}

export function toFormDefaults(service: any): ServiceFormData {
  return {
    name: service.name ?? '',
    longName: service.longName ?? '',
    type: normalizeTypeService(service.type),

    // ✅ garder 0 affiché (et éviter “vide”)
    montantMin: service.montantMin ?? 0,
    montantMax: service.montantMax ?? 0,

    feeTypeUI: inferFeeTypeUI(service.frais),
    frais: {
      montantFixe: service.frais?.montantFixe ?? 0,
      pourcentage: service.frais?.pourcentage ? service.frais.pourcentage * 100 : 0,
      minimum: service.frais?.minimum ?? 0,
      maximum: service.frais?.maximum ?? 0,
      fraisChange: service.frais?.fraisChange
        ? {
            fxSurcharge: service.frais.fraisChange.fxSurcharge,
            devise: service.frais.fraisChange.devise,
          }
        : undefined,
    },
    conditionAccess: service.conditionAccess ?? [],
    plafonds: service.plafonds ?? [],
    infrastructureAccess: service.infrastructureAccess ?? [],
  };
}

// ✅ payload backend : si undefined => 0 (montantMin/montantMax)
export function toServicePayload(data: ServiceFormData): CreateServiceDto {
  const { feeTypeUI: _ui, ...rest } = data;

  return {
    ...rest,
    montantMin: data.montantMin ?? 0,
    montantMax: data.montantMax ?? 0,
    frais: {
      ...data.frais,
      montantFixe: data.frais.montantFixe ?? 0,
      pourcentage: data.frais.pourcentage != null ? data.frais.pourcentage : undefined, // si ton backend attend décimal
      minimum: data.frais.minimum ?? 0,
      maximum: data.frais.maximum ?? 0,
    },
  };
}
