CREATE TABLE IF NOT EXISTS guesses (
  id SERIAL PRIMARY KEY,
  round_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  guessed_user_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  correct BOOLEAN,
  CONSTRAINT fk_round
    FOREIGN KEY(round_id)
    REFERENCES game_rounds(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_guess
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
