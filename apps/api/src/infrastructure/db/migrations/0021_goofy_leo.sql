CREATE TABLE "crm_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"kind" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"assignee_id" uuid NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"related_inquiry_id" uuid,
	"related_viewing_id" uuid,
	"related_property_id" uuid,
	"related_contact_id" uuid,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_related_inquiry_id_inquiries_id_fk" FOREIGN KEY ("related_inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_related_viewing_id_viewings_id_fk" FOREIGN KEY ("related_viewing_id") REFERENCES "public"."viewings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_related_property_id_properties_id_fk" FOREIGN KEY ("related_property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_related_contact_id_contacts_id_fk" FOREIGN KEY ("related_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;