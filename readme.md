# 🚀 JobMatchHub REST API

A powerful and scalable REST API for a job matching platform that connects job seekers with recruiters. Built with Node.js, Express.js, and MongoDB.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Job Seekers, Recruiters, Admins)
- Password reset with email verification
- Account activation/deactivation
- Secure password encryption using bcrypt

### 👨‍💼 User Management
- User registration and login
- Profile management with customizable fields
- Role-specific profiles (company info for recruiters, skills for job seekers)
- Admin-only user search functionality

### 💼 Job Management
- CRUD operations for job postings
- Advanced job filtering and search:
  - Text search in title, company, and description
  - Location-based filtering
  - Job type and experience level filters
  - Salary range filtering
- Job status management (active/inactive)
- View counting and analytics
- Pagination for optimized performance

### 📝 Application System
- Job application submission with cover letter and resume
- Application status tracking (pending, reviewed, shortlisted, interviewed, offered, rejected, withdrawn)
- Application withdrawal functionality
- Recruiter dashboard for application management
- Application statistics and analytics

### 📧 Email Service
- Welcome emails for new users
- Application notifications for recruiters
- Status update emails for applicants
- Password reset emails

### 🔒 Security Features
- Rate limiting to prevent abuse
- Input validation and sanitization
- HTTP Parameter Pollution (HPP) protection
- Security headers with Helmet.js
- MongoDB injection prevention
- Compression middleware for performance

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Email Service**: Nodemailer
- **Security**: Helmet.js, express-rate-limit, hpp, xss-clean
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv

## 📁 Project Structure

```
├── config/
│   └── db.js                    # Database configuration
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── jobController.js         # Job management logic
│   └── applicationController.js # Application management logic
├── middleware/
│   ├── authMiddleware.js        # Authentication middleware
│   ├── roleMiddleware.js        # Role-based authorization
│   └── errorMiddleware.js       # Global error handling
├── models/
│   ├── User.js                  # User schema
│   ├── Job.js                   # Job schema
│   └── Application.js           # Application schema
├── routes/
│   ├── authRoutes.js           # Authentication routes
│   ├── jobsRoutes.js           # Job routes
│   └── applicationsRoutes.js   # Application routes
├── utils/
│   ├── apiError.js             # Custom error class
│   ├── catchAsync.js           # Async error handler
│   ├── email.js                # Email utilities
│   ├── generateToken.js        # JWT token generation
│   └── rateLimiter.js          # Rate limiting configurations
├── app.js                      # Express app configuration
├── server.js                   # Server startup
└── package.json
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobmatchhub-api.git
   cd jobmatchhub-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/jobmatchhub
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=90d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@jobmatchhub.com
   ```

4. **Start the application**
   ```bash
   # Development
   npm start
   
   # Production
   npm run start:prod
   ```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/me` - Update user profile
- `PUT /api/auth/password` - Change password
- `PATCH /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/resetPassword/:token` - Reset password

### Jobs
- `GET /api/jobs` - Get all jobs (with filtering and pagination)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Recruiter only)
- `PATCH /api/jobs/:id` - Update job (Recruiter only)
- `DELETE /api/jobs/:id` - Delete job (Recruiter only)
- `GET /api/jobs/recruiter/my-jobs` - Get recruiter's jobs

### Applications
- `POST /api/applications` - Apply for job (Job Seeker only)
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/job/:jobId` - Get job applications (Recruiter only)
- `GET /api/applications/:id` - Get single application
- `PATCH /api/applications/:id/status` - Update application status (Recruiter only)
- `DELETE /api/applications/:id` - Withdraw application (Job Seeker only)

## 🔍 API Features

### Advanced Querying
- **Filtering**: `?location=NewYork&jobType=full-time&minSalary=50000`
- **Sorting**: `?sort=salary,-createdAt`
- **Pagination**: `?page=2&limit=10`

### Example Requests

**Get jobs with filtering:**
```bash
GET /api/jobs?location=NewYork&jobType=full-time&minSalary=50000&sort=salary
```

**Apply for a job:**
```bash
POST /api/applications
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "jobId": "64f8d4b2c1234567890abcde",
  "coverLetter": "I am excited to apply for this position..."
}
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token expiration
- HTTP security headers via Helmet
- Input validation and sanitization
- Protection against MongoDB injection
- Rate limiting to prevent abuse
- XSS protection with xss-clean
- HPP protection

## 🚀 Deployment

The application is configured for both development and production environments:

- Development: Detailed error messages and logging
- Production: Secure error handling and optimized performance

Recommended deployment platforms:
- Heroku
- AWS EC2
- DigitalOcean
- Railway
- Render

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Contact

For questions or support, please contact [ziadkhaledwahba219@gmail.com]

---

Built with ❤️ using Node.js and Express