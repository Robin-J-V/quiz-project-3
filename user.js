console.log('User routes are registered');
const express = require('express');
const router = express.Router();
const { getDB } = require('./db');

// Signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password.' });
  }

  try {
    const db = getDB();
    const userExists = await db.collection('users').findOne({ username });

    if (userExists) {
      return res.status(409).json({ success: false, message: 'This username is already taken.' });
    }

    const newUser = {
      firstName,
      lastName,
      username,
      password,
      createdAt: new Date()
    };

    await db.collection('users').insertOne(newUser);

    res.status(201).json({ success: true, message: 'Signup successful. You can log in now.' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Signin
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.status(200).json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// Save score
router.post('/save-score', async (req, res) => {
  const { username, score } = req.body;

  if (!username || typeof score !== 'number') {
    return res.status(400).json({ success: false, message: 'Username and score are required.' });
  }

  try {
    const db = getDB();
    await db.collection('scores').insertOne({
      username,
      score,
      date: new Date()
    });

    res.status(201).json({ success: true, message: 'Score saved.' });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ success: false, message: 'Server error. Could not save score.' });
  }
});

// Get user profile
router.get('/user-profile', async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required.' });
  }

  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ username }, { projection: { password: 0 } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const scores = await db.collection('scores')
      .find({ username })
      .sort({ date: -1 })
      .toArray();

    res.json({ success: true, user, scores });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ success: false, message: 'Server error while loading profile.' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDB();
    const leaderboard = await db
      .collection('scores')
      .find({})
      .sort({ score: -1, date: -1 })
      .limit(10)
      .toArray();

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to load leaderboard' });
  }
});

module.exports = router;
