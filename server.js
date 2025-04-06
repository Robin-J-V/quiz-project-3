const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000;

// Load questions from JSON file
let questions = [];
fs.readFile('questions.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading questions file:', err);
    return;
  }
  questions = JSON.parse(data);
});

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// API endpoint to start the quiz: select 10 random questions
app.get('/api/start-quiz', (req, res) => {
  // Shuffle questions and take 10
  let shuffled = questions.sort(() => 0.5 - Math.random());
  let selectedQuestions = shuffled.slice(0, 10);
  res.json({ questions: selectedQuestions });
});

// API endpoint to submit quiz answers and calculate the score
app.post('/api/submit-quiz', (req, res) => {
  const userAnswers = req.body.answers; // Array of user's answers (e.g., ['A', 'B', ...])
  const quizQuestions = req.body.questions; // The quiz questions that were sent to the client
  let score = 0;
  
  quizQuestions.forEach((q, index) => {
    if (userAnswers[index] && userAnswers[index].toUpperCase() === q.answer.toUpperCase()) {
      score++;
    }
  });
  res.json({ score: score });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
