ALTER TABLE "inquiries" ADD COLUMN "contact_id" uuid;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "utm_source" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "utm_medium" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "utm_campaign" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "utm_term" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "utm_content" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "assigned_agent_id" uuid;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "funnel_stage" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "next_action_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "next_action_note" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assigned_agent_id_users_id_fk" FOREIGN KEY ("assigned_agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;