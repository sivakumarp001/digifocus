# Backend Configuration Guide

## Environment Variables

Create a `.env` file in the backend root with:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
PORT=3001
NODE_ENV=development
```

## Vercel Environment Setup

Add these to your Vercel project settings:

1. **MONGODB_URI** - MongoDB connection string
2. **JWT_SECRET** - Secret key for JWT tokens
3. **NODE_ENV** - Set to `production`

## API Endpoints

- **Base URL**: `https://digitalfocus-backend.vercel.app/api`

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)
- `PUT /api/auth/profile` - Update profile

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/today` - Get today's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Analytics
- `GET /api/analytics/summary` - Get summary stats
- `GET /api/analytics/weekly` - Get weekly stats
- `GET /api/analytics/monthly` - Get monthly stats

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/leaderboard` - Get leaderboard
- `GET /api/admin/reports` - Get reports

## Deployment to Vercel

1. Create new Vercel project pointing to backend repo
2. Add environment variables in project settings
3. Deploy - Vercel will use `vercel.json` config
4. Update frontend `VITE_API_URL` to your backend URL

## Frontend Integration

The frontend expects the backend to be available at:
- **Production**: `https://digitalfocus-backend.vercel.app`
- **Development**: `http://localhost:3001`
