CREATE TABLE "marketing_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"activity_type" text NOT NULL,
	"title" text NOT NULL,
	"owner_user_id" uuid,
	"status" text DEFAULT 'planned' NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"cost_amount" numeric(14, 2),
	"cost_currency" text DEFAULT 'EUR' NOT NULL,
	"result_notes" text DEFAULT '' NOT NULL,
	"evidence_url" text,
	"recurrence" text DEFAULT '' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"portal_name" text NOT NULL,
	"listing_url" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_on" date,
	"notes" text DEFAULT '' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portal_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portal_listing_id" uuid NOT NULL,
	"measured_on" date NOT NULL,
	"period_label" text DEFAULT '' NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"saves" integer DEFAULT 0 NOT NULL,
	"metric_definition" text DEFAULT '' NOT NULL,
	"entered_by_user_id" uuid,
	"evidence_url" text,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketing_activities" ADD CONSTRAINT "marketing_activities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketing_activities" ADD CONSTRAINT "marketing_activities_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_listings" ADD CONSTRAINT "portal_listings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_measurements" ADD CONSTRAINT "portal_measurements_portal_listing_id_portal_listings_id_fk" FOREIGN KEY ("portal_listing_id") REFERENCES "public"."portal_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portal_measurements" ADD CONSTRAINT "portal_measurements_entered_by_user_id_users_id_fk" FOREIGN KEY ("entered_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;