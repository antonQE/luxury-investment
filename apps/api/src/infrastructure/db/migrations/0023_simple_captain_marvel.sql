CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"buyer_contact_id" uuid NOT NULL,
	"seller_contact_id" uuid,
	"offer_id" uuid,
	"stage" text DEFAULT 'negotiation' NOT NULL,
	"agreed_price" numeric(14, 2),
	"currency" text DEFAULT 'EUR' NOT NULL,
	"commission_amount" numeric(14, 2),
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_buyer_contact_id_contacts_id_fk" FOREIGN KEY ("buyer_contact_id") REFERENCES "public"."contacts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_seller_contact_id_contacts_id_fk" FOREIGN KEY ("seller_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;