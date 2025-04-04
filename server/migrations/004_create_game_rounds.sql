CREATE TABLE IF NOT EXISTS game_rounds (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(6) NOT NULL,
  song_submission_id INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  played BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_session_round
    FOREIGN KEY(session_id)
    REFERENCES sessions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_song_submission
    FOREIGN KEY(song_submission_id)
    REFERENCES song_submissions(id)
    ON DELETE CASCADE
);