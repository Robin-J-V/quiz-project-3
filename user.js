const express = require('express');
const router = express.Router();
const { getDB } = require('./db');

router.post('/signup', async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password.' });
  }

  try {
    const db = getDB();
    const userCheck = await db.collection('users').findOne({ username });

    if (userCheck) {
      return res.status(409).json({ success: false, message: 'This username is taken. Choose a different one.' });
    }

    const newUser = { firstName, lastName, username, password };
    await db.collection('users').insertOne(newUser);

    res.status(201).json({ success: true, message: 'Signup complete. You can log in now.' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, message: 'Server issue. Please try again later.' });
  }
});

module.exports = router;
