# Task Manager API

A RESTful backend API for managing tasks, projects, and collaborative workspaces. Built with Node.js, Express.js, and MongoDB, it includes JWT authentication, request validation, workspace membership management, and role-based access control.

## 1. Features

- **Authentication:** Registration, login, logout, token refresh, profile management, bcrypt password hashing, and JWT access/refresh tokens.
- **Workspaces:** Create and manage workspaces, join via invitation codes, manage members and roles, leave workspaces, and transfer ownership.
- **Projects:** Create, retrieve, update, and delete projects within workspaces.
- **Tasks:** Create, retrieve, update, and delete tasks; assign members; link projects; set status and priority; track completion progress; and use tags, links, and dates.
- **Task listing:** Filtering and pagination.

## 2. Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — HTTP server and routing
- **MongoDB Atlas** — Cloud database hosting
- **Mongoose** — MongoDB object modeling for Node.js
- **JWT** — Authentication tokens
- **bcrypt** — Password hashing
- **Zod** — Request validation
- **cookie-parser, CORS, dotenv** — Cookie handling, cross-origin configuration, and environment variables
- **Nodemon** — Development auto-restart

## 3. Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database (MongoDB Atlas or a local MongoDB instance)

### Installation

```bash
git clone https://github.com/punitkotian/task-manager-api.git
cd task-manager-api
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
SALT_ROUNDS=your_bcrypt_salt_rounds
ACCESS_TOKEN_EXPIRY=your_access_token_expiry
REFRESH_TOKEN_EXPIRY=your_refresh_token_expiry
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
NODE_ENV=development
```

Replace the placeholders with your actual configuration values. Use strong, separate secrets for access and refresh tokens, and never commit `.env` to version control.

### Running the Application

Development:

```bash
npm run dev
```

Start normally:

```bash
npm start
```

The server uses port `8000` by default unless `PORT` is set to another value.

## 4. API Endpoints

**Base URL:** `http://localhost:8000/api/v1`

### Users

| Method | Endpoint          | Description            |
| ------ | ----------------- | ---------------------- |
| POST   | `/users/register` | Register               |
| POST   | `/users/login`    | Log in                 |
| POST   | `/users/logout`   | Log out                |
| POST   | `/users/refresh`  | Refresh tokens         |
| GET    | `/users/me`       | Get current profile    |
| PATCH  | `/users/me`       | Update current profile |

### Workspaces

| Method | Endpoint                              | Description            |
| ------ | ------------------------------------- | ---------------------- |
| POST   | `/workspaces`                         | Create workspace       |
| GET    | `/workspaces`                         | List workspaces        |
| GET    | `/workspaces/:workspaceId`            | Get workspace          |
| PATCH  | `/workspaces/:workspaceId`            | Update workspace       |
| DELETE | `/workspaces/:workspaceId`            | Delete workspace       |
| DELETE | `/workspaces/:workspaceId/leave`      | Leave workspace        |
| PATCH  | `/workspaces/:workspaceId/ownership`  | Transfer ownership     |
| POST   | `/workspaces/:workspaceId/inviteCode` | Regenerate invite code |
| POST   | `/workspaces/join/:inviteCode`        | Join using invite code |

### Workspace Members

| Method | Endpoint                                     | Description       |
| ------ | -------------------------------------------- | ----------------- |
| GET    | `/workspaces/:workspaceId/members`           | List members      |
| POST   | `/workspaces/:workspaceId/members`           | Add a member      |
| GET    | `/workspaces/:workspaceId/members/:memberId` | Get member        |
| PATCH  | `/workspaces/:workspaceId/members/:memberId` | Update membership |
| DELETE | `/workspaces/:workspaceId/members/:memberId` | Remove member     |

### Projects

| Method | Endpoint                                       | Description    |
| ------ | ---------------------------------------------- | -------------- |
| POST   | `/workspaces/:workspaceId/projects`            | Create project |
| GET    | `/workspaces/:workspaceId/projects`            | List projects  |
| GET    | `/workspaces/:workspaceId/projects/:projectId` | Get project    |
| PATCH  | `/workspaces/:workspaceId/projects/:projectId` | Update project |
| DELETE | `/workspaces/:workspaceId/projects/:projectId` | Delete project |

Project listing supports filtering and pagination through query parameters.

### Tasks

| Method | Endpoint                                 | Description |
| ------ | ---------------------------------------- | ----------- |
| POST   | `/workspaces/:workspaceId/tasks`         | Create task |
| GET    | `/workspaces/:workspaceId/tasks`         | List tasks  |
| GET    | `/workspaces/:workspaceId/tasks/:taskId` | Get task    |
| PATCH  | `/workspaces/:workspaceId/tasks/:taskId` | Update task |
| DELETE | `/workspaces/:workspaceId/tasks/:taskId` | Delete task |

Task listing supports filtering and pagination through query parameters.

## 5. Database Design

The application uses Mongoose schemas and MongoDB ObjectId references to connect related documents.

- **User:** Stores user account details and authentication information.
- **Workspace:** Stores workspace name, description, owner reference, and invitation code.
- **Member:** Links a user to a workspace and stores their workspace role (`owner`, `admin`, or `member`).
- **Project:** Stores project details, status, creator, and workspace reference.
- **Task:** Stores task details, status, priority, completion progress, dates, tags, links, and references to its workspace, project, creator, and assignee.

Task statuses include `backlog`, `todo`, `in-progress`, `review`, `completed`, and `archived`. Priorities include `low`, `medium`, `high`, and `critical`.

## 6. Validation and Security

- Zod validates incoming request data.
- Authentication middleware protects routes that require a signed-in user.
- JWT access and refresh tokens support authentication and token renewal.
- bcrypt hashes user passwords.
- Workspace membership and roles are used for access checks.
- Centralized error handling standardizes error responses.

## 7. Project Structure

```text
task-manager-api/
├── app.js
├── package.json
└── src/
    ├── api/
    │   └── v1/
    │       ├── routes/
    │       ├── controllers/
    │       ├── models/
    │       └── validators/
    ├── config/
    ├── db/
    ├── errors/
    ├── middleware/
    └── utils/
```
