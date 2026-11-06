CREATE TABLE "brochure_exports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"format" text NOT NULL,
	"toggles" jsonb NOT NULL,
	"listing_url" text NOT NULL,
	"storage_key" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text DEFAULT 'application/pdf' NOT NULL,
	"byte_size" integer DEFAULT 0 NOT NULL,
	"generated_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brochure_exports" ADD CONSTRAINT "brochure_exports_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brochure_exports" ADD CONSTRAINT "brochure_exports_template_id_brochure_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."brochure_templates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brochure_exports" ADD CONSTRAINT "brochure_exports_generated_by_user_id_users_id_fk" FOREIGN KEY ("generated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;