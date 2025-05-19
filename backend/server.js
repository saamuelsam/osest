import dotenv from 'dotenv';
dotenv.config();

import './src/database/db.js';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

import pingRoutes from './src/routes/index.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js'; // ✅ correção aqui!
import productRoutes from './src/routes/productRoutes.js';
import materialRoutes from './src/routes/materialRoutes.js';
import seedRoutes from './src/routes/seedRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Rotas
app.use('/api/auth', authRoutes);
app.use('/api/ping', pingRoutes);
app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/seeds', seedRoutes);

// Front-end
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.resolve(__dirname, '../../dist');
  app.use(express.static(buildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('API is running...'));
}

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
