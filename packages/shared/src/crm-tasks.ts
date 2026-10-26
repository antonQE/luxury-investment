import { z } from 'zod';

export const CRM_TASK_STATUSES = ['open', 'completed', 'cancelled'] as const;
export type CrmTaskStatus = (typeof CRM_TASK_STATUSES)[number];
export const crmTaskStatusSchema = z.enum(CRM_TASK_STATUSES);

export const CRM_TASK_KINDS = ['manual', 'inquiry_followup', 'post_viewing'] as const;
export type CrmTaskKind = (typeof CRM_TASK_KINDS)[number];
export const crmTaskKindSchema = z.enum(CRM_TASK_KINDS);

export const createCrmTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  notes: z.string().trim().max(2000).optional().default(''),
  kind: crmTaskKindSchema.optional().default('manual'),
  assigneeId: z.uuid(),
  dueAt: z.iso.datetime(),
  relatedInquiryId: z.uuid().nullable().optional(),
  relatedViewingId: z.uuid().nullable().optional(),
  relatedPropertyId: z.uuid().nullable().optional(),
  relatedContactId: z.uuid().nullable().optional(),
});

export type CreateCrmTaskInput = z.infer<typeof createCrmTaskSchema>;

export const updateCrmTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
  kind: crmTaskKindSchema.optional(),
  assigneeId: z.uuid().optional(),
  dueAt: z.iso.datetime().optional(),
  status: crmTaskStatusSchema.optional(),
  relatedInquiryId: z.uuid().nullable().optional(),
  relatedViewingId: z.uuid().nullable().optional(),
  relatedPropertyId: z.uuid().nullable().optional(),
  relatedContactId: z.uuid().nullable().optional(),
});

export type UpdateCrmTaskInput = z.infer<typeof updateCrmTaskSchema>;

export const listCrmTasksQuerySchema = z.object({
  status: crmTaskStatusSchema.optional(),
  assigneeId: z.uuid().optional(),
});

export type ListCrmTasksQuery = z.infer<typeof listCrmTasksQuerySchema>;
