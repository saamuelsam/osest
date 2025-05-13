import dotenv from 'dotenv';
dotenv.config();

import './src/database/db.js';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import pingRoutes from './src/routes/index.js';       // Route for /ping
import authRoutes from './src/routes/authRoutes.js';   // /api/auth/login, /auth/login
import userRoutes from './src/routes/userRoutes.js';   // /api/users
import productRoutes from './src/routes/productRoutes.js'; // /api/products
import materialRoutes from './src/routes/materialRoutes.js'; // /api/materials
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (all prefixed with /api)
app.use('/api/ping', pingRoutes);
app.use('/api/auth', authRoutes);
// Also allow auth without /api prefix for compatibility
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);

// Serve front-end in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(buildPath));

  // Serve index.html for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
} else {
  // Development root endpoint
  app.get('/', (req, res) => res.send('API is running...'));
}

// 404 and error-handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
