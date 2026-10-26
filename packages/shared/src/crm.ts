import { z } from 'zod';

export const CONTACT_KINDS = ['person', 'company'] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];
export const contactKindSchema = z.enum(CONTACT_KINDS);

/** CRM-001 roles — a contact may hold several at once. */
export const CONTACT_ROLES = [
  'seller',
  'buyer',
  'investor',
  'landlord',
  'tenant',
  'partner',
] as const;
export type ContactRole = (typeof CONTACT_ROLES)[number];
export const contactRoleSchema = z.enum(CONTACT_ROLES);

export const PREFERRED_CONTACT_CHANNELS = ['email', 'phone', 'viber', 'whatsapp', 'other'] as const;
export type PreferredContactChannel = (typeof PREFERRED_CONTACT_CHANNELS)[number];
export const preferredContactChannelSchema = z.enum(PREFERRED_CONTACT_CHANNELS);

/** Ownership link on a property (CRM-001). */
export const PROPERTY_OWNERSHIP_ROLES = ['owner', 'co_owner'] as const;
export type PropertyOwnershipRole = (typeof PROPERTY_OWNERSHIP_ROLES)[number];
export const propertyOwnershipRoleSchema = z.enum(PROPERTY_OWNERSHIP_ROLES);

export const upsertPropertyOwnershipSchema = z.object({
  contactId: z.uuid(),
  role: propertyOwnershipRoleSchema,
  agreementStartsOn: z.iso.date().nullable().optional(),
  agreementEndsOn: z.iso.date().nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export type UpsertPropertyOwnershipInput = z.infer<typeof upsertPropertyOwnershipSchema>;

const optionalEmail = z.email().max(200).nullable().optional();
const optionalPhone = z.string().trim().max(40).nullable().optional();

export const createContactSchema = z.object({
  kind: contactKindSchema,
  displayName: z.string().trim().min(1).max(200),
  email: optionalEmail,
  phone: optionalPhone,
  preferredLocale: z.enum(['bg', 'en']).optional().default('bg'),
  preferredChannel: preferredContactChannelSchema.nullable().optional(),
  notes: z.string().max(5000).optional().default(''),
  legalBasis: z.string().trim().max(500).nullable().optional(),
  roles: z.array(contactRoleSchema).default([]),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = z.object({
  kind: contactKindSchema.optional(),
  displayName: z.string().trim().min(1).max(200).optional(),
  email: optionalEmail,
  phone: optionalPhone,
  preferredLocale: z.enum(['bg', 'en']).optional(),
  preferredChannel: preferredContactChannelSchema.nullable().optional(),
  notes: z.string().max(5000).optional(),
  legalBasis: z.string().trim().max(500).nullable().optional(),
  roles: z.array(contactRoleSchema).optional(),
});

export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const listContactsQuerySchema = z
  .object({
    includeArchived: z.union([z.boolean(), z.enum(['true', 'false'])]).optional(),
  })
  .transform((query) => ({
    includeArchived: query.includeArchived === true || query.includeArchived === 'true',
  }));

export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;

export const contactDuplicatesQuerySchema = z
  .object({
    email: z.string().trim().max(200).optional(),
    phone: z.string().trim().max(40).optional(),
    excludeId: z.uuid().optional(),
  })
  .refine(
    (query) =>
      (query.email !== undefined && query.email !== '') ||
      (query.phone !== undefined && query.phone !== ''),
    { message: 'email or phone required' },
  );

export type ContactDuplicatesQuery = z.infer<typeof contactDuplicatesQuerySchema>;
