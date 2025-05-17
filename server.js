const fetch = require('node-fetch');
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

function decodeHtml(html) {
  return html.replace(/&quot;/g, '"')
             .replace(/&#039;/g, "'")
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&eacute;/g, 'é');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/start-quiz', async (req, res) => {
  const url = 'https://opentdb.com/api.php?amount=10&type=multiple';

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.response_code !== 0) {
      return res.status(400).json({ error: 'Failed to fetch trivia questions' });
    }

    const formatted = data.results
      .map((q, index) => {
        const allAnswers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

        if (allAnswers.length < 4) return null;

        return {
          id: index + 1,
          question: decodeHtml(q.question),
          A: decodeHtml(allAnswers[0]),
          B: decodeHtml(allAnswers[1]),
          C: decodeHtml(allAnswers[2]),
          D: decodeHtml(allAnswers[3]),
          answer: ['A', 'B', 'C', 'D'][allAnswers.indexOf(q.correct_answer)]
        };
      })
      .filter(Boolean)
      .slice(0, 10); // ensure max 10

    res.json({ questions: formatted });
  } catch (error) {
    console.error('Trivia API error:', error.message);
    res.status(500).json({ error: error.message });
  }
  
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
