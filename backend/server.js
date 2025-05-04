import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import userRoutes from '../backend/src/routes/userRoutes.js';
import authRoutes from '../backend/src/routes/authRoutes.js';
import productRoutes from '../backend/src/routes/productRoutes.js';
import materialRoutes from '../backend/src/routes/materialRoutes.js';
import { notFound, errorHandler } from '../backend/src/middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(frontendBuildPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});