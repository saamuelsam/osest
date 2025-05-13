import asyncHandler from 'express-async-handler';
import * as userModel from '../models/userModel.js';
import generateToken from '../utils/generateToken.js'; // Presume que você tem este utilitário

// @desc    Auth user & get token
// @route   POST /api/auth/login  (ou o endpoint que você configurou para login)
// @access  Public
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor, forneça email e senha.');
  }

  const user = await userModel.getUserByEmail(email);


  if (user && (await userModel.matchPassword(password, user.password))) { // Adapte userModel.matchPassword conforme sua implementação
    // Não retorne a senha no objeto do usuário
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      ...userResponse,
      token: generateToken(user.id), // Gera um token JWT
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Email ou senha inválidos.');
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.getAllUsers();
  // Remover senhas da lista de usuários
  const usersWithoutPasswords = users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.json(usersWithoutPasswords);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userModel.getUserById(req.params.id);
  
  if (user) {
    // Don't return the password
    delete user.password;
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create a new user (Register)
// @route   POST /api/users OR /api/auth/register
// @access  Private/Admin (ou Public se for um registro de usuário comum)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Por favor, forneça nome, email e senha.');
  }
  
  // Check if user already exists
  const userExists = await userModel.getUserByEmail(email);
  
  if (userExists) {
    res.status(400);
    throw new Error('Usuário já existe com este email.');
  }
  
  // Create user (a senha deve ser hasheada no userModel.createUser)
  const newUser = await userModel.createUser({
    name,
    email,
    password, // O model deve hashear isso antes de salvar
    role: role || 'estoque', // ou 'user' como padrão para registro público
  });
  
  if (newUser) {
    // Não retorne a senha
    delete newUser.password;
    res.status(201).json({
        ...newUser,
        token: generateToken(newUser.id) // Opcional: logar o usuário imediatamente após o registro
    });
  } else {
    res.status(400);
    throw new Error('Dados de usuário inválidos.');
  }
});

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const { name, email, role, password } = req.body;
  const userId = req.params.id;
  
  // Check if user exists
  const user = await userModel.getUserById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const emailExists = await userModel.getUserByEmail(email);
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }
  
  // Update user (se a senha for fornecida, o model deve hasheá-la)
  const updatedUserData = {
    name: name || user.name,
    email: email || user.email,
    role: role || user.role,
  };

  if (password) {
    updatedUserData.password = password; // O model deve hashear isso
  }

  const updatedUser = await userModel.updateUser(userId, updatedUserData);
  
  // Não retorne a senha
  delete updatedUser.password;
  res.json(updatedUser);
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  // Check if user exists
  const user = await userModel.getUserById(userId);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Don't allow deleting the last admin
  if (user.role === 'admin') {
    const admins = await userModel.getAllUsers(); // Isso já não retorna senhas devido à alteração em getUsers
    const adminCount = admins.filter(u => u.role === 'admin').length;
    
    if (adminCount <= 1) {
      res.status(400);
      throw new Error('Cannot delete the last admin user');
    }
  }
  
  const deleted = await userModel.deleteUser(userId);
  
  if (deleted) {
    res.json({ message: 'User removed' });
  } else {
    res.status(400);
    throw new Error('Could not delete user');
  }
});