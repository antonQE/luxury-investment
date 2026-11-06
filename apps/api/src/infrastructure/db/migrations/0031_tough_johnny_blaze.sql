CREATE TABLE "landing_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"key" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"title_bg" text NOT NULL,
	"title_en" text NOT NULL,
	"seo_title_bg" text DEFAULT '' NOT NULL,
	"seo_title_en" text DEFAULT '' NOT NULL,
	"seo_description_bg" text DEFAULT '' NOT NULL,
	"seo_description_en" text DEFAULT '' NOT NULL,
	"robots" text DEFAULT 'index,follow' NOT NULL,
	"show_in_nav" boolean DEFAULT false NOT NULL,
	"campaign_key" text DEFAULT '' NOT NULL,
	"published_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "landing_pages_slug_unique" UNIQUE("slug"),
	CONSTRAINT "landing_pages_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "landing_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landing_page_id" uuid NOT NULL,
	"type" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "landing_sections" ADD CONSTRAINT "landing_sections_landing_page_id_landing_pages_id_fk" FOREIGN KEY ("landing_page_id") REFERENCES "public"."landing_pages"("id") ON DELETE cascade ON UPDATE no action;