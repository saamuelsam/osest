import asyncHandler from 'express-async-handler';
import * as userModel from '../models/userModel.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.getAllUsers();
  res.json(users);
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

// @desc    Create a new user
// @route   POST /api/users
// @access  Private/Admin
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  // Check if user already exists
  const userExists = await userModel.getUserByEmail(email);
  
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  // Create user
  const user = await userModel.createUser({
    name,
    email,
    password,
    role: role || 'estoque',
  });
  
  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
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
  if (email !== user.email) {
    const emailExists = await userModel.getUserByEmail(email);
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }
  
  // Update user
  const updatedUser = await userModel.updateUser(userId, {
    name: name || user.name,
    email: email || user.email,
    role: role || user.role,
    password: password || undefined,
  });
  
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
    const admins = await userModel.getAllUsers();
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