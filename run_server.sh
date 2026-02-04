#!/bin/bash

# Script to run the backend server

echo "Starting to-do list backend server..."

# Set default environment variables if not set
export DATABASE_URL=${DATABASE_URL:-"postgres://postgres:password@localhost:5432/todolist?sslmode=disable"}
export JWT_SECRET=${JWT_SECRET:-"default_secret_key_for_development_please_change_in_production"}
export PORT=${PORT:-"8080"}

echo "Using database: ${DATABASE_URL}"
echo "Using port: ${PORT}"

# Run the server
go run cmd/server/main.go