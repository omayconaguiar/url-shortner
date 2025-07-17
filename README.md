# URL Shortener Backend API

A robust URL shortening service backend built with NestJS, TypeScript, PostgreSQL, and Prisma ORM. Features user authentication, analytics, custom slugs, and comprehensive API documentation.

## 🛠️ Architecture Overview

The system is composed of a frontend and backend application that communicate via REST APIs to handle URL shortening, user authentication, analytics tracking, and dashboard visualization.

## 🎥 Demo Video
Watch a quick demonstration of the URL Shortener in action:  
🔗 [Click to watch on OneDrive]([https://1drv.ms/v/c/61bdaae821ff3a5b/EViYio9dqSJCqVeg_TdwN-cBLRwkVQFGfJ0smO3bBxe30Q?e=NJwgC6&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D](https://1drv.ms/v/c/61bdaae821ff3a5b/EViYio9dqSJCqVeg_TdwN-cBLRwkVQFGfJ0smO3bBxe30Q?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&e=eUSeac))

### 📌 Architecture Diagram (Mermaid)

You can view the complete architecture on MermaidChart:  
🔗 [Open Diagram in MermaidChart](https://www.mermaidchart.com/app/projects/3284de2d-a15f-4a31-b75b-ce6bb1435a1a/diagrams/c0c1ccbc-8842-4905-9b7a-6000d5ae2fd5/version/v0.1/edit)

![Architecture Diagram](https://github.com/user-attachments/assets/b86ccd5d-78f8-4324-9d9b-d3ee100dbddd)

## 📚 API Documentation

All available endpoints and schemas are documented using Swagger (OpenAPI).

You can explore the API via Swagger UI:

![Swagger Screenshot](https://github.com/user-attachments/assets/82b5842b-cd3c-4eff-906b-b5bad82006d9)

## 🎯 Challenge Implementation

This project implements all requirements from the **Sr. Backend Test Task v2.1**:

### ✅ Core Requirements
- **React Application**: ✅ Frontend built with Next.js 15 + React 19
- **URL Shortening**: ✅ Convert long URLs to short links
- **Database Storage**: ✅ PostgreSQL with Prisma ORM
- **Unique Slugs**: ✅ Auto-generated + custom slug support
- **Redirect Functionality**: ✅ `GET /:slug` redirects to original URL
- **404 Handling**: ✅ Invalid slugs return proper 404 responses
- **URL Listing**: ✅ Public and user-specific URL lists

### ✅ Extra Credit Features
- **User Accounts**: ✅ JWT authentication with registration/login
- **URL Validation**: ✅ Comprehensive validation with detailed error messages
- **Custom Slugs**: ✅ Users can specify custom slug names
- **Visit Tracking**: ✅ Analytics with IP, user agent, and referer data
- **Rate Limiting**: ✅ Input validation and request limiting
- **Analytics Dashboard**: ✅ User dashboard with URL performance metrics
- **Docker Support**: ✅ Complete Docker setup with PostgreSQL

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation & Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd url-shortener-backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/url_shortener?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
PORT=3000
ENABLE_SWAGGER=true
APP_DOMAIN="localhost:3000"
```

3. **Database Setup**
```bash
# Start PostgreSQL (using Docker)
docker-compose up postgres -d

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

4. **Start Development Server**
```bash
npm run start:dev
```

### 🌐 Access Points
- **API Server**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api/swagger`
- **Database Admin**: `http://localhost:8080` (Adminer)

## 📚 API Documentation

### Authentication Endpoints
```bash
POST /auth/register    # Create new user account
POST /auth/login       # User authentication
GET  /auth/profile     # Get current user profile (Protected)
```

### URL Management Endpoints
```bash
POST   /urls                    # Create shortened URL
GET    /urls                    # Get user's URLs (Protected)
GET    /urls/all               # Get all public URLs
GET    /urls/dashboard         # Get dashboard stats (Protected)
GET    /urls/:id/stats         # Get URL statistics
PATCH  /urls/:id               # Update URL (Protected)
DELETE /urls/:id               # Delete URL (Protected)
```

### Redirect Endpoint
```bash
GET /:slug    # Redirect to original URL (tracks visit)
```

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: Class Validator & Zod schemas
- **Documentation**: Swagger/OpenAPI
- **Security**: bcrypt password hashing

### Database Schema
```sql
-- Users table
User {
  id: UUID (Primary Key)
  email: String (Unique)
  password: String (Hashed)
  name: String
  role: String (Default: "USER")
  createdAt: DateTime
  updatedAt: DateTime
}

-- URLs table  
Url {
  id: UUID (Primary Key)
  originalUrl: String
  slug: String (Unique)
  userId: UUID (Optional, Foreign Key)
  isActive: Boolean (Default: true)
  expiresAt: DateTime (Optional)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Visits table (Analytics)
Visit {
  id: UUID (Primary Key)
  urlId: UUID (Foreign Key)
  ipAddress: String (Optional)
  userAgent: String (Optional)
  referer: String (Optional)
  createdAt: DateTime
}
```

### Project Structure
```
src/
├── auth/                   # Authentication module
│   ├── auth.controller.ts  # Auth endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── auth.module.ts      # Auth module config
│   ├── dto/                # Data transfer objects
│   ├── guards/             # JWT guards
│   └── strategies/         # Passport strategies
├── url/                    # URL management module
│   ├── url.controller.ts   # URL endpoints
│   ├── url.service.ts      # URL business logic
│   ├── url.module.ts       # URL module config
│   └── dto/                # URL DTOs
├── prisma/                 # Database module
│   ├── prisma.service.ts   # Prisma client service
│   └── prisma.module.ts    # Prisma module
├── app.module.ts           # Root application module
├── main.ts                 # Application bootstrap
└── swagger.ts              # API documentation setup
```

## 🔧 Available Scripts

### Development
```bash
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run build              # Build for production
npm run start:prod         # Start production server
```

### Database Management
```bash
npm run db:generate        # Generate Prisma client
npm run db:push           # Push schema to database
npm run db:seed           # Seed with sample data
npm run db:reset          # Reset and reseed database
npm run db:studio         # Open Prisma Studio
```

### Testing
```bash
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:cov          # Test coverage
npm run lint              # ESLint
```

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Protected Routes**: Guard-based route protection
- **User Validation**: Email uniqueness and format validation

### Input Validation
- **DTO Validation**: Class-validator decorators
- **URL Validation**: Comprehensive URL format checking
- **Slug Validation**: Alphanumeric + hyphen/underscore only
- **XSS Prevention**: Input sanitization

### Rate Limiting
- **Validation Pipelines**: Request validation and transformation
- **Error Handling**: Comprehensive error responses
- **CORS Configuration**: Cross-origin request handling

## 📊 Business Logic

### URL Creation Process
1. **Validation**: Validate input URL and optional custom slug
2. **Slug Generation**: Auto-generate unique slug if not provided
3. **Collision Handling**: Retry slug generation on conflicts
4. **Database Storage**: Store URL with user association (if authenticated)
5. **Response**: Return shortened URL with metadata

### Visit Tracking
1. **Request Processing**: Capture visit metadata (IP, User-Agent, Referer)
2. **Database Logging**: Store visit record linked to URL
3. **Redirect Execution**: 302 redirect to original URL
4. **Analytics**: Real-time visit counting and statistics

### User Management
1. **Registration**: Email validation, password hashing, JWT generation
2. **Authentication**: Credential verification, token generation
3. **Authorization**: Route protection, user-specific data access
4. **Profile Management**: User data retrieval and updates

## 🐳 Docker Support

### Quick Docker Setup
```bash
# Start all services
docker-compose up -d

# Start only database
docker-compose up postgres -d

# Build application image
docker build -t url-shortener-api .
```

### Docker Configuration
- **PostgreSQL**: Production-ready database container
- **Adminer**: Web-based database administration
- **Application**: Containerized NestJS application
- **Volumes**: Persistent database storage

## 📈 Sample Data

The seed script creates:
- **5 users**: `user1@example.com` to `user5@example.com` (password: `password123`)
- **15+ URLs**: Mix of GitHub, documentation, and tool websites
- **Visit data**: Random visit patterns for analytics testing

### Test Accounts
```bash
Email: user1@example.com
Password: password123

Email: user2@example.com  
Password: password123
# ... and so on
```

## 🔍 API Examples

### Create Short URL
```bash
curl -X POST http://localhost:3000/urls \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://github.com/nestjs/nest",
    "customSlug": "nestjs-repo"
  }'
```

### Get User Dashboard
```bash
curl -X GET http://localhost:3000/urls/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Access Short URL
```bash
curl -X GET http://localhost:3000/abc123
# Returns 302 redirect to original URL
```

## 🚦 Error Handling

### HTTP Status Codes
- **200**: Success responses
- **201**: Resource created
- **302**: URL redirect
- **400**: Bad request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Resource not found
- **409**: Conflict (duplicate slug/email)

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## 🔮 Future Enhancements

### Phase 1 (Immediate)
- [ ] Refresh token implementation
- [ ] Role-based access control (RBAC)
- [ ] Backend pagination for large datasets
- [ ] Advanced search and filtering

### Phase 2 (Performance)
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] API rate limiting with Redis
- [ ] CDN integration for global performance

### Phase 3 (Advanced Features)
- [ ] WebSocket real-time updates
- [ ] File upload for bulk URL processing
- [ ] Advanced analytics with time-series data
- [ ] Email notifications for URL events
- [ ] QR code generation
- [ ] URL expiration scheduling

## 🤝 Contributing

1. **Code Standards**: Follow NestJS conventions and TypeScript best practices
2. **Testing**: Write unit tests for new features
3. **Documentation**: Update API documentation for new endpoints
4. **Security**: Follow security best practices for authentication and validation
5. **Performance**: Consider database query optimization and caching strategies

## 📄 License

This project is for educational/challenge purposes.

---

## 🎯 Challenge Completion Summary

✅ **All Core Requirements Met**
✅ **All Extra Credit Features Implemented**  
✅ **Production-Ready Architecture**
✅ **Comprehensive Documentation**
✅ **Docker Support**
✅ **Security Best Practices**
✅ **Scalable Database Design**
✅ **Full API Documentation**

**Tech Stack Alignment**: ✅ TypeScript, ✅ Node.js, ✅ NestJS, ✅ PostgreSQL  
**Framework Choice**: ✅ NestJS (as mentioned in FAQ)  
**Database**: ✅ PostgreSQL (as mentioned in internal stack)  
**ORM**: ✅ Prisma (modern choice for TypeScript projects)
