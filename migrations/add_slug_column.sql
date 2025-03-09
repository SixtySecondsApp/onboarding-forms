-- Add slug column to forms table
ALTER TABLE forms ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a unique index on the slug column
CREATE UNIQUE INDEX IF NOT EXISTS forms_slug_idx ON forms(slug);

-- Update existing forms to have a slug based on client_name
-- This is a placeholder - in a real migration, you would need to generate unique slugs
-- for each existing form, possibly using a function or procedure
UPDATE forms SET slug = LOWER(REPLACE(client_name, ' ', '-')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL; 