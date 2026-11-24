ALTER TABLE "deals" ADD COLUMN "agent_id" uuid;--> statement-breakpoint
UPDATE "deals" AS d
SET "agent_id" = COALESCE(
  (SELECT p."responsible_agent_user_id" FROM "properties" p WHERE p."id" = d."property_id"),
  (SELECT u."id" FROM "users" u ORDER BY u."created_at" ASC LIMIT 1)
)
WHERE d."agent_id" IS NULL;--> statement-breakpoint
ALTER TABLE "deals" ALTER COLUMN "agent_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
