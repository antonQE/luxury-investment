ALTER TABLE "properties" ALTER COLUMN "published_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "location_id" uuid;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "built_up_area" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "area_with_common_parts" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "primary_area" text DEFAULT 'built_up' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "attribute_values" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "responsible_agent_user_id" uuid;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "listing_status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_responsible_agent_user_id_users_id_fk" FOREIGN KEY ("responsible_agent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
UPDATE "properties" SET "listing_status" = 'published', "built_up_area" = COALESCE("built_up_area", "area"), "updated_at" = now() WHERE "published_at" IS NOT NULL;