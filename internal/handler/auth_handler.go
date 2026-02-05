package handler

import (
	"encoding/json"
	"net/http"

	"aplikasi-todolist/internal/model"
	"aplikasi-todolist/internal/repository"
	"aplikasi-todolist/internal/service"
	"aplikasi-todolist/internal/utils"
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

	// Sanitize inputs
	userReg.Username = utils.SanitizeInput(userReg.Username)
	userReg.Email = utils.SanitizeInput(userReg.Email)
	userReg.Password = utils.SanitizeInput(userReg.Password)

	// Validate inputs
	if err := utils.ValidateUsername(userReg.Username); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	if err := utils.ValidateEmail(userReg.Email); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	if err := utils.ValidatePassword(userReg.Password); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
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

	// Sanitize inputs
	userLogin.Email = utils.SanitizeInput(userLogin.Email)
	userLogin.Password = utils.SanitizeInput(userLogin.Password)

	// Validate inputs
	if err := utils.ValidateEmail(userLogin.Email); err != nil {
		http.Error(w, `{"error": "invalid email format"}`, http.StatusBadRequest)
		return
	}

	if userLogin.Password == "" {
		http.Error(w, `{"error": "password is required"}`, http.StatusBadRequest)
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