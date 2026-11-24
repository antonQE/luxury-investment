CREATE TABLE "site_event_daily_rollups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"event_type" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"day" date NOT NULL,
	"event_count" integer DEFAULT 0 NOT NULL,
	"unique_sessions" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" text NOT NULL,
	"event_type" text NOT NULL,
	"label" text DEFAULT '' NOT NULL,
	"href" text DEFAULT '' NOT NULL,
	"session_key" text DEFAULT '' NOT NULL,
	"device_class" text DEFAULT '' NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"is_bot" integer DEFAULT 0 NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "site_event_daily_rollups_path_type_label_day" ON "site_event_daily_rollups" USING btree ("path","event_type","label","day");