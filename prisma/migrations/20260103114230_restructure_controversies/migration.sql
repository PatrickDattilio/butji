-- AlterTable: Remove @db.Text constraint from controversies
-- The field type stays as TEXT but we're changing how it's used (from plain text to JSON array)
-- Data migration will be handled by application-level script

-- Note: This migration only changes the schema constraint
-- Actual data conversion from text to JSON array format will be done by scripts/migrate-controversies.ts
