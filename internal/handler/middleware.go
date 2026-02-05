package handler

import (
	"context"
	"net/http"
	"strings"

	"aplikasi-todolist/internal/service"
)

// Context key for storing user info
type contextKey string

const UserIDKey contextKey = "userID"
const UsernameKey contextKey = "username"

// AuthMiddleware validates JWT tokens and adds user info to the request context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "authorization header required"}`, http.StatusUnauthorized)
			return
		}

		// Expecting format: "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.Error(w, `{"error": "invalid authorization header format"}`, http.StatusUnauthorized)
			return
		}

		tokenString := tokenParts[1]

		claims, err := service.ValidateJWT(tokenString)
		if err != nil {
			http.Error(w, `{"error": "invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		// Add user info to context
		ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
		ctx = context.WithValue(ctx, UsernameKey, claims.Username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}