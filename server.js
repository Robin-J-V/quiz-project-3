const fetch = require('node-fetch');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { connectToDB, getDB } = require('./db');
const userRoutes = require('./user');

const app = express();
const PORT = process.env.PORT || 3000;

connectToDB();
app.use(bodyParser.json());

console.log("Registering user routes at /api");
app.use('/api', userRoutes);
app.use(express.static(path.join(__dirname)));

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
      .slice(0, 10);

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

app.post('/api/submit-score', async (req, res) => {
  const { username, score } = req.body;
  if (!username || typeof score !== 'number') {
    return res.status(400).json({ success: false, message: 'Invalid username or score.' });
  }

  try {
    const db = getDB();
    await db.collection('scores').insertOne({ username, score, timestamp: new Date() });
    res.json({ success: true, message: 'Score submitted.' });
  } catch (err) {
    console.error('Score submission failed:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const db = getDB();
    const topScores = await db.collection('scores').aggregate([
      {
        $group: {
          _id: "$username",
          score: { $max: "$score" },
          latest: { $max: "$timestamp" }
        }
      },
      {
        $sort: { score: -1, latest: 1 }
      },
      {
        $project: {
          _id: 0,
          username: "$_id",
          score: 1
        }
      },
      {
        $limit: 10
      }
    ]).toArray();

    res.json(topScores);
  } catch (err) {
    console.error('Leaderboard fetch failed:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});
