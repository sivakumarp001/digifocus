import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running! 🚀' });
});

// Auth routes (placeholder)
app.post('/api/auth/login', (req, res) => {
    res.json({ message: 'Login endpoint' });
});

app.post('/api/auth/register', (req, res) => {
    res.json({ message: 'Register endpoint' });
});

app.get('/api/auth/me', (req, res) => {
    // Verify JWT token before returning user
    res.json({ message: 'Get current user endpoint' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
