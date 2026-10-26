import { z } from 'zod';

export const CALCULATOR_KINDS = ['acquisition', 'deposit', 'mortgage'] as const;
export type CalculatorKind = (typeof CALCULATOR_KINDS)[number];
export const calculatorKindSchema = z.enum(CALCULATOR_KINDS);

/** Cost / parameter groups used on rule lines. */
export const CALCULATOR_COST_GROUPS = [
  'transfer_tax',
  'notary',
  'registration',
  'admin_fee',
  'bank_appraisal',
  'bank_fees',
  'brokerage',
  'other',
  'deposit_percent',
  'mortgage_annual_rate',
] as const;
export type CalculatorCostGroup = (typeof CALCULATOR_COST_GROUPS)[number];
export const calculatorCostGroupSchema = z.enum(CALCULATOR_COST_GROUPS);

export const CALCULATOR_LINE_TYPES = ['percent_of_price', 'fixed', 'percent_of_loan'] as const;
export type CalculatorLineType = (typeof CALCULATOR_LINE_TYPES)[number];
export const calculatorLineTypeSchema = z.enum(CALCULATOR_LINE_TYPES);

export const calculatorCountrySchema = z.string().trim().min(2).max(2);

export const createCalculatorRuleSetSchema = z.object({
  countryCode: calculatorCountrySchema,
  propertyType: z.string().trim().max(80).nullable().optional(),
  kind: calculatorKindSchema,
  name: z.string().trim().min(1).max(200),
  currency: z.string().trim().min(3).max(3).default('EUR'),
  validFrom: z.iso.date(),
  validTo: z.iso.date().nullable().optional(),
  source: z.string().trim().max(500).optional().default(''),
  warning: z.string().trim().max(2000).optional().default(''),
});

export type CreateCalculatorRuleSetInput = z.infer<typeof createCalculatorRuleSetSchema>;

export const createCalculatorRuleLineSchema = z.object({
  costGroup: calculatorCostGroupSchema,
  lineType: calculatorLineTypeSchema,
  rateValue: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,6})?$/, 'invalid rate'),
  minAmount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  maxAmount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  optional: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).max(999).optional().default(0),
  labelBg: z.string().trim().min(1).max(200),
  labelEn: z.string().trim().min(1).max(200),
});

export type CreateCalculatorRuleLineInput = z.infer<typeof createCalculatorRuleLineSchema>;
