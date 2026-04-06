# DigiFocus - Separate Deployment Guide

## Architecture

- **Frontend**: React + Vite - Deployed to Vercel
- **Backend**: Node.js + Express - Deployed to Vercel (separate project)

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with frontend repo
- Vercel account

### Steps

1. **Go to [vercel.com](https://vercel.com)**
2. **Import Project**
   - Click "New Project"
   - Connect GitHub account
   - Select `DigiFocus` repository (frontend only)

3. **Configure Project**
   - **Framework**: Vite
   - **Root Directory**: `frontend/` (if monorepo) or `.` (if frontend only)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**
   - Add in Vercel Project Settings → Environment Variables
   ```
   VITE_API_URL=https://digitalfocus-backend.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Access your frontend at the provided URL

### Frontend vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://digitalfocus-backend.vercel.app"
  },
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Backend Deployment (Vercel)

### Prerequisites
- GitHub account with **separate backend repo**
- Vercel account
- MongoDB Atlas account (for database)

### Steps

1. **Create Backend Repository**
   - Create new GitHub repo: `DigiFocus-Backend`
   - Push your backend code there

2. **Go to [vercel.com](https://vercel.com)**
3. **Import Project**
   - Click "New Project"
   - Connect GitHub account
   - Select backend repository

4. **Configure Project**
   - **Framework**: Node.js
   - **Root Directory**: `.` (or your backend folder)
   - **Build Command**: Leave blank or `npm install`
   - **Output Directory**: Leave blank

5. **Environment Variables**
   - Add in Vercel Project Settings → Environment Variables
   ```
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/digifocus
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=production
   PORT=3001
   ```

6. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://digifocus-backend.vercel.app`)

### Backend vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "NODE_ENV": "production"
  }
}
```

---

## Frontend Configuration

Update `frontend/.env` or Vercel Environment Variables:

```
VITE_API_URL=https://digifocus-backend.vercel.app
```

This tells the frontend where to find the backend API.

---

## Testing the Connection

1. **Frontend**: Visit your frontend Vercel URL
2. **Backend Health Check**: Go to `https://your-backend-url.vercel.app/api/health`
3. **Login**: Try logging in - frontend should communicate with backend

---

## Current Structure

```
digital-focus/
├── frontend/              (Vercel Project 1)
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json        ← Frontend config
│
└── backend-template/      (Template for separate repo)
    ├── index.js
    ├── package.json
    ├── vercel.json        ← Backend config
    └── .env.example
```

---

## Key Points

✅ **Separate Repositories**: Frontend and backend are in different GitHub repos
✅ **Separate Vercel Projects**: Each deployed independently
✅ **API Communication**: Frontend → Backend via `VITE_API_URL`
✅ **Environment Variables**: Configured in Vercel UI
✅ **No .env files in git**: Use Vercel's environment variable system

---

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend is actually deployed
- Check CORS settings in backend

### Backend environment variables not working
- Ensure variables are added in Vercel UI
- Verify variable names match exactly
- Redeploy after adding variables

### Build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility
