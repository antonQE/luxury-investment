CREATE TABLE "analytics_sessions" (
	"session_key" text PRIMARY KEY NOT NULL,
	"visitor_key" text DEFAULT '' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pageviews" integer DEFAULT 0 NOT NULL,
	"engaged_ms" integer DEFAULT 0 NOT NULL,
	"bounced" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_visitors" (
	"visitor_key" text PRIMARY KEY NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_insight_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day" date NOT NULL,
	"sessions" integer DEFAULT 0 NOT NULL,
	"pageviews" integer DEFAULT 0 NOT NULL,
	"users" integer DEFAULT 0 NOT NULL,
	"new_users" integer DEFAULT 0 NOT NULL,
	"engaged_ms_sum" integer DEFAULT 0 NOT NULL,
	"bounced_sessions" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_events" ADD COLUMN "visitor_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "analytics_sessions_started_at_idx" ON "analytics_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "analytics_sessions_visitor_key_idx" ON "analytics_sessions" USING btree ("visitor_key");--> statement-breakpoint
CREATE UNIQUE INDEX "site_insight_daily_day" ON "site_insight_daily" USING btree ("day");--> statement-breakpoint
CREATE INDEX "site_events_occurred_at_idx" ON "site_events" USING btree ("occurred_at");