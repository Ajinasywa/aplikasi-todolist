package repository

import (
	"context"
	"fmt"

	"aplikasi-todolist/internal/model"
)

// TodoRepository handles todo-related database operations
type TodoRepository struct{}

// GetTodosByUserID retrieves all todos for a specific user
func (r *TodoRepository) GetTodosByUserID(userID int) ([]*model.Todo, error) {
	query := `
		SELECT id, user_id, title, description, is_done, created_at, updated_at
		FROM todos
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := DB.Query(context.Background(), query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get todos: %w", err)
	}
	defer rows.Close()

	var todos []*model.Todo
	for rows.Next() {
		var todo model.Todo
		err := rows.Scan(
			&todo.ID,
			&todo.UserID,
			&todo.Title,
			&todo.Description,
			&todo.IsDone,
			&todo.CreatedAt,
			&todo.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan todo: %w", err)
		}
		todos = append(todos, &todo)
	}

	return todos, nil
}

// GetTodoByID retrieves a specific todo by ID and user ID
func (r *TodoRepository) GetTodoByID(todoID, userID int) (*model.Todo, error) {
	query := `
		SELECT id, user_id, title, description, is_done, created_at, updated_at
		FROM todos
		WHERE id = $1 AND user_id = $2
	`

	var todo model.Todo
	err := DB.QueryRow(context.Background(), query, todoID, userID).Scan(
		&todo.ID,
		&todo.UserID,
		&todo.Title,
		&todo.Description,
		&todo.IsDone,
		&todo.CreatedAt,
		&todo.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("todo not found: %w", err)
	}

	return &todo, nil
}

// CreateTodo creates a new todo
func (r *TodoRepository) CreateTodo(todo *model.Todo) error {
	query := `
		INSERT INTO todos (user_id, title, description)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`

	err := DB.QueryRow(context.Background(), query,
		todo.UserID,
		todo.Title,
		todo.Description,
	).Scan(&todo.ID, &todo.CreatedAt, &todo.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create todo: %w", err)
	}

	return nil
}

// UpdateTodo updates an existing todo
func (r *TodoRepository) UpdateTodo(todo *model.Todo) error {
	query := `
		UPDATE todos
		SET title = COALESCE($1, title),
		    description = COALESCE($2, description),
		    is_done = COALESCE($3, is_done),
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $4 AND user_id = $5
		RETURNING title, description, is_done, updated_at
	`

	err := DB.QueryRow(context.Background(), query,
		todo.Title,
		todo.Description,
		todo.IsDone,
		todo.ID,
		todo.UserID,
	).Scan(
		&todo.Title,
		&todo.Description,
		&todo.IsDone,
		&todo.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update todo: %w", err)
	}

	return nil
}

// DeleteTodo deletes a todo by ID and user ID
func (r *TodoRepository) DeleteTodo(todoID, userID int) error {
	query := `
		DELETE FROM todos
		WHERE id = $1 AND user_id = $2
	`

	commandTag, err := DB.Exec(context.Background(), query, todoID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete todo: %w", err)
	}

	if commandTag.RowsAffected() == 0 {
		return fmt.Errorf("todo not found or not owned by user")
	}

	return nil
}