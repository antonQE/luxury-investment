CREATE TABLE "brochure_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"kind" text NOT NULL,
	"format" text NOT NULL,
	"locale" text DEFAULT 'bg' NOT NULL,
	"name_bg" text NOT NULL,
	"name_en" text NOT NULL,
	"default_toggles" jsonb NOT NULL,
	"badge_preset" text DEFAULT '' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brochure_templates_key_unique" UNIQUE("key")
);
