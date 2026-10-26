-- Existing ADR-0005 rows were published; migration 0009 defaulted listing_status to draft.
UPDATE "properties"
SET
  "listing_status" = 'published',
  "built_up_area" = COALESCE("built_up_area", "area"),
  "updated_at" = now()
WHERE "published_at" IS NOT NULL
  AND "listing_status" = 'draft';
