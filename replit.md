# JobMatchHub API

## Overview

JobMatchHub is a RESTful API for a job matching platform that connects job seekers with recruiters. The system provides JWT-based authentication, role-based access control, and comprehensive CRUD operations for managing job offers, applications, and user profiles. Built with Node.js and Express, it uses MongoDB for data persistence and includes security features like rate limiting, input sanitization, and email notifications.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

### Backend Architecture
- **Framework**: Express.js with Node.js runtime
- **Architecture Pattern**: MVC (Model-View-Controller) with RESTful API design
- **Database**: MongoDB with Mongoose ODM for schema modeling and validation
- **Authentication**: JWT (JSON Web Tokens) for stateless authentication
- **Security**: Multi-layered approach with helmet, CORS, rate limiting, input sanitization (XSS protection, MongoDB injection prevention)

### API Structure
- **Route Organization**: Modular routing with separate files for auth, jobs, and applications
- **Middleware Stack**: Authentication, authorization, error handling, and security middleware
- **Error Handling**: Centralized error handling with custom ApiError class
- **Rate Limiting**: Different limits for auth, general API, and job applications

## Key Components

### Authentication System
- **JWT Implementation**: Stateless authentication with configurable expiration
- **Role-Based Access Control**: Three user roles (job_seeker, recruiter, admin)
- **Password Security**: bcryptjs for password hashing and validation
- **Account Management**: Profile updates, password changes, account deactivation

### User Management
- **User Schema**: Comprehensive profile system with role-specific fields
- **Profile Data**: Skills, experience, education for job seekers; company info for recruiters
- **Account Status**: Active/inactive states with last login tracking

### Job Management
- **Job Schema**: Complete job posting with requirements, salary, location, type
- **Search & Filtering**: Text search, location, job type, experience level, salary range
- **Pagination**: Configurable page size with sorting options
- **Job Status**: Active/inactive toggle for recruiters

### Application System
- **Application Tracking**: Status progression from pending to final outcome
- **Duplicate Prevention**: Unique constraints to prevent multiple applications
- **Application Management**: Cover letters, resume uploads, recruiter feedback
- **Notifications**: Email notifications for application events

### Email System
- **Nodemailer Integration**: SMTP-based email sending
- **Welcome Emails**: Automated onboarding for new users
- **Application Notifications**: Real-time alerts for recruiters and status updates

## Data Flow

### Authentication Flow
1. User registration/login → JWT token generation
2. Token validation on protected routes
3. Role-based access control for resource access
4. Optional authentication for public job viewing

### Job Application Flow
1. Job seeker views available jobs (with optional filters)
2. Application submission with validation checks
3. Recruiter receives notification
4. Status updates flow back to applicant
5. Email notifications sent at key stages

### Data Persistence
- MongoDB collections: users, jobs, applications
- Mongoose schema validation and middleware
- Automatic timestamps and soft deletes
- Referential integrity with ObjectId relationships

## External Dependencies

### Core Dependencies
- **Express**: Web framework for routing and middleware
- **Mongoose**: MongoDB object modeling and validation
- **jsonwebtoken**: JWT token generation and verification
- **bcryptjs**: Password hashing and comparison
- **nodemailer**: Email sending capabilities

### Security Dependencies
- **helmet**: Security headers and protections
- **cors**: Cross-origin resource sharing configuration
- **express-rate-limit**: API rate limiting
- **express-mongo-sanitize**: MongoDB injection prevention
- **xss-clean**: XSS attack prevention
- **hpp**: HTTP parameter pollution protection

### Development Dependencies
- **morgan**: HTTP request logging
- **compression**: Response compression
- **dotenv**: Environment variable management

## Deployment Strategy

### Environment Configuration
- **Environment Variables**: Database connection, JWT secrets, email configuration
- **Development Setup**: MongoDB connection with fallback to localhost
- **Production Considerations**: Environment-specific configurations

### Server Architecture
- **Entry Point**: server.js handles database connection and server startup
- **Process Management**: Graceful shutdown handling for SIGTERM and unhandled rejections
- **Error Handling**: Global exception handling with process exit strategies
- **Health Checks**: API health endpoint for monitoring

### Database Strategy
- **Connection Management**: Mongoose connection with retry logic
- **Schema Design**: Normalized data structure with proper indexing
- **Performance**: Text search indexes for job search functionality
- **Constraints**: Unique indexes to prevent duplicate applications

### Security Deployment
- **Rate Limiting**: Multiple tiers of rate limiting for different endpoints
- **Input Validation**: Comprehensive validation at schema and route levels
- **CORS Configuration**: Configurable origin restrictions
- **Security Headers**: Helmet middleware for security best practices