CREATE TABLE "owner_report_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"kind" text DEFAULT 'short' NOT NULL,
	"period_from" date,
	"period_to" date,
	"generated_by_user_id" uuid,
	"broker_comment" text DEFAULT '' NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_event_daily_rollups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"day" date NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"unique_sessions" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"session_key" text DEFAULT '' NOT NULL,
	"source" text DEFAULT '' NOT NULL,
	"device_class" text DEFAULT '' NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"is_bot" integer DEFAULT 0 NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "owner_report_snapshots" ADD CONSTRAINT "owner_report_snapshots_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_report_snapshots" ADD CONSTRAINT "owner_report_snapshots_generated_by_user_id_users_id_fk" FOREIGN KEY ("generated_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_event_daily_rollups" ADD CONSTRAINT "property_event_daily_rollups_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_events" ADD CONSTRAINT "property_events_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "property_event_daily_rollups_property_type_day" ON "property_event_daily_rollups" USING btree ("property_id","event_type","day");