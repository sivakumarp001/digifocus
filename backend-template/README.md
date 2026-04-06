# Backend Configuration Guide

## Environment Variables

Create a `.env` file in the backend root with:

```
MONGODB_URI=mongodb+srv://sivakumarpsk001_db_user:dLSKJNFncm9KHd1C@cluster.mongodb.net/digifocus
JWT_SECRET=your_super_secret_jwt_key
PORT=3001
NODE_ENV=development
```

## MongoDB Setup

Your MongoDB cluster is configured with:
- **Username**: `sivakumarpsk001_db_user`
- **Database**: `digifocus`
- **Connection String**: `mongodb+srv://sivakumarpsk001_db_user:dLSKJNFncm9KHd1C@cluster.mongodb.net/digifocus`

### Local Development
1. Copy `.env.example` to `.env`
2. Update `JWT_SECRET` if needed
3. Run `npm install`
4. Run `npm run dev` to start development server

### Production (Vercel)
Add these environment variables in Vercel project settings:

1. **MONGODB_URI** - `mongodb+srv://sivakumarpsk001_db_user:dLSKJNFncm9KHd1C@cluster.mongodb.net/digifocus`
2. **JWT_SECRET** - Use a strong secret (e.g., generate from: https://generate-secret.vercel.app/)
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
