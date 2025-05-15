const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { connectToDB } = require('./db');
const userRoutes = require('./user'); 

const app = express();
const PORT = process.env.PORT || 3000;

connectToDB();

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use('/api', userRoutes); 

let questions = [];
fs.readFile('questions.json', 'utf8', (err, data) => {
  if (!err) {
    questions = JSON.parse(data);
    questions.forEach((q, idx) => {
      if (!q.id) q.id = `${idx}-${Math.floor(Math.random() * 10000)}`;
    });
  } else {
    console.error('Failed to load questions:', err);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/start-quiz', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const used = req.query.used ? req.query.used.split(',') : [];
  const remaining = questions.filter(q => !used.includes(q.id.toString()));
  const selected = remaining.sort(() => 0.5 - Math.random()).slice(0, count);
  res.json({ questions: selected });
});

app.post('/api/submit-quiz', (req, res) => {
  const answers = req.body.answers || [];
  const quizQs = req.body.questions || [];
  let score = 0;

  quizQs.forEach((q, i) => {
    if (answers[i]?.toUpperCase() === q.answer.toUpperCase()) {
      score++;
    }
  });

  res.json({ score });
});

app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
