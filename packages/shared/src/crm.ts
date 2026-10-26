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
