-- Migration: Upgrade media table for unified R2 + DB tracking
-- Date: 2024-02-06
-- Description: Adds new columns for proper media management with entity relationships

-- Step 1: Add new columns (if they don't exist)
ALTER TABLE media
  ADD COLUMN IF NOT EXISTS original_filename TEXT,
  ADD COLUMN IF NOT EXISTS object_key TEXT,
  ADD COLUMN IF NOT EXISTS public_url TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id VARCHAR,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS width INTEGER,
  ADD COLUMN IF NOT EXISTS height INTEGER,
  ADD COLUMN IF NOT EXISTS metadata JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 2: Migrate data from old columns to new columns (if old columns exist)
DO $$
BEGIN
  -- Check if old 'name' column exists and migrate
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'name') THEN
    UPDATE media SET original_filename = name WHERE original_filename IS NULL;
  END IF;

  -- Check if old 'url' column exists and migrate
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'url') THEN
    UPDATE media SET public_url = url WHERE public_url IS NULL;
    UPDATE media SET object_key = url WHERE object_key IS NULL;
  END IF;

  -- Check if old 'type' column exists and migrate to mime_type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'type') THEN
    UPDATE media SET
      mime_type = CASE
        WHEN type = 'image' THEN 'image/jpeg'
        WHEN type = 'video' THEN 'video/mp4'
        WHEN type = 'document' THEN 'application/pdf'
        ELSE 'application/octet-stream'
      END
    WHERE mime_type IS NULL;

    -- Set category based on type
    UPDATE media SET category = type WHERE category IS NULL;
  END IF;

  -- Check if old 'folder' column exists and use for entity_type
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'media' AND column_name = 'folder') THEN
    UPDATE media SET entity_type = 'project' WHERE entity_type IS NULL;
  END IF;
END $$;

-- Step 3: Set NOT NULL constraints on required new columns (after data migration)
-- Only set NOT NULL if the column has data
DO $$
BEGIN
  -- Set defaults for any remaining NULL values
  UPDATE media SET original_filename = 'unknown' WHERE original_filename IS NULL;
  UPDATE media SET object_key = public_url WHERE object_key IS NULL AND public_url IS NOT NULL;
  UPDATE media SET object_key = 'unknown' WHERE object_key IS NULL;
  UPDATE media SET public_url = object_key WHERE public_url IS NULL;
  UPDATE media SET entity_type = 'project' WHERE entity_type IS NULL;
  UPDATE media SET category = 'gallery' WHERE category IS NULL;
  UPDATE media SET mime_type = 'application/octet-stream' WHERE mime_type IS NULL;

  -- Now add NOT NULL constraints
  ALTER TABLE media ALTER COLUMN original_filename SET NOT NULL;
  ALTER TABLE media ALTER COLUMN object_key SET NOT NULL;
  ALTER TABLE media ALTER COLUMN public_url SET NOT NULL;
  ALTER TABLE media ALTER COLUMN entity_type SET NOT NULL;
  ALTER TABLE media ALTER COLUMN category SET NOT NULL;
  ALTER TABLE media ALTER COLUMN mime_type SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not add NOT NULL constraints: %', SQLERRM;
END $$;

-- Step 4: Create index for faster lookups by entity
CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(entity_type, entity_id, category);

-- Step 5: Drop old columns (optional - uncomment when ready)
-- WARNING: Only run this after verifying data migration is complete!
-- ALTER TABLE media DROP COLUMN IF EXISTS name;
-- ALTER TABLE media DROP COLUMN IF EXISTS url;
-- ALTER TABLE media DROP COLUMN IF EXISTS type;
-- ALTER TABLE media DROP COLUMN IF EXISTS thumbnail_url;
-- ALTER TABLE media DROP COLUMN IF EXISTS folder;
