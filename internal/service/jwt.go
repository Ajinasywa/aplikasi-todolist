package service

import (
	"crypto/subtle"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// JWT Claims struct
type Claims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	jwt.StandardClaims
}

// GenerateJWT generates a new JWT token with enhanced security
func GenerateJWT(userID int, username string) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return "", errors.New("JWT_SECRET environment variable is not set")
	}

	// Validate inputs to prevent injection
	if userID <= 0 {
		return "", errors.New("invalid user ID")
	}
	
	if len(username) > 100 || len(username) == 0 {
		return "", errors.New("invalid username")
	}

	expirationTime := time.Now().Add(24 * time.Hour) // Token expires in 24 hours
	claims := &Claims{
		UserID:   userID,
		Username: username,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
			IssuedAt:  time.Now().Unix(),
			Issuer:    "todolist-app", // Add issuer claim for additional security
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))

	if err != nil {
		return "", fmt.Errorf("failed to generate JWT: %w", err)
	}

	return tokenString, nil
}

// ValidateJWT validates a JWT token and returns the claims with enhanced security
func ValidateJWT(tokenString string) (*Claims, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("JWT_SECRET environment variable is not set")
	}

	// Prevent timing attacks by using constant-time comparison
	if subtle.ConstantTimeCompare([]byte(tokenString), []byte("")) == 1 {
		return nil, errors.New("empty token")
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to validate JWT: %w", err)
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Additional validation: check if token is expired
	if time.Now().Unix() > claims.ExpiresAt {
		return nil, errors.New("token has expired")
	}

	// Validate issuer
	if claims.Issuer != "todolist-app" {
		return nil, errors.New("invalid token issuer")
	}

	return claims, nil
}