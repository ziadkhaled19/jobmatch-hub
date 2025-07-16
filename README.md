# JobMatchHub API

A RESTful API for job matching platform with JWT authentication, role-based access control, and CRUD operations for jobs and applications.

## Features

- 🔐 JWT-based authentication (signup/login)
- 🧑‍💼 Role-based access control (Job Seekers vs Recruiters)
- 💼 CRUD operations for job offers
- 📝 CRUD operations for job applications
- 🔍 Advanced job search and filtering
- 📧 Email notifications
- 🛡️ Input validation and error handling
- 📊 Rate limiting for API protection
- 🚀 RESTful API design

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, express-mongo-sanitize, xss-clean
- **Email**: Nodemailer
- **Environment**: dotenv

## User Roles

- **Job Seeker**: Can view jobs, apply to them, manage own applications
- **Recruiter**: Can post job offers, view applications for their jobs
- **Admin**: Manage all users, jobs, and applications

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd jobmatchhub
