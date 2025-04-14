const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000;

let questions = [];
fs.readFile('questions.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading questions file:', err);
    return;
  }
  questions = JSON.parse(data);

  questions.forEach((q, idx) => {
    if (!q.id) q.id = `${idx}-${Math.floor(Math.random() * 10000)}`;
  });
});

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/start-quiz', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const usedIds = req.query.used ? req.query.used.split(',') : [];

  const filtered = questions.filter(q => !usedIds.includes(q.id.toString()));
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, count);

  res.json({ questions: selectedQuestions });
});


app.post('/api/submit-quiz', (req, res) => {
  const userAnswers = req.body.answers || [];
  const quizQuestions = req.body.questions || [];
  let score = 0;

  quizQuestions.forEach((q, index) => {
    if (userAnswers[index] && userAnswers[index].toUpperCase() === q.answer.toUpperCase()) {
      score++;
    }
  });

  res.json({ score: score });
});

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
