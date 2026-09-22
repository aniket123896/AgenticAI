import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import User from './models/User.js';
import { seedDatabase } from './seeds/seed.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.endsWith('.vercel.app') ||
        origin === 'http://localhost:5173' ||
        origin === 'http://localhost:3000' ||
        origin === 'http://127.0.0.1:5173'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'College Complaint Management System API is running smoothly',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// 404 and Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = 10;

// Start Server and automatically seed if DB is empty
export const startServer = async () => {
  await connectDB();

  // Auto-seed if database has 0 users (convenient for memory DB and initial setup)
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('⚡ Initializing database with demo seeds...');
    await seedDatabase();
  }

  const listenOnPort = (portToTry) =>
    new Promise((resolve, reject) => {
      const server = app.listen(portToTry, () => {
        console.log(`🚀 CCMS Backend Server running on port ${portToTry} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`🌐 API Endpoint: http://localhost:${portToTry}/api/health`);
        resolve({ app, server, port: portToTry });
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          const nextPort = portToTry + 1;
          if (nextPort <= PORT + MAX_PORT_ATTEMPTS) {
            console.warn(`⚠️ Port ${portToTry} is already in use. Retrying on port ${nextPort}...`);
            resolve(listenOnPort(nextPort));
            return;
          }

          reject(new Error(`Port ${PORT} is unavailable and no free port could be found in the fallback range.`));
          return;
        }

        reject(error);
      });
    });

  return listenOnPort(PORT);
};

// Start if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
