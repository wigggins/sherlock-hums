-- For users: add a score column that defaults to 0
ALTER TABLE users 
  ADD COLUMN score INTEGER NOT NULL DEFAULT 0;