-- For sessions: add a foreign key on host_id referencing users(id)
ALTER TABLE sessions
  ADD CONSTRAINT fk_host_user
  FOREIGN KEY (host_id)
  REFERENCES users(id);

-- For guesses: add a foreign key constraint on guessed_user_id referencing users(id)
ALTER TABLE guesses
  ADD CONSTRAINT fk_guessed_user
  FOREIGN KEY (guessed_user_id)
  REFERENCES users(id)
  ON DELETE CASCADE;