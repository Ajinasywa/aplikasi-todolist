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

	// Add CORS middleware
	corsMiddleware := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders: []string{"Link"},
		AllowCredentials: true,
		MaxAge: 300, // Maximum value not ignored by any of major browsers
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