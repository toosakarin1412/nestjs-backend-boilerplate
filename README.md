# NestJS Boilerplate

A robust, production-ready NestJS boilerplate featuring secure authentication, user management, file uploads, and auto-generated API documentation.

## 🚀 Features

- **Authentication**: 
  - JWT integration (Access & Refresh Tokens).
  - Secure Password Hashing using **Argon2** (Superior to bcrypt).
  - Passport strategies (Local, JWT, Refresh).
  - Role-based payload structure.
- **User Management**:
  - Full CRUD operations.
  - **Avatar Upload** with `Multer` (configurable storage).
  - TypeORM integration with MySQL.
- **Documentation**:
  - Full **Swagger/OpenAPI** support at `/docs`.
  - Detailed decorators (`@ApiOperation`, `@ApiResponse`, etc.) for clear API specs.
- **Architecture**:
  - Modular structure (`AuthModule`, `UsersModule`).
  - Flattened error handling (Custom Exception Filter).
  - Validated DTOs with `class-validator`.

## 🛠️ Prerequisites

- Node.js (v18+)
- MySQL Database

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory. You can copy the structure below:
   
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_DATABASE=<database-name>

   # JWT Secrets (Change these in production!)
   JWT_SECRET=super_secret_access_key
   JWT_REFRESH_SECRET=super_secret_refresh_key
   
   # App Config
   PORT=3000
   AVATAR_PATH=./uploads
   ```

4. **Run Migrations (Optional/If configured)**
   ```bash
   npm run migration:run
   ```

## ▶️ Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production build
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the application is running, access the interactive Swagger documentation at:

**[http://localhost:3000/docs](http://localhost:3000/docs)**

This interface allows you to:
- Explore available endpoints.
- See request/response schemas.
- Test endpoints directly from the browser (Authorize with your JWT token).

## 📂 Project Structure

```
src/
├── filters/             # Global filters (e.g., AllExceptionsFilter)
├── modules/
│   ├── auth/            # Authentication logic
│   │   ├── dto/         # Login DTOs
│   │   ├── guard/       # Route guards (JwtGuard, LocalAuthGuard)
│   │   ├── strategies/  # Passport strategies (Local, Jwt, Refresh)
│   │   └── ...
│   └── users/           # User management
│       ├── dto/         # Create/Update User DTOs
│       ├── entities/    # TypeORM Entity
│       └── ...
├── main.ts              # App entry point & Swagger setup
└── ...
```

## 🔑 Key Endpoints

### Authentication
- `POST /auth/login`: Authenticate with email/password. Returns Access & Refresh tokens.
- `POST /auth/refresh`: Get a new Access token using a Refresh token.

### Users
- `POST /users`: Create a new user.
- `GET /users`: List all users (Guarded).
- `POST /users/:id/avatar`: Upload user avatar image (multipart/form-data).

## 🛡️ Security Best Practices Implemented

- **Argon2 Hashing**: Uses rigorous hashing configuration for passwords, safer than standard bcrypt.
- **DTO Validation**: Incoming data is strictly validated using `class-validator` and `ValidationPipe`.
- **Exception Filters**: Consistent error response format preventing leaks of stack traces to clients.

## 📄 License

[MIT licensed](LICENSE)
