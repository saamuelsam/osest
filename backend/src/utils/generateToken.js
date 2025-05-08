// filepath: d:/project/backend/src/utils/generateToken.js
import dotenv from 'dotenv';
// Garante que esse .env seja lido se ainda não foi
dotenv.config();

import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('🔥 ERRO FATAL: JWT_SECRET não está definido no .env!');
    throw new Error('Configuração interna do servidor incompleta.');
  }

  console.log('🔑 [generateToken] JWT_SECRET encontrado, gerando token...');

  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

export default generateToken;
