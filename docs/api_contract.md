# API Contract Documentation

## Overview
This document defines the API contract for the to-do list application backend. All endpoints return JSON responses, and follow RESTful principles.

## Common Response Format

### Success Responses
Most successful operations return a JSON object with the relevant data.

### Error Responses
All error responses follow this format:
```json
{
  "error": "descriptive error message"
}
```

Status codes used:
- 400: Bad Request (validation errors, malformed JSON)
- 401: Unauthorized (authentication required or failed)
- 404: Not Found (resource not found)
- 500: Internal Server Error (server-side errors)

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required, must be valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Successful Response (201 Created):**
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "username, email, and password are required"
}
```

### POST /api/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Successful Response (200 OK):**
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "invalid email or password"
}
```

## Todo Endpoints
All todo endpoints require authentication via the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### GET /api/todos
Retrieve all todos for the authenticated user.

**Successful Response (200 OK):**
```json
{
  "todos": [
    {
      "id": 1,
      "user_id": 1,
      "title": "string",
      "description": "supports **markdown** formatting",
      "is_done": false,
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/todos
Create a new todo for the authenticated user.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional, supports markdown formatting)"
}
```

**Successful Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "string",
  "description": "supports **markdown** formatting",
  "is_done": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### GET /api/todos/{id}
Retrieve a specific todo by ID for the authenticated user.

**Successful Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "string",
  "description": "supports **markdown** formatting",
  "is_done": false,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "todo not found"
}
```

### PUT /api/todos/{id}
Update an existing todo for the authenticated user.

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional, supports markdown formatting)",
  "is_done": true (optional)
}
```

All fields are optional - only provided fields will be updated.

**Successful Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "updated title",
  "description": "updated **markdown** description",
  "is_done": true,
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

### DELETE /api/todos/{id}
Delete a todo for the authenticated user.

**Successful Response (204 No Content):**
No response body.

**Error Response (404 Not Found):**
```json
{
  "error": "todo not found or not owned by user"
}
```

## Markdown Support
The `description` field in todos supports markdown formatting. The backend stores the raw markdown text, and the frontend is responsible for rendering it appropriately.