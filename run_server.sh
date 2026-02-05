#!/bin/bash

# Script to run the backend server

echo "Starting to-do list backend server..."

# Load .env file if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Construct DATABASE_URL if not set but individual vars are
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ]; then
  export DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"
fi

echo "Using database: ${DATABASE_URL}"
echo "Using port: ${PORT}"

# Run the server
go run cmd/server/main.go