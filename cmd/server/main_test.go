package main

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"aplikasi-todolist/internal/handler"
	"aplikasi-todolist/internal/repository"
)

func TestInitialization(t *testing.T) {
	// Test that handlers can be initialized without errors
	userRepo := &repository.UserRepository{}
	todoRepo := &repository.TodoRepository{}
	
	authHandler := handler.NewAuthHandler(userRepo)
	todoHandler := handler.NewTodoHandler(todoRepo)

	// Verify handlers are created
	assert.NotNil(t, authHandler)
	assert.NotNil(t, todoHandler)
}