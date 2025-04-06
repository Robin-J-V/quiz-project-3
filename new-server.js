const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

let selectedQuestions = [];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/start-quiz', (req, res) => {
  const allQuestions = JSON.parse(fs.readFileSync('./public/questions.json'));
  selectedQuestions = shuffleArray(allQuestions).slice(0, 10);
  res.json({ questions: selectedQuestions });
});

app.post('/api/submit-quiz', (req, res) => {
  const { answers, score } = req.body;
  res.json({ score });
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});