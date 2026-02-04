# Backend Implementation Plan for To-Do List Application

## Overview
This document outlines the implementation plan for the Go backend of the to-do list application. The backend will follow clean architecture principles and provide all required functionality as specified.

## Technical Specifications
- Router: Chi router
- Database: PostgreSQL 15+ with pgx driver
- Authentication: JWT with bcrypt password hashing
- Architecture: Clean architecture (cmd, internal/handler, internal/repository, internal/service)

## Project Structure
```
aplikasi-todolist/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── handler/
│   │   ├── auth_handler.go
│   │   ├── todo_handler.go
│   │   └── middleware.go
│   ├── model/
│   │   ├── user.go
│   │   └── todo.go
│   ├── repository/
│   │   ├── user_repository.go
│   │   ├── todo_repository.go
│   │   └── database.go
│   ├── service/
│   │   ├── auth_service.go
│   │   ├── todo_service.go
│   │   └── jwt.go
│   └── utils/
│       ├── password.go
│       └── validator.go
├── migrations/
│   ├── 001_create_users_table.sql
│   └── 002_create_todos_table.sql
├── docs/
│   └── api_contract.md
└── go.mod
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table
```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,  -- Supports markdown content
    is_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Contract

### Authentication Endpoints

#### POST /api/auth/register
Request:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

Response (Success - 201):
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "created_at": "timestamp"
}
```

Response (Error - 400):
```json
{
  "error": "error message"
}
```

#### POST /api/auth/login
Request:
```json
{
  "email": "string",
  "password": "string"
}
```

Response (Success - 200):
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string"
  }
}
```

Response (Error - 401):
```json
{
  "error": "Invalid credentials"
}
```

### Todo Endpoints (require authentication via Authorization header: Bearer token)

#### GET /api/todos
Response (Success - 200):
```json
{
  "todos": [
    {
      "id": 1,
      "title": "string",
      "description": "markdown text",
      "is_done": false,
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/todos
Request:
```json
{
  "title": "string",
  "description": "markdown text"
}
```

Response (Success - 201):
```json
{
  "id": 1,
  "title": "string",
  "description": "markdown text",
  "is_done": false,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### PUT /api/todos/{id}
Request:
```json
{
  "title": "string",
  "description": "markdown text",
  "is_done": true
}
```

Response (Success - 200):
```json
{
  "id": 1,
  "title": "string",
  "description": "markdown text",
  "is_done": true,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### DELETE /api/todos/{id}
Response (Success - 204): No content

Response (Error - 404):
```json
{
  "error": "Todo not found"
}
```

## Implementation Steps

1. Set up Go modules and dependencies
2. Create the project structure
3. Implement database connection and models
4. Implement repository layer
5. Implement service layer
6. Implement handler layer and routes
7. Implement JWT authentication
8. Implement middleware for authentication
9. Add validation and error handling
10. Write tests
11. Document API