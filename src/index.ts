import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import seedRoutes from './routes/seed';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8081;

// CORS configuration to allow frontend to communicate with backend
const frontendOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean)
  : ['http://localhost:5173'];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://tanstack-start-app.habitus-01.workers.dev',
  process.env.FRONTEND_URL || 'https://habit-us-five.vercel.app'
];

const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: origin not allowed'), false);
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Mount route handlers
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); // users routes include /xp/add, /streak/update, /leaderboard
app.use('/api/tasks', taskRoutes);
app.use('/api/seed', seedRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
