import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDbConnection } from './config/db.js';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import eventsRoutes from './routes/events.js';
import registrationsRoutes from './routes/registrations.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Campus Event Management API is healthy and running.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/my-registrations', registrationsRoutes);

// 404 Route Not Found handler
app.use('*', (req, res, next) => {
  next(new AppError(`Cannot ${req.method} route ${req.originalUrl} - Not Found`, 404));
});

// Centralized error handler
app.use(errorHandler);

// Start server and verify database connection
const startServer = async () => {
  console.log('----------------------------------------------------');
  console.log(' Starting Campus Event Management System Backend... ');
  console.log('----------------------------------------------------');

  await testDbConnection();

  app.listen(PORT, () => {
    console.log(`[Server] API server running smoothly on port ${PORT}`);
    console.log(`[Server] Local URL: http://localhost:${PORT}/api/health`);
    console.log(`[Server] CORS configured for frontend at ${CLIENT_URL}`);
  });
};

startServer();

export default app;
