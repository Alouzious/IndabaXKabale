# 🌍 IndabaX Kabale — Event Registration & Attendance Management Platform

<div align="center">

![IndabaX Kabale](https://img.shields.io/badge/IndabaX-Kabale-7C3AED?style=for-the-badge&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Axum](https://img.shields.io/badge/Axum-orange?style=for-the-badge&logo=rust&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)

**A world-class, fully digital event registration and attendance management system for IndabaX Kabale — replacing manual paper registration with a fast, beautiful, and professional platform.**

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 About The Project

IndabaX Kabale is a leading AI and machine learning community in Uganda. This platform was built to solve a critical operational problem — **manual paper-based registration at events** — and replace it with a world-class digital solution.

With this platform, attendees can register online or by scanning a QR code on-site, cabinet team members can monitor sessions and attendance in real time, and the Technical Lead has full administrative control over all data and analytics.

> *"Built by the IndabaX Kabale tech team. Made to impress."*

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React.js** (Vite) | UI framework |
| **TailwindCSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **React Router v6** | Client-side routing |
| **React Hook Form + Zod** | Form handling & validation |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **react-qr-code** | QR code rendering |
| **Recharts** | Analytics charts |
| **Lucide React** | Icons |
| **React Helmet Async** | SEO meta tags |

### Backend
| Technology | Purpose |
|---|---|
| **Rust** | Programming language |
| **Axum** | Web framework |
| **SQLx** | Async PostgreSQL driver with compile-time query verification |
| **Tokio** | Async runtime |
| **jsonwebtoken** | JWT auth |
| **bcrypt** | Password hashing |
| **tracing** | Structured logging |
| **validator** | Input validation |
| **dotenvy** | Environment config |

### Database & Infrastructure
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database |
| **Neon** | Hosted serverless PostgreSQL |
| **SQLx Migrations** | Version-controlled schema management |

---

## ✨ Features

### 👥 Attendee Registration
- [x] Public registration form (Name, Email, Phone, Course/Profession, Session)
- [x] Unique registration ID generated per attendee
- [x] Email confirmation on successful registration
- [x] Duplicate registration prevention (per session, per email)
- [x] Automatic session capacity enforcement

### 📱 QR Code Registration
- [x] Unique QR code generated per session
- [x] QR code opens pre-filled registration form when scanned
- [x] Download QR codes as PNG and SVG
- [x] Session-specific QR tokens for security

### 🏛️ Cabinet Dashboard
- [x] Protected login for team members
- [x] Session overview with attendance vs capacity progress bars
- [x] Create and manage sessions
- [x] Generate & download session QR codes
- [x] Real-time registration feed
- [x] Privacy-protected — cabinet sees stats only, not personal attendee data

### 🔐 Super Admin Panel
- [x] Full attendee data access across all sessions
- [x] Export attendee lists as CSV
- [x] Manage cabinet member accounts
- [x] Edit and delete sessions
- [x] Analytics: registration trends, session popularity, profession breakdown

### 🔍 SEO
- [x] Dynamic meta tags per page (React Helmet Async)
- [x] Open Graph tags for social sharing
- [x] JSON-LD Event structured data
- [x] sitemap.xml and robots.txt
- [x] Optimized Core Web Vitals

---

## 📁 Project Structure

```
indabax-kabale/
│
├── frontend/                   # React.js application
│   ├── public/
│   │   ├── sitemap.xml
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route-level page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API call functions (Axios)
│   │   ├── store/              # Zustand global state
│   │   ├── utils/              # Helper functions
│   │   └── assets/             # Images, fonts, icons
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── backend/                    # Rust + Axum API server
│   ├── src/
│   │   ├── main.rs             # Server entry point
│   │   ├── routes/             # Route definitions grouped by feature
│   │   ├── handlers/           # Business logic per feature
│   │   ├── models/             # Database models and structs
│   │   ├── middleware/         # JWT auth, CORS, logging middleware
│   │   ├── db/                 # SQLx connection pool setup
│   │   ├── errors/             # Custom error types
│   │   └── config/             # Environment config loader
│   ├── migrations/             # SQLx migration files
│   ├── Cargo.toml
│   ├── Dockerfile
│   └── .env.example
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [SQLx CLI](https://github.com/launchbadge/sqlx/tree/main/sqlx-cli)
- A [Neon](https://neon.tech) account with a PostgreSQL database created

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install SQLx CLI
cargo install sqlx-cli --no-default-features --features postgres

# Install Node dependencies (frontend)
cd frontend && npm install
```

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/indabax-kabale.git

# 2. Navigate into the project
cd indabax-kabale

# 3. Install frontend dependencies
cd frontend
npm install

# 4. Install backend dependencies (Rust compiles automatically)
cd ../backend
cargo build
```

---

### Environment Variables

#### Backend — `backend/.env`
Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Database - Get this from your Neon dashboard
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/indabaxkabale?sslmode=require

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRY_HOURS=24

# Server
HOST=0.0.0.0
PORT=8080

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email (optional - for confirmation emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
```

#### Frontend — `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=IndabaX Kabale
```

---

### Database Setup

```bash
# Navigate to backend
cd backend

# Run all migrations to set up the database schema
sqlx migrate run

# To revert the last migration
sqlx migrate revert

# To check migration status
sqlx migrate info
```

> ⚠️ Make sure your `DATABASE_URL` in `.env` is set correctly to your Neon connection string before running migrations.

---

### Running the App

#### Start the Backend (Rust + Axum)
```bash
cd backend
cargo run
```
> The API server will start at `http://localhost:8080`

#### Start the Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
> The frontend will start at `http://localhost:5173`

#### Run Both Simultaneously (from root)
```bash
# Terminal 1
cd backend && cargo run

# Terminal 2
cd frontend && npm run dev
```

---

## 📡 API Documentation

All API responses follow this consistent structure:

```json
// Success
{ "success": true, "data": {}, "message": "Operation successful" }

// Error
{ "success": false, "error": "ERROR_CODE", "message": "Human readable error" }
```

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/sessions` | List all active sessions |
| `GET` | `/api/v1/sessions/:id` | Get single session details |
| `POST` | `/api/v1/registrations` | Register an attendee |
| `GET` | `/api/v1/verify/:registration_id` | Verify a registration |

### Cabinet Endpoints (JWT Required — `cabinet` or `super_admin`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `GET` | `/api/v1/cabinet/sessions` | Get all sessions with stats |
| `POST` | `/api/v1/cabinet/sessions` | Create a new session |
| `GET` | `/api/v1/cabinet/sessions/:id/qrcode` | Get session QR code |
| `GET` | `/api/v1/cabinet/stats` | Get dashboard stats |

### Admin Endpoints (JWT Required — `super_admin` only)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/admin/attendees` | Get all attendees |
| `GET` | `/api/v1/admin/attendees/export` | Export attendees as CSV |
| `PUT` | `/api/v1/admin/sessions/:id` | Edit a session |
| `DELETE` | `/api/v1/admin/sessions/:id` | Delete a session |
| `GET` | `/api/v1/admin/users` | Manage cabinet members |
| `POST` | `/api/v1/admin/users` | Create cabinet member |

---

## 👤 User Roles

| Role | Access Level | Description |
|---|---|---|
| `public` | No login required | Can view sessions and register as attendee |
| `cabinet` | Login required | Can manage sessions, view stats, generate QR codes |
| `super_admin` | Login required | Full access — all data, exports, user management, analytics |

---

## 🚀 Deployment

### Frontend — Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```
Add environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Backend — Railway or Fly.io

#### Using Docker (recommended)
```bash
cd backend

# Build the Docker image
docker build -t indabax-kabale-api .

# Run locally to test
docker run -p 8080:8080 --env-file .env indabax-kabale-api
```

#### Deploy to Railway
1. Connect your GitHub repo to [Railway](https://railway.app)
2. Set the root directory to `backend/`
3. Add all environment variables from `.env`
4. Railway auto-detects the `Dockerfile` and deploys

#### Deploy to Fly.io
```bash
cd backend
flyctl launch
flyctl deploy
```

### Database — Neon
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project → copy the connection string
3. Set it as `DATABASE_URL` in your backend environment
4. Run `sqlx migrate run` to initialize the schema

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

Please make sure your code:
- Passes `cargo clippy` with no warnings (backend)
- Passes `npm run lint` (frontend)
- Includes relevant comments and documentation

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Technical Lead

**IndabaX Kabale** — Building Africa's AI future, one session at a time. 🌍

<div align="center">

Made with ❤️ by the IndabaX Kabale Tech Team

</div>
