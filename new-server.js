const express = require('express');
const fs = require('fs');
const path = require('path');

const quizApp = express();
const PORT = 3000;

quizApp.use(express.static(__dirname));
quizApp.use(express.json());

let quizBatch = [];

quizApp.get('/', (req, res) => {
  const homepagePath = path.resolve(__dirname, 'index.html');
  res.sendFile(homepagePath);
});

quizApp.get('/api/start-quiz', (req, res) => {
  const filePath = path.resolve(__dirname, 'questions.json');
  const questionPool = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  quizBatch = randomizeList(questionPool).slice(0, 10);
  res.json({ questions: quizBatch });
});

quizApp.post('/api/submit-quiz', (req, res) => {
  const userData = req.body;
  res.json({ score: userData.score });
});

function randomizeList(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [list[i], list[rand]] = [list[rand], list[i]];
  }
  return list;
}

quizApp.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});