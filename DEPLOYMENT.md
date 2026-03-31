# Deployment Guide: Render + Vercel + Neon

## Overview
- **Backend**: Rust/Axum on Render
- **Frontend**: React/Vite on Vercel  
- **Database**: PostgreSQL on Neon

---

## Step 1: Set Up Neon Database

### 1.1 Create a Neon Project
1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in
3. Create a new project
4. Copy your **Connection String** (looks like: `postgresql://user:password@ep-xxxx.neon.tech/dbname`)
5. Add `?sslmode=require` if not present

### 1.2 Initialize Schema
Run migrations locally first to ensure they're valid:
```bash
cd backend
DATABASE_URL="your_neon_connection_string" cargo sqlx migrate run
```

---

## Step 2: Deploy Backend on Render

### 2.1 Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Setup deployment configuration"
git push origin main
```

### 2.2 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Grant access to your repository

### 2.3 Deploy Web Service
1. Click "New +" → "Web Service"
2. Select your `IndabaXKabale` repository
3. Configure:
   - **Name**: indabax-backend
   - **Environment**: Docker
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Build Command**: (leave empty - uses Dockerfile)
   - **Start Command**: (leave empty - uses Dockerfile CMD)

### 2.4 Set Environment Variables
In Render dashboard → Environment:
```
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require
JWT_SECRET=<generate strong secret: openssl rand -base64 32>
FRONTEND_URL=https://your-frontend-vercel-url.vercel.app
ENVIRONMENT=production
RUST_LOG=info
```

### 2.5 Deploy
Click "Deploy" and wait for build to complete. Once deployed, copy your URL:
- Example: `https://indabax-backend-xxxx.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Grant access to your repository

### 3.2 Deploy Project
1. Click "Add New..." → "Project"
2. Select `IndabaXKabale` repository
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Set Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
VITE_API_BASE_URL=https://indabax-backend-xxxx.onrender.com/api/v1
```

### 3.4 Deploy
Click "Deploy" and wait for build to complete. You'll get a URL like:
- Example: `https://indabax-frontend-xxxx.vercel.app`

---

## Step 4: Update Backend CORS

After you have your Vercel URL:

1. Go back to Render → indabax-backend → Environment
2. Update `FRONTEND_URL` to your Vercel URL
3. Click "Save Changes" → "Manual Deploy" → "Deploy Latest Commit"

---

## Step 5: Verify Deployment

### Test API Health
```bash
curl https://indabax-backend-xxxx.onrender.com/health
```

### Test Frontend
Open `https://indabax-frontend-xxxx.vercel.app` in browser

### Check Logs
- **Render**: Dashboard → Logs tab
- **Vercel**: Dashboard → Deployments → View Logs

---

## CI/CD Pipeline

Your GitHub Actions workflows automatically:

### Backend (`.github/workflows/backend.yml`)
- Runs tests on every push to `main`
- Tests against PostgreSQL 15
- Builds release binary
- Triggered on changes to `backend/` folder

### Frontend (`.github/workflows/frontend.yml`)
- Runs ESLint
- Builds production bundle
- Triggered on changes to `frontend/` folder

View results: GitHub → Actions tab

---

## Environment Variables Summary

### Backend (.env in Render)
| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@ep-xxxx.neon.tech/db` |
| `JWT_SECRET` | **Yes** | Generated with `openssl rand -base64 32` |
| `FRONTEND_URL` | **Yes** | `https://your-app.vercel.app` |
| `ENVIRONMENT` | No | `production` |
| `JWT_EXPIRY_HOURS` | No | `24` |
| `RUST_LOG` | No | `info` |

### Frontend (Vercel Environment)
| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_BASE_URL` | **Yes** | `https://backend-xxxx.onrender.com/api/v1` |

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel domain exactly
- Check both HTTP scheme (https://) and trailing slashes

### Database Connection Errors
- Verify Neon connection string includes `?sslmode=require`
- Check firewall rules allow connections from Render
- Review Render logs for connection details

### Build Failures
- Check GitHub Actions → Logs
- Ensure Rust dependencies build locally: `cd backend && cargo build --release`
- Verify migrations are syntactically correct

### Vercel Build Errors
- Check Vercel → Deployments → Logs
- Ensure `root` directory is set to `frontend`
- Verify `VITE_API_BASE_URL` is set correctly

---

## Local Development

```bash
# Terminal 1: Backend
cd backend
# Copy your .env.example to .env and update DATABASE_URL
cp .env.example .env
cargo run

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev
```

Access at `http://localhost:5173`

---

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters
- [ ] Database uses SSL connection (`?sslmode=require`)
- [ ] FRONTEND_URL is exact domain (no typos)
- [ ] No secrets committed to git
- [ ] RUST_LOG not set to `debug` in production
- [ ] Database backups enabled in Neon
- [ ] Both services use HTTPS (automatic with Render/Vercel)

---

## Next Steps

1. Monitor logs after deployment
2. Set up error tracking (e.g., Sentry)
3. Configure custom domain if desired
4. Set up automatic backups for database
5. Add monitoring and alerting
