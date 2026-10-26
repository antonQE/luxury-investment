ALTER TABLE "inquiries" ADD COLUMN "status" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;