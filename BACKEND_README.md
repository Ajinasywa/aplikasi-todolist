# To-Do List Backend

This is the backend implementation for the to-do list application, built with Go following clean architecture principles.

## Features

- User authentication (register/login) with JWT
- Full CRUD operations for to-do items
- Support for markdown in to-do descriptions
- Clean architecture with separation of concerns
- PostgreSQL database with pgx driver
- Chi router for HTTP routing

## Tech Stack

- **Language**: Go (Golang)
- **Router**: Chi
- **Database**: PostgreSQL 15+ (with pgx driver)
- **Authentication**: JWT with bcrypt password hashing
- **Architecture**: Clean architecture (cmd, internal/handler, internal/repository, internal/service)

## Project Structure

```
aplikasi-todolist/
├── cmd/
│   └── server/
│       ├── main.go
│       └── main_test.go
├── internal/
│   ├── config/
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

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user

### To-Dos (requires authentication)

- `GET /api/todos` - Get all to-dos for the authenticated user
- `POST /api/todos` - Create a new to-do
- `GET /api/todos/{id}` - Get a specific to-do
- `PUT /api/todos/{id}` - Update a to-do
- `DELETE /api/todos/{id}` - Delete a to-do

For detailed API documentation, see [docs/api_contract.md](docs/api_contract.md).

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (defaults to local development settings)
- `JWT_SECRET` - Secret key for JWT signing (defaults to development key)
- `PORT` - Port to run the server on (defaults to 8080)

## Setup

1. Clone the repository
2. Install Go 1.25+
3. Install PostgreSQL 15+
4. Set up environment variables
5. Run database migrations
6. Start the server

```bash
# Install dependencies
go mod tidy

# Run the server
go run cmd/server/main.go
```

## Database Migrations

Apply the SQL migration files in the `migrations/` directory to set up your database schema.

## Testing

Run the tests:

```bash
go test ./...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request