-- Drop the UNIQUE constraint on (user_id, worn_date) to allow multiple outfits per date
ALTER TABLE daily_outfits DROP CONSTRAINT IF EXISTS daily_outfits_user_id_worn_date_key;
