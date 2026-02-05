package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"aplikasi-todolist/internal/model"
	"aplikasi-todolist/internal/repository"
	"aplikasi-todolist/internal/service"
	"aplikasi-todolist/internal/utils"
)

// TodoHandler handles todo-related HTTP requests
type TodoHandler struct {
	todoService *service.TodoService
}

// NewTodoHandler creates a new TodoHandler instance
func NewTodoHandler(todoRepo *repository.TodoRepository) *TodoHandler {
	todoService := service.NewTodoService(todoRepo)
	return &TodoHandler{
		todoService: todoService,
	}
}

// GetTodos retrieves all todos for the authenticated user
func (h *TodoHandler) GetTodos(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)

	todos, err := h.todoService.GetTodos(userID)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"todos": todos,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// CreateTodo creates a new todo for the authenticated user
func (h *TodoHandler) CreateTodo(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)

	var todoCreate model.TodoCreate
	if err := json.NewDecoder(r.Body).Decode(&todoCreate); err != nil {
		http.Error(w, `{"error": "invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Sanitize inputs
	todoCreate.Title = utils.SanitizeInput(todoCreate.Title)
	todoCreate.Description = utils.SanitizeInput(todoCreate.Description)
	todoCreate.Category = utils.SanitizeInput(todoCreate.Category)

	// Validate inputs
	if todoCreate.Title == "" {
		http.Error(w, `{"error": "title is required"}`, http.StatusBadRequest)
		return
	}

	if len(todoCreate.Title) > 255 {
		http.Error(w, `{"error": "title too long"}`, http.StatusBadRequest)
		return
	}

	if len(todoCreate.Description) > 1000 {
		http.Error(w, `{"error": "description too long"}`, http.StatusBadRequest)
		return
	}

	if len(todoCreate.Category) > 50 {
		http.Error(w, `{"error": "category too long"}`, http.StatusBadRequest)
		return
	}

	todo, err := h.todoService.CreateTodo(userID, &todoCreate)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

// GetTodo retrieves a specific todo by ID for the authenticated user
func (h *TodoHandler) GetTodo(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)

	// Extract todo ID from URL using chi
	todoIDStr := chi.URLParam(r, "id")
	todoID, err := strconv.Atoi(todoIDStr)
	if err != nil || todoID <= 0 {
		http.Error(w, `{"error": "invalid todo ID"}`, http.StatusBadRequest)
		return
	}

	todo, err := h.todoService.GetTodo(todoID, userID)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(todo)
}

// UpdateTodo updates an existing todo for the authenticated user
func (h *TodoHandler) UpdateTodo(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)

	// Extract todo ID from URL using chi
	todoIDStr := chi.URLParam(r, "id")
	todoID, err := strconv.Atoi(todoIDStr)
	if err != nil || todoID <= 0 {
		http.Error(w, `{"error": "invalid todo ID"}`, http.StatusBadRequest)
		return
	}

	var todoUpdate model.TodoUpdate
	if err := json.NewDecoder(r.Body).Decode(&todoUpdate); err != nil {
		http.Error(w, `{"error": "invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Sanitize inputs if they are provided
	if todoUpdate.Title != nil {
		sanitizedTitle := utils.SanitizeInput(*todoUpdate.Title)
		if len(sanitizedTitle) > 255 {
			http.Error(w, `{"error": "title too long"}`, http.StatusBadRequest)
			return
		}
		*todoUpdate.Title = sanitizedTitle
	}

	if todoUpdate.Description != nil {
		sanitizedDesc := utils.SanitizeInput(*todoUpdate.Description)
		if len(sanitizedDesc) > 1000 {
			http.Error(w, `{"error": "description too long"}`, http.StatusBadRequest)
			return
		}
		*todoUpdate.Description = sanitizedDesc
	}

	if todoUpdate.Category != nil {
		sanitizedCat := utils.SanitizeInput(*todoUpdate.Category)
		if len(sanitizedCat) > 50 {
			http.Error(w, `{"error": "category too long"}`, http.StatusBadRequest)
			return
		}
		*todoUpdate.Category = sanitizedCat
	}

	todo, err := h.todoService.UpdateTodo(userID, todoID, &todoUpdate)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(todo)
}

// DeleteTodo deletes a todo for the authenticated user
func (h *TodoHandler) DeleteTodo(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)

	// Extract todo ID from URL using chi
	todoIDStr := chi.URLParam(r, "id")
	todoID, err := strconv.Atoi(todoIDStr)
	if err != nil || todoID <= 0 {
		http.Error(w, `{"error": "invalid todo ID"}`, http.StatusBadRequest)
		return
	}

	err = h.todoService.DeleteTodo(todoID, userID)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}