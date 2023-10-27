ALTER TABLE listing_images DROP COLUMN IF EXISTS width;
ALTER TABLE listing_images DROP COLUMN IF EXISTS height;
ALTER TABLE users DROP COLUMN IF EXISTS profile_picture_width;
ALTER TABLE users DROP COLUMN IF EXISTS profile_picture_height;