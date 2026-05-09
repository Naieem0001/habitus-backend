import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import seedRoutes from './routes/seed';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration to allow frontend to communicate with backend
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:8080', 'https://your-app.netlify.app'],
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
