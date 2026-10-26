CREATE TABLE "calculator_rule_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_set_id" uuid NOT NULL,
	"cost_group" text NOT NULL,
	"line_type" text NOT NULL,
	"rate_value" numeric(14, 6) NOT NULL,
	"min_amount" numeric(14, 2),
	"max_amount" numeric(14, 2),
	"optional" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"label_bg" text NOT NULL,
	"label_en" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_rule_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_code" text NOT NULL,
	"property_type" text DEFAULT '' NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'EUR' NOT NULL,
	"valid_from" date NOT NULL,
	"valid_to" date,
	"source" text DEFAULT '' NOT NULL,
	"warning" text DEFAULT '' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calculator_toggles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"country_code" text NOT NULL,
	"property_type" text DEFAULT '' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "calculator_toggles_kind_countryCode_propertyType_unique" UNIQUE("kind","country_code","property_type")
);
--> statement-breakpoint
ALTER TABLE "calculator_rule_lines" ADD CONSTRAINT "calculator_rule_lines_rule_set_id_calculator_rule_sets_id_fk" FOREIGN KEY ("rule_set_id") REFERENCES "public"."calculator_rule_sets"("id") ON DELETE cascade ON UPDATE no action;