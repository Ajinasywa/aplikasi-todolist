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
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")

		if host != "" && user != "" && dbname != "" {
			dbURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)
		} else {
			// Fallback default
			dbURL = "postgres://postgres:password@localhost:5432/todolist?sslmode=disable"
		}
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
		return fmt.Errorf("migration failed: %v", err)
	}

	// Add priority column if it doesn't exist
	_, err = DB.Exec(context.Background(), "ALTER TABLE todos ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium'")
	if err != nil {
		return fmt.Errorf("migration failed: %v", err)
	}

	// Add due_date column if it doesn't exist
	_, err = DB.Exec(context.Background(), "ALTER TABLE todos ADD COLUMN IF NOT EXISTS due_date TIMESTAMP NULL")
	if err != nil {
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
