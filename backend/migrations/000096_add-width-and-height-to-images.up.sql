ALTER TABLE listing_images ADD COLUMN width INT NOT NULL DEFAULT 0;
ALTER TABLE listing_images ADD COLUMN height INT NOT NULL DEFAULT 0;

ALTER TABLE listing_images ALTER COLUMN width DROP DEFAULT;
ALTER TABLE listing_images ALTER COLUMN height DROP DEFAULT;

ALTER TABLE users ADD COLUMN profile_picture_width INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN profile_picture_height INT NOT NULL DEFAULT 0;

ALTER TABLE users ALTER COLUMN profile_picture_width DROP DEFAULT;
ALTER TABLE users ALTER COLUMN profile_picture_height DROP DEFAULT;