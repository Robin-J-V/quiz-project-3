const express = require('express');
const userRoutes = require('./user');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { connectToDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

connectToDB();

let questions = [];
fs.readFile('questions.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Failed to load questions:', err);
    return;
  }

  questions = JSON.parse(data);
  questions.forEach((q, idx) => {
    if (!q.id) q.id = `${idx}-${Math.floor(Math.random() * 10000)}`;
  });
});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/start-quiz', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const usedIds = req.query.used ? req.query.used.split(',') : [];
  const available = questions.filter(q => !usedIds.includes(q.id.toString()));
  const selected = available.sort(() => 0.5 - Math.random()).slice(0, count);
  res.json({ questions: selected });
});

app.post('/api/submit-quiz', (req, res) => {
  const userAnswers = req.body.answers || [];
  const quizQuestions = req.body.questions || [];
  let score = 0;

  quizQuestions.forEach((q, i) => {
    if (userAnswers[i]?.toUpperCase() === q.answer.toUpperCase()) {
      score++;
    }
  });

  res.json({ score });
});

app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
