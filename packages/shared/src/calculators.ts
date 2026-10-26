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

export const updateCalculatorRuleSetSchema = createCalculatorRuleSetSchema.partial();
export type UpdateCalculatorRuleSetInput = z.infer<typeof updateCalculatorRuleSetSchema>;

export const updateCalculatorRuleLineSchema = createCalculatorRuleLineSchema.partial();
export type UpdateCalculatorRuleLineInput = z.infer<typeof updateCalculatorRuleLineSchema>;

export const upsertCalculatorToggleSchema = z.object({
  kind: calculatorKindSchema,
  countryCode: calculatorCountrySchema,
  propertyType: z.string().trim().max(80).optional().default(''),
  enabled: z.boolean(),
});

export type UpsertCalculatorToggleInput = z.infer<typeof upsertCalculatorToggleSchema>;

export const listCalculatorRuleSetsQuerySchema = z
  .object({
    countryCode: calculatorCountrySchema.optional(),
    kind: calculatorKindSchema.optional(),
    includeArchived: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  })
  .transform((query) => ({
    countryCode: query.countryCode,
    kind: query.kind,
    includeArchived: query.includeArchived === true || query.includeArchived === 'true',
  }));

export type ListCalculatorRuleSetsQuery = z.infer<typeof listCalculatorRuleSetsQuerySchema>;

export const acquisitionEstimateQuerySchema = z.object({
  /** Override price; defaults to the property listing price when slug is used. */
  price: z.coerce.number().positive().optional(),
});

export type AcquisitionEstimateQuery = z.infer<typeof acquisitionEstimateQuerySchema>;

export const acquisitionCostLineSchema = z.object({
  costGroup: calculatorCostGroupSchema,
  label: z.string(),
  amount: z.number().nullable(),
  optional: z.boolean(),
  status: z.enum(['included', 'assumed', 'unknown']),
});

export type AcquisitionCostLine = z.infer<typeof acquisitionCostLineSchema>;

export const acquisitionEstimateSchema = z.object({
  status: z.enum(['ok', 'disabled', 'insufficient_data']),
  countryCode: z.string().nullable(),
  currency: z.string(),
  purchasePrice: z.number(),
  costs: z.array(acquisitionCostLineSchema),
  costsTotal: z.number().nullable(),
  totalAcquisition: z.number().nullable(),
  warning: z.string().nullable(),
  disclaimer: z.string(),
});

export type AcquisitionEstimate = z.infer<typeof acquisitionEstimateSchema>;

export const depositEstimateQuerySchema = z.object({
  /** Override price; defaults to the property listing price when slug is used. */
  price: z.coerce.number().positive().optional(),
  /** Override deposit %; defaults to the active deposit rule for the country. */
  depositPercent: z.coerce.number().positive().max(100).optional(),
});

export type DepositEstimateQuery = z.infer<typeof depositEstimateQuerySchema>;

export const depositEstimateSchema = z.object({
  status: z.enum(['ok', 'disabled', 'insufficient_data']),
  countryCode: z.string().nullable(),
  currency: z.string(),
  /** Agreed purchase price — deposit is part of this, never added on top. */
  purchasePrice: z.number(),
  depositPercent: z.number().nullable(),
  depositAmount: z.number().nullable(),
  remainingPrice: z.number().nullable(),
  extraCosts: z.array(acquisitionCostLineSchema),
  extraCostsTotal: z.number().nullable(),
  /** Deposit + known accompanying costs due around the preliminary stage. */
  initialFunds: z.number().nullable(),
  warning: z.string().nullable(),
  disclaimer: z.string(),
});

export type DepositEstimate = z.infer<typeof depositEstimateSchema>;

export const mortgageEstimateQuerySchema = z.object({
  price: z.coerce.number().positive().optional(),
  /** Own funds / down payment; defaults to deposit % of price when omitted. */
  downPayment: z.coerce.number().nonnegative().optional(),
  /** Desired loan; defaults to price − down payment. */
  loanAmount: z.coerce.number().positive().optional(),
  /** Loan term in years; default 25. */
  termYears: z.coerce.number().int().positive().max(40).optional(),
  /** Override annual interest rate %; defaults to configured mortgage rule. */
  annualRate: z.coerce.number().positive().max(100).optional(),
});

export type MortgageEstimateQuery = z.infer<typeof mortgageEstimateQuerySchema>;

export const mortgageConsultantSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  slug: z.string().nullable(),
});

export type MortgageConsultant = z.infer<typeof mortgageConsultantSchema>;

export const mortgageEstimateSchema = z.object({
  status: z.enum(['ok', 'disabled', 'insufficient_data']),
  countryCode: z.string().nullable(),
  currency: z.string(),
  purchasePrice: z.number(),
  downPayment: z.number().nullable(),
  loanAmount: z.number().nullable(),
  termYears: z.number().nullable(),
  annualRatePercent: z.number().nullable(),
  monthlyPayment: z.number().nullable(),
  totalPayments: z.number().nullable(),
  totalInterest: z.number().nullable(),
  consultant: mortgageConsultantSchema.nullable(),
  warning: z.string().nullable(),
  disclaimer: z.string(),
});

export type MortgageEstimate = z.infer<typeof mortgageEstimateSchema>;
