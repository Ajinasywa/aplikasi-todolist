package repository

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

// InitDB initializes the database connection
func InitDB() error {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Default connection string for development
		dbURL = "postgres://postgres:password@localhost:5432/todolist?sslmode=disable"
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return fmt.Errorf("unable to parse database config: %v", err)
	}

	DB, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("unable to connect to database: %v", err)
	}

	// Auto-migrate (Simple version)
	// Check if category column exists, if not add it
	_, err = DB.Exec(context.Background(), "ALTER TABLE todos ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Personal'")
	if err != nil {
		// Ignore error if column already exists or other non-critical issue?
		// Better to log but for now we proceed.
		// Actually, panic if migration fails?
		return fmt.Errorf("migration failed: %v", err)
	}

	return nil
}

// CloseDB closes the database connection
func CloseDB() {
	if DB != nil {
		DB.Close()
	}
}
