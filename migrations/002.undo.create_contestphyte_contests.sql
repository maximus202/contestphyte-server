ALTER TABLE IF EXISTS contestphyte_participants
DROP COLUMN contest_id;

ALTER TABLE contestphyte_contests
DROP COLUMN IF EXISTS states;

DROP TYPE IF EXISTS states cascade;

DROP TABLE IF EXISTS contestphyte_contests;