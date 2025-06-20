CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  session_id VARCHAR(6),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_session
    FOREIGN KEY(session_id)
    REFERENCES sessions(id)
    ON DELETE CASCADE
);