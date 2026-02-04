package service

import (
	"errors"
	"fmt"

	"aplikasi-todolist/internal/model"
	"aplikasi-todolist/internal/repository"
	"aplikasi-todolist/internal/utils"
)

// AuthService handles authentication-related business logic
type AuthService struct {
	userRepo *repository.UserRepository
}

// NewAuthService creates a new AuthService instance
func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{
		userRepo: userRepo,
	}
}

// Register registers a new user
func (s *AuthService) Register(userReg *model.UserRegister) (*model.User, error) {
	// Check if user already exists
	exists, err := s.userRepo.UserExists(userReg.Email, userReg.Username)
	if err != nil {
		return nil, fmt.Errorf("failed to check if user exists: %w", err)
	}
	if exists {
		return nil, errors.New("user with this email or username already exists")
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(userReg.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create the user
	newUser := &model.User{
		Username: userReg.Username,
		Email:    userReg.Email,
		Password: hashedPassword,
	}

	err = s.userRepo.CreateUser(newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Return user without password
	newUser.Password = ""
	return newUser, nil
}

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(userLogin *model.UserLogin) (string, *model.User, error) {
	// Get user by email
	user, err := s.userRepo.GetUserByEmail(userLogin.Email)
	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	// Check password
	if !utils.CheckPasswordHash(userLogin.Password, user.Password) {
		return "", nil, errors.New("invalid email or password")
	}

	// Generate JWT token
	token, err := GenerateJWT(user.ID, user.Username)
	if err != nil {
		return "", nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// Return token and user (without password)
	user.Password = ""
	return token, user, nil
}