package service

import (
	"fmt"

	"aplikasi-todolist/internal/model"
	"aplikasi-todolist/internal/repository"
)

// TodoService handles todo-related business logic
type TodoService struct {
	todoRepo *repository.TodoRepository
}

// NewTodoService creates a new TodoService instance
func NewTodoService(todoRepo *repository.TodoRepository) *TodoService {
	return &TodoService{
		todoRepo: todoRepo,
	}
}

// GetTodos retrieves all todos for a user
func (s *TodoService) GetTodos(userID int) ([]*model.Todo, error) {
	todos, err := s.todoRepo.GetTodosByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get todos: %w", err)
	}
	return todos, nil
}

// GetTodo retrieves a specific todo by ID for a user
func (s *TodoService) GetTodo(todoID, userID int) (*model.Todo, error) {
	todo, err := s.todoRepo.GetTodoByID(todoID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get todo: %w", err)
	}
	return todo, nil
}

// CreateTodo creates a new todo for a user
func (s *TodoService) CreateTodo(userID int, todoCreate *model.TodoCreate) (*model.Todo, error) {
	todo := &model.Todo{
		UserID:      userID,
		Title:       todoCreate.Title,
		Description: todoCreate.Description,
		IsDone:      false,
	}

	err := s.todoRepo.CreateTodo(todo)
	if err != nil {
		return nil, fmt.Errorf("failed to create todo: %w", err)
	}
	return todo, nil
}

// UpdateTodo updates an existing todo for a user
func (s *TodoService) UpdateTodo(userID int, todoID int, todoUpdate *model.TodoUpdate) (*model.Todo, error) {
	// First, get the existing todo to update
	existingTodo, err := s.todoRepo.GetTodoByID(todoID, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get todo: %w", err)
	}

	// Update fields if they are provided
	if todoUpdate.Title != nil {
		existingTodo.Title = *todoUpdate.Title
	}
	if todoUpdate.Description != nil {
		existingTodo.Description = *todoUpdate.Description
	}
	if todoUpdate.IsDone != nil {
		existingTodo.IsDone = *todoUpdate.IsDone
	}

	err = s.todoRepo.UpdateTodo(existingTodo)
	if err != nil {
		return nil, fmt.Errorf("failed to update todo: %w", err)
	}

	return existingTodo, nil
}

// DeleteTodo deletes a todo for a user
func (s *TodoService) DeleteTodo(todoID, userID int) error {
	err := s.todoRepo.DeleteTodo(todoID, userID)
	if err != nil {
		return fmt.Errorf("failed to delete todo: %w", err)
	}
	return nil
}