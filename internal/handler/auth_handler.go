package handler

import (
	"encoding/json"
	"net/http"

	"aplikasi-todolist/internal/model"
	"aplikasi-todolist/internal/repository"
	"aplikasi-todolist/internal/service"
)

// AuthHandler handles authentication-related HTTP requests
type AuthHandler struct {
	authService *service.AuthService
}

// NewAuthHandler creates a new AuthHandler instance
func NewAuthHandler(userRepo *repository.UserRepository) *AuthHandler {
	authService := service.NewAuthService(userRepo)
	return &AuthHandler{
		authService: authService,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var userReg model.UserRegister
	if err := json.NewDecoder(r.Body).Decode(&userReg); err != nil {
		http.Error(w, `{"error": "invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Basic validation
	if userReg.Username == "" || userReg.Email == "" || userReg.Password == "" {
		http.Error(w, `{"error": "username, email, and password are required"}`, http.StatusBadRequest)
		return
	}

	user, err := h.authService.Register(&userReg)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

// Login handles user login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var userLogin model.UserLogin
	if err := json.NewDecoder(r.Body).Decode(&userLogin); err != nil {
		http.Error(w, `{"error": "invalid JSON format"}`, http.StatusBadRequest)
		return
	}

	// Basic validation
	if userLogin.Email == "" || userLogin.Password == "" {
		http.Error(w, `{"error": "email and password are required"}`, http.StatusBadRequest)
		return
	}

	token, user, err := h.authService.Login(&userLogin)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusUnauthorized)
		return
	}

	response := map[string]interface{}{
		"token": token,
		"user":  user,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}