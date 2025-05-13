// backend/src/models/userModel.js

import { query } from '../database/db.js';
import bcrypt from 'bcryptjs';

// Get user by ID
export const getUserById = async (id) => {
  const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

// Get user by email
export const getUserByEmail = async (email) => {
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

// Get all users
export const getAllUsers = async () => {
  return await query(
    'SELECT id, name, email, role, created_at, updated_at FROM users'
  );
};

// Create a new user
export const createUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = await query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hashedPassword, role]
  );

  if (result.affectedRows === 1) {
    const user = await getUserById(result.insertId);
    delete user.password;
    return user;
  }

  return null;
};

// Update a user
export const updateUser = async (id, userData) => {
  const { name, email, role, password } = userData;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await query(
      'UPDATE users SET name = ?, email = ?, role = ?, password = ? WHERE id = ?',
      [name, email, role, hashedPassword, id]
    );
  } else {
    await query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
  }

  const user = await getUserById(id);
  delete user.password;
  return user;
};

// Delete a user
export const deleteUser = async (id) => {
  const result = await query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

// Authenticate user (with detailed logging)
export const authenticateUser = async (email, password) => {
  console.log('🔍 authenticateUser chamado com:', { email, password });

  // Busca o usuário no DB
  const rows = await query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  console.log('👤 Resultado getUserByEmail:', user);

  if (!user) {
    console.log('❌ Usuário não encontrado no banco');
    return null;
  }

  // Compara a senha
  const match = await bcrypt.compare(password, user.password);
  console.log('🔐 Resultado bcrypt.compare:', match);

  if (!match) {
    console.log(
      '❌ Senha não confere.',
      'Senha informada:', password,
      'Hash no DB:', user.password
    );
    return null;
  }

  // Tudo certo
  delete user.password;
  console.log('✅ Autenticação bem-sucedida, user retornado:', user);
  return user;
};
