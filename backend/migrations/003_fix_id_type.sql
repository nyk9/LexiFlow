-- Fix words table id to be VARCHAR instead of UUID
ALTER TABLE words 
  ALTER COLUMN id TYPE VARCHAR USING id::VARCHAR;