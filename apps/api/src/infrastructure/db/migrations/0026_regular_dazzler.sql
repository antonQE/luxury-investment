ALTER TABLE "documents" ADD COLUMN "locale" text DEFAULT 'bg' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "source" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "legal_sample" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "responsible_editor" text DEFAULT '' NOT NULL;