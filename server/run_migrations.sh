#!/bin/sh
set -e

echo "Starting migrations..."

# Ensure the migrations are executed in order
for f in $(ls migrations/*.sql | sort); do
  echo "Running migration: $f"
  psql "$DATABASE_URL" -f "$f"
done

echo "All migrations executed successfully."

# Now start the Go application
exec ./app