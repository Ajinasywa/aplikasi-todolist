package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"aplikasi-todolist/internal/handler"
	"aplikasi-todolist/internal/repository"
)

func main() {
	// Initialize database
	err := repository.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer repository.CloseDB()

	// Create router
	r := chi.NewRouter()

	// Add security headers middleware
	r.Use(securityHeadersMiddleware)

	// Add CORS middleware
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://192.168.1.21:3000", "*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	})
	r.Use(corsMiddleware.Handler)

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.AllowContentType("application/json"))

	// Initialize repositories
	userRepo := &repository.UserRepository{}
	todoRepo := &repository.TodoRepository{}

	// Initialize handlers
	authHandler := handler.NewAuthHandler(userRepo)
	todoHandler := handler.NewTodoHandler(todoRepo)

	// Public routes
	r.Post("/api/auth/register", authHandler.Register)
	r.Post("/api/auth/login", authHandler.Login)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(handler.AuthMiddleware)

		r.Get("/api/todos", todoHandler.GetTodos)
		r.Post("/api/todos", todoHandler.CreateTodo)
		r.Get("/api/todos/{id}", todoHandler.GetTodo)
		r.Put("/api/todos/{id}", todoHandler.UpdateTodo)
		r.Delete("/api/todos/{id}", todoHandler.DeleteTodo)
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

// securityHeadersMiddleware adds security headers to all responses
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Prevent MIME-type sniffing
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Prevent clickjacking
		w.Header().Set("X-Frame-Options", "DENY")

		// Enable XSS protection
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// Strict transport security
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

		// Content security policy
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';")

		// Referrer policy
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// Feature policy
		w.Header().Set("Feature-Policy", "geolocation 'none'; microphone 'none'; camera 'none'")

		next.ServeHTTP(w, r)
	})
}
