// script.js
// Make sure this file is linked in your HTML (e.g. <script src="script.js"></script>)

// Wait until the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // 1) HOME PAGE (index.html) Logic:
    const startQuizBtn = document.getElementById('startQuizBtn');
    if (startQuizBtn) {
      startQuizBtn.addEventListener('click', () => {
        // Navigate to quiz page
        window.location.href = 'quiz.html';
      });
    }
  
    // 2) QUIZ PAGE (quiz.html) Logic:
    const quizContainer = document.getElementById('quiz-container');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
  
    if (quizContainer && submitQuizBtn) {
      // (A) EXAMPLE 1: Fetch questions from a local JSON file directly.
      // If your questions.json is in the same folder as quiz.html (or same public folder),
      // you can simply do:
      fetch('questions.json')
        .then(response => response.json())
        .then(questionsData => {
          // If you only want 10 questions each time, randomize them:
          const shuffled = questionsData.sort(() => 0.5 - Math.random());
          const selectedQuestions = shuffled.slice(0, 10);
  
          // Render questions onto the page
          displayQuestions(selectedQuestions, quizContainer);
  
          // When user clicks "Submit", calculate the score
          submitQuizBtn.addEventListener('click', () => {
            const score = calculateScore(selectedQuestions);
            // Redirect to results page with the user’s score as query params
            window.location.href = `results.html?score=${score}&total=${selectedQuestions.length}`;
          });
        })
        .catch(err => console.error('Error fetching questions:', err));
  
      // (B) EXAMPLE 2: If you have a Node.js/Express backend with endpoints /api/start-quiz & /api/submit-quiz,
      // you would do something like:
      /*
      fetch('/api/start-quiz')                // gets 10 questions from server
        .then(res => res.json())
        .then(data => {
           const selectedQuestions = data.questions;
           displayQuestions(selectedQuestions, quizContainer);
  
           submitQuizBtn.addEventListener('click', async () => {
             // gatherAnswers returns an array of { questionId, selectedAnswerIndex }
             const userAnswers = gatherAnswers(selectedQuestions);
  
             // Send answers to the server to compute the score
             const resp = await fetch('/api/submit-quiz', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ answers: userAnswers })
             });
             const results = await resp.json(); // { score, total }
             // Redirect
             window.location.href = `results.html?score=${results.score}&total=${results.total}`;
           });
        })
        .catch(console.error);
      */
    }
  
    // 3) RESULTS PAGE (results.html) Logic:
    const resultsText = document.getElementById('resultsText');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
  
    if (resultsText && tryAgainBtn) {
      // Grab the score & total from the query params:
      const urlParams = new URLSearchParams(window.location.search);
      const score = urlParams.get('score');
      const total = urlParams.get('total');
  
      if (score !== null && total !== null) {
        resultsText.textContent = `You scored ${score} out of ${total}!`;
      } else {
        resultsText.textContent = 'No quiz results found.';
      }
  
      // Button to return to the home page (or start quiz again)
      tryAgainBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  });
  
  /**
   * displayQuestions(questions, container)
   * Renders each question and its answers into the quiz container.
   */
  function displayQuestions(questions, container) {
    container.innerHTML = ''; // Clear any existing content
  
    questions.forEach((q, index) => {
      // Create a wrapper div for the question
      const questionDiv = document.createElement('div');
      questionDiv.classList.add('question-card'); // So you can style it in CSS
  
      // Build the HTML for question text & radio buttons
      questionDiv.innerHTML = `
        <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
        <div class="question-answers">
          ${q.answers
            .map((answer, i) => {
              return `
                <label>
                  <input 
                    type="radio" 
                    name="question-${q.id}" 
                    value="${i}"
                  />
                  ${answer}
                </label>
              `;
            })
            .join('')}
        </div>
      `;
      container.appendChild(questionDiv);
    });
  }
  
  /**
   * calculateScore(questions)
   * Reads the user-selected answers from the DOM and compares them
   * to the correct answers (from the question data).
   * Returns the user's score (number of correct answers).
   */
  function calculateScore(questions) {
    let score = 0;
  
    questions.forEach(q => {
      // Find the selected radio button for this question
      const radios = document.getElementsByName(`question-${q.id}`);
      let selectedIndex = null;
  
      radios.forEach(radio => {
        if (radio.checked) {
          selectedIndex = parseInt(radio.value, 10);
        }
      });
  
      // Check if user selected the correct answer
      if (selectedIndex === q.correctAnswerIndex) {
        score++;
      }
    });
  
    return score;
  }
  
  /**
   * gatherAnswers(questions)
   * (Used for the Node/Express approach)
   * Creates an array of { questionId, selectedAnswerIndex } for each question.
   */
  function gatherAnswers(questions) {
    return questions.map(q => {
      const radios = document.getElementsByName(`question-${q.id}`);
      let selectedIndex = null;
  
      radios.forEach(radio => {
        if (radio.checked) {
          selectedIndex = parseInt(radio.value, 10);
        }
      });
  
      return {
        questionId: q.id,
        selectedAnswerIndex: selectedIndex
      };
    });
  }
  