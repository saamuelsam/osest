import asyncHandler from 'express-async-handler';
import * as userModel from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 🔧 DEBUG: current working directory
  console.log('🛠️ CWD:', process.cwd());
  // 🔧 DEBUG: check JWT_SECRET availability
  console.log('🔑 JWT_SECRET in login:', process.env.JWT_SECRET);
  // 🔧 DEBUG: log request body
  console.log('📥 Dados recebidos no login:', { email, password });

  // Check if email and password were provided
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Check if user exists and password is correct
  const user = await userModel.authenticateUser(email, password);

  if (user) {
    // Create token payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});
