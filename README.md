# Sparknity Task Manager

A full-stack Task Manager assignment starter: Java 17 + Spring Boot REST API, Spring Security/JWT, PostgreSQL, and React with JavaScript.

## Features
- **Authentication**: Register/login with BCrypt password hashing and JWT token response.
- **Task Management**: Authenticated task create, list, get by id, update, and delete endpoints.
- **Data Isolation**: Strict user-scoped task ownership checks in service queries.
- **Live Interactive UI**: High-performance canvas with interactive ambient constellation particles reacting to cursor movement.
- **Dark & Light Mode**: Seamless theme toggle with local storage persistence.
- **Productivity Progress Bar**: Real-time completion rate meter tracking finished tasks.
- **Smart Filtering & Search**: Instant keyword search, status tabs (`All`, `To do`, `In progress`, `Completed`), and overdue task detection.
- **Quick Actions & Shortcuts**: Keyboard shortcuts (`N` for new task, `/` to search, `Esc` to close), date quick-chips, and 1-click status transitions.
- **Export Utility**: One-click export of tasks to JSON for backup and reporting.
- **Unit Testing (Bonus)**: Service layer unit tests with JUnit 5 and Mockito (`mvn test`).
- **Postman Collection**: Pre-configured API test suite included in `postman/`.

## Requirements
JDK 17+, Maven 3.8+, PostgreSQL, Node.js 18+, npm.

## Run database
Create a database named `task_manager` in PostgreSQL:
```sql
CREATE DATABASE task_manager;
```
Defaults are localhost:5432, user `postgres`, password `postgres`. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables if yours differ.

## Run backend
```bash
cd backend
mvn spring-boot:run
```
To run unit tests:
```bash
cd backend
mvn test
```
API base URL: `http://localhost:8080`. JPA `ddl-auto=update` creates/updates tables. For non-local use, set a unique strong Base64 `JWT_SECRET` environment variable (e.g. generate using `openssl rand -base64 32`) and never commit secrets. The checked-in default JWT secret is only for local demo.

## Run frontend
In another terminal:
```bash
cd frontend
npm install
```
Copy `.env.example` to `.env` and adjust `VITE_API_BASE_URL` if needed, then:
```bash
npm run dev
```
Open the Vite URL printed in the terminal, normally `http://localhost:5173`.

## API
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register; returns JWT |
| POST | `/api/auth/login` | No | Login; returns JWT |
| POST | `/api/tasks` | Bearer | Create task (201) |
| GET | `/api/tasks` | Bearer | List current user's tasks |
| GET | `/api/tasks/{id}` | Bearer | Retrieve an owned task |
| PUT | `/api/tasks/{id}` | Bearer | Update an owned task |
| DELETE | `/api/tasks/{id}` | Bearer | Delete an owned task |

Task example:
```json
{"title":"Prepare demo","description":"Show CRUD","status":"TODO","dueDate":"2026-10-27"}
```
`status` must be `TODO`, `IN_PROGRESS`, or `DONE`. `dueDate` is an ISO date or `null`.

## Postman
Import `postman/Sparknity-Task-Manager.postman_collection.json`. Start backend and database, run Register (once), then Login to set the `token` variable. Run task requests in order: Create, List, Get, Update, Delete. The no-token request should return 401. If the test email is already registered, use Login rather than Register.

## GitHub
Create an empty GitHub repository, then from this project root:
```bash
git init
git add .
git commit -m "Build Task Manager with JWT authentication"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sparknity-task-manager.git
git push -u origin main
```
Do not push `.env`, secrets, `node_modules`, or Maven `target/`.

## Demo checklist
1. Register, then show the dashboard.
2. Create, edit, update status, and delete tasks.
3. Refresh and verify persistence.
4. Log out and show protected route redirects to login.
5. Log in and show saved tasks.
6. Use Postman to demonstrate JWT and a protected request without a token.
7. Create a second account and verify it cannot see the first user's tasks.

## Important
This is a generated starter project. Run and test it in your own environment before submitting, fix any issues found, and understand each part well enough to explain it. The company may ask about the controller → service → repository layers, JWT filter, BCrypt, DTOs, ownership checks, and Axios interceptor.
