// backend/routes/auth.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path if your model name/location differs

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// helper to create tokens
function createAccessToken(user) {
  // small payload
  return jwt.sign({ id: user._id, name: user.name, email: user.email }, ACCESS_SECRET, { expiresIn: '15m' });
}
function createRefreshToken(user) {
  return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '30d' });
}

// register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) return res.status(400).json({ msg: 'Please provide name, email, password' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ name, email, passwordHash: hash });
    await user.save();

    // create tokens and set cookies
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    // Save refresh token to DB if you maintain it; else set cookie
    // set cookies
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // set true when using https
      sameSite: 'lax',
      path: '/api/auth/refresh'
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Please provide email and password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/auth/refresh'
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    res.json({ user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// refresh token endpoint: issues a new access token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || null;
    if (!token) return res.status(401).json({ msg: 'No refresh token' });

    let payload;
    try {
      payload = jwt.verify(token, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const accessToken = createAccessToken(user);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    return res.json({ accessToken });
  } catch (err) {
    console.error('refresh error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.clearCookie('accessToken', { path: '/' });
  res.json({ msg: 'Logged out' });
});

// get current user
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('me error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// update profile (budget)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
    await user.save();

    res.json({ user: { id: user._id, name: user.name, email: user.email, monthlyBudget: user.monthlyBudget } });
  } catch (err) {
    console.error('profile update error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
