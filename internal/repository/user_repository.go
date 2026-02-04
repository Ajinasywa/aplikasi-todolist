package repository

import (
	"context"
	"fmt"

	"aplikasi-todolist/internal/model"
)

// UserRepository handles user-related database operations
type UserRepository struct{}

// GetUserByEmail retrieves a user by their email
func (r *UserRepository) GetUserByEmail(email string) (*model.User, error) {
	query := `
		SELECT id, username, email, password_hash, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user model.User
	err := DB.QueryRow(context.Background(), query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.Password, // This will be the hashed password
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	return &user, nil
}

// GetUserByID retrieves a user by their ID
func (r *UserRepository) GetUserByID(userID int) (*model.User, error) {
	query := `
		SELECT id, username, email, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user model.User
	err := DB.QueryRow(context.Background(), query, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	return &user, nil
}

// CreateUser creates a new user
func (r *UserRepository) CreateUser(user *model.User) error {
	query := `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`

	err := DB.QueryRow(context.Background(), query,
		user.Username,
		user.Email,
		user.Password, // This should be the hashed password
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

// UserExists checks if a user exists by email or username
func (r *UserRepository) UserExists(email, username string) (bool, error) {
	query := `
		SELECT EXISTS(
			SELECT 1 FROM users WHERE email = $1 OR username = $2
		)
	`

	var exists bool
	err := DB.QueryRow(context.Background(), query, email, username).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check if user exists: %w", err)
	}

	return exists, nil
}