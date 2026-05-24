# 🏛️ Smart Sarkari Job Portal

A full-stack MERN web application that helps students and job seekers find government jobs they are eligible for based on their profile details.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Recommendation Algorithm](#recommendation-algorithm)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

---

## Overview

Many students face problems finding government jobs they're eligible for — missing deadlines, confusion about age relaxation, and no centralized platform. **Smart Sarkari Job Portal** solves this with a smart recommendation engine that matches jobs to user profiles.

---

## Features

### ✅ Core Features
| Feature | Description |
|---------|-------------|
| **Authentication** | Register/Login with JWT tokens, password hashing with bcryptjs |
| **User Profiles** | Manage qualification, age, category, skills, interested fields |
| **Job Management** | Admin CRUD for government job postings |
| **Smart Recommendations** | AI-powered job matching based on qualification, age, category & skills |
| **Search & Filter** | Keyword search, filter by field/qualification/status, sort, pagination |
| **Role-Based Access** | User and Admin roles with protected routes |
| **Previous Year Papers** | Browse 20+ papers across SSC, UPSC, Railway, Banking, Defence |
| **Study Materials** | Notes, PDFs, practice sets for all major exam subjects |
| **Preparation Planner** | Create study plans, add tasks, track progress |

### 🔐 Security
- Password hashing (bcryptjs, 12 salt rounds)
- JWT token authentication
- Role-based authorization middleware
- Input validation (express-validator)
- Centralized error handling
- Helmet security headers + CORS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT, bcryptjs |
| **Validation** | express-validator |
| **Security** | Helmet, CORS |
| **Dev Tools** | Nodemon, Morgan |

---

## Project Architecture

```
Smart Sarkari Job Portal/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js       # Register, Login, GetMe
│   │   ├── job.controller.js        # CRUD + Recommendation Engine
│   │   ├── user.controller.js       # Profile management
│   │   ├── paper.controller.js      # Previous year papers
│   │   ├── material.controller.js   # Study materials
│   │   └── plan.controller.js       # Preparation planner
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── authorize.middleware.js   # Role-based access
│   │   ├── error.middleware.js       # Centralized error handler
│   │   └── validate.middleware.js    # express-validator runner
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Job.model.js
│   │   ├── Paper.model.js
│   │   ├── StudyMaterial.model.js
│   │   └── PreparationPlan.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── job.routes.js
│   │   ├── user.routes.js
│   │   ├── paper.routes.js
│   │   ├── material.routes.js
│   │   └── plan.routes.js
│   ├── seeders/
│   │   ├── adminSeeder.js           # Default admin account
│   │   ├── jobSeeder.js             # 16 sample government jobs
│   │   └── resourceSeeder.js        # 20 papers + 15 study materials
│   ├── utils/
│   │   ├── ApiFeatures.js           # Search, filter, pagination
│   │   ├── asyncHandler.js          # Async error wrapper
│   │   └── CustomError.js           # Custom error class
│   ├── validators/
│   ├── server.js                    # Entry point
│   └── .env
├── frontend/
│   ├── index.html                   # SPA shell
│   ├── css/
│   │   ├── style.css                # Design system
│   │   ├── components.css           # Component styles
│   │   └── pages.css                # Page-specific styles
│   └── js/
│       ├── api.js                   # API service layer
│       ├── auth.js                  # Auth state management
│       ├── pages.js                 # Page renderers
│       ├── resources.js             # Papers, Materials, Planner
│       └── app.js                   # Main app controller
├── docs/
│   └── API.md                       # API documentation
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/smart-sarkari-job-portal.git
cd smart-sarkari-job-portal

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment variables
# Edit .env file with your MongoDB URI and JWT secret

# 4. Seed the database
npm run seed:admin        # Creates admin user
npm run seed:jobs          # Seeds 16 government jobs
node seeders/resourceSeeder.js  # Seeds papers & study materials

# 5. Start the development server
npm run dev

# 6. Open in browser
# Visit http://localhost:5000
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartsarkari.com | Admin@123 |

---

## API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

### Quick Reference

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Protected | Current user |
| GET | `/api/user/profile` | Protected | Get profile |
| PUT | `/api/user/profile` | Protected | Update profile |
| GET | `/api/jobs` | Public | List jobs (search/filter) |
| GET | `/api/jobs/:id` | Public | Get job details |
| POST | `/api/jobs` | Admin | Create job |
| PUT | `/api/jobs/:id` | Admin | Update job |
| DELETE | `/api/jobs/:id` | Admin | Delete job |
| GET | `/api/jobs/recommend/me` | Protected | Smart recommendations |
| GET | `/api/papers` | Public | List papers |
| GET | `/api/materials` | Public | List materials |
| GET | `/api/plans` | Protected | User's plans |
| POST | `/api/plans` | Protected | Create plan |
| POST | `/api/plans/:id/tasks` | Protected | Add task |

---

## Recommendation Algorithm

The smart recommendation engine scores jobs using this algorithm:

```
Score = Qualification Match (30pts)
      + Age Match with Category Relaxation (25pts)
      + Category Relaxation Bonus (10pts)
      + Skills Overlap (20pts)
      + Field Match (15pts)

Match Percentage = (Score / MaxPossibleScore) × 100
```

### Qualification Hierarchy
```
PhD (6) > Post Graduation (5) > Graduation (4) > Diploma (3) > 12th/ITI (2) > 10th (1)
```

### Age Relaxation Rules
| Category | Relaxation |
|----------|-----------|
| General | 0 years |
| OBC | +3 years |
| SC/ST | +5 years |
| EWS | 0 years |
| PwD | +10 years |

---

## Key Learning Outcomes

- ✅ Full Stack Development (MERN)
- ✅ REST API Design & Development
- ✅ JWT Authentication & Authorization
- ✅ MongoDB Schema Design & Relationships
- ✅ MVC Architecture Pattern
- ✅ Middleware Architecture
- ✅ Real-world Recommendation Logic
- ✅ Search, Filter & Pagination
- ✅ Role-Based Access Control (RBAC)
- ✅ Error Handling & Validation
- ✅ Clean Project Architecture

---

## Future Enhancements

- [ ] Bookmark/Save Jobs
- [ ] Email Notifications
- [ ] Resume Upload
- [ ] AI-powered Recommendations (ML)
- [ ] Real-Time Alerts
- [ ] Mobile App (React Native)
- [ ] Deployment (Render + MongoDB Atlas + Vercel)

---

## 📝 License

ISC License

---

**Built with ❤️ for government job aspirants across India**
