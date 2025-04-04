CREATE TABLE IF NOT EXISTS song_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_id VARCHAR(6) NOT NULL,
  song_url TEXT NOT NULL,
  submission_order INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_session_song
    FOREIGN KEY(session_id)
    REFERENCES sessions(id)
    ON DELETE CASCADE
);