-- Add allowed_sections to profiles
-- NULL = full access (super admin), array of section keys = restricted access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allowed_sections TEXT[];
