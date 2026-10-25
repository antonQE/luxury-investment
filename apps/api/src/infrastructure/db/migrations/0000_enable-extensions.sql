-- Trigram similarity for fuzzy text search and duplicate detection (e.g. neighbourhood names).
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
-- Accent-insensitive search.
CREATE EXTENSION IF NOT EXISTS unaccent;
