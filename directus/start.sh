#!/bin/sh
set -e

echo "Running bootstrap (internal migrations + admin user)..."
npx directus bootstrap

if [ -f "/directus/schema.yaml" ]; then
  echo "Applying schema snapshot..."
  npx directus schema apply /directus/schema.yaml --yes
fi

echo "Running custom migrations..."
npx directus database migrate:latest

echo "Starting Directus..."
exec npx directus start
