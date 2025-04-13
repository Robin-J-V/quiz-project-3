let questions = [];
let currentIndex = 0;
const maxQuestions = 10;
let score = 0;
let timer;
let timeLeft = 10;

document.addEventListener('DOMContentLoaded', () => {
  const themeSwitch = document.querySelector('.theme-switch');
  const html = document.documentElement;
  
  initializeTheme();
  
  if (themeSwitch) {
    themeSwitch.addEventListener('click', toggleTheme);
    setupKeyboardAccessibility(themeSwitch);
    updateToggleVisualState(html.getAttribute('data-theme'));
  } else {
    console.warn('Theme switch element not found on this page');
  }
  observeThemeChanges();

  if (document.querySelector('.question-text')) {
    loadQuestion();
  }
});

function initializeTheme() {
  const html = document.documentElement;
  const themeSwitch = document.querySelector('.theme-switch');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  html.setAttribute('data-theme', savedTheme);
  console.log(`Theme initialized to: ${savedTheme}`);
  
  if (themeSwitch) {
    themeSwitch.setAttribute('aria-checked', savedTheme === 'light' ? 'true' : 'false');
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const themeSwitch = document.querySelector('.theme-switch');
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateToggleVisualState(newTheme);
  
  if (themeSwitch) {
    themeSwitch.setAttribute('aria-checked', newTheme === 'light' ? 'true' : 'false');
  }
  
  document.body.style.transition = 'background-image 0.5s ease, color 0.3s ease';
  
  applyThemeSpecificEffects();

  playToggleSound();
  
  console.log(`Theme changed to: ${newTheme}`);
}

function updateToggleVisualState(theme) {
  const switchThumb = document.querySelector('.switch-thumb');
  if (switchThumb) {
    if (theme === 'light') {
      switchThumb.style.transform = 'translateX(40px)';
    } else {
      switchThumb.style.transform = 'translateX(0)';
    }
  }
}

function setupKeyboardAccessibility(element) {
  element.setAttribute('tabindex', '0');
  element.setAttribute('role', 'switch');
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  });
}

function playToggleSound() {
  try {
    const toggleSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YQAAAAA=');
    toggleSound.volume = 0.2;
    toggleSound.play();
  } catch (error) {}
}

function observeThemeChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        console.log(`Theme change detected by observer: ${currentTheme}`);
        updateToggleVisualState(currentTheme);
        applyThemeSpecificEffects();
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
}

function applyThemeSpecificEffects() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  document.body.classList.add('theme-transition');
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 500);
}

async function loadQuestion() {
  clearInterval(timer);

  if (questions.length === 0) {
    try {
      const response = await fetch('/api/start-quiz');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      questions = data.questions;
    } catch (error) {
      console.error('Error loading questions:', error);
      questions = getSampleQuestions();
    }
  }

  if (currentIndex >= maxQuestions || currentIndex >= questions.length) {
    endQuiz();
    return;
  }

  displayQuestion();
  startTimer();
}

function displayQuestion() {
  const question = questions[currentIndex];
  document.querySelector('.question-number').textContent = `Question ${currentIndex + 1}`;
  document.querySelector('.question-text').textContent = question.question;

  const answersDiv = document.querySelector('.answers');
  answersDiv.innerHTML = '';

  const options = ['A', 'B', 'C', 'D'];
  options.forEach(letter => {
    const button = document.createElement('button');
    button.classList.add('answer-button');
    button.textContent = `${letter}: ${question[letter]}`;
    button.dataset.letter = letter;
    button.onclick = () => checkAnswer(letter, question.answer, button);
    answersDiv.appendChild(button);
  });
}

function startTimer() {
  timeLeft = 10;
  updateTimerDisplay();

  timer = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft === 0) {
      disableButtons();
      setTimeout(() => {
        currentIndex++;
        loadQuestion();
      }, 500);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerElement = document.querySelector('.timer');
  if (timerElement) {
    timerElement.textContent = `Time left: ${timeLeft}`;
    if (timeLeft <= 3) {
      timerElement.classList.add('time-low');
    } else {
      timerElement.classList.remove('time-low');
    }
  }
}

function disableButtons() {
  const allButtons = document.querySelectorAll('.answer-button');
  allButtons.forEach(btn => btn.disabled = true);
}

function checkAnswer(selected, correct, clickedButton) {
  clearInterval(timer);
  const allButtons = document.querySelectorAll('.answer-button');

  allButtons.forEach(btn => {
    btn.disabled = true;

    if (btn.dataset.letter === correct) {
      btn.classList.add('correct');
    } else if (btn === clickedButton && selected !== correct) {
      btn.classList.add('incorrect');
    }
  });

  if (selected === correct) {
    score++;
  }

  setTimeout(() => {
    currentIndex++;
    loadQuestion();
  }, 1000);
}

function endQuiz() {
  localStorage.setItem('quizScore', score);
  saveScore(score); 
  window.location.href = `/results.html`; 
}

function startQuiz() {
  const username = document.getElementById("username").value.trim();
  const errorMessage = document.getElementById('error-message');
  if (!username) {
    alert("Please enter your name before starting the quiz.");
    return;
  }
  localStorage.setItem("quizUsername", username);
  location.href = "quiz.html";
}

function saveScore(score) {
  const name = localStorage.getItem("quizUsername") || "Anonymous";
  const leaderboard = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];

  leaderboard.push({ name, score });
  localStorage.setItem("quizLeaderboard", JSON.stringify(leaderboard));
}

function saveScore(score) {
  const name = localStorage.getItem("quizUsername") || "Anonymous";
  const leaderboard = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];

  leaderboard.push({ name, score });
  localStorage.setItem("quizLeaderboard", JSON.stringify(leaderboard));
}

function playResultSound(score) {
  const audio = new Audio(score >= 6 ? 'success.mp3' : 'fail.mp3');
  audio.volume = 0.8;
  audio.play().catch((err) => {
    console.warn("Audio playback blocked:", err);
  });
}

function revealScore() {
  const storedScore = localStorage.getItem('quizScore');
  const resultEl = document.querySelector('.result-message');

  if (!storedScore) {
    resultEl.innerText = 'No score found.';
    return;
  }

  score = parseInt(storedScore);
  resultEl.innerText = `Your score is: ${score} / 10`;
  playResultSound(score);
  document.getElementById('revealBtn').style.display = 'none';
  
  document.querySelector('.button-group').style.display = 'flex';

  localStorage.removeItem('quizScore');
}


document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('revealBtn')) {
    document.getElementById('revealBtn').addEventListener('click', revealScore);
  }

  if (window.location.pathname.includes('leaderboard.html')) {
    const leaderboard = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];
    leaderboard.sort((a, b) => b.score - a.score);

    const tbody = document.querySelector(".leaderboard-table tbody");
    leaderboard.forEach((entry, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td class="rank">${index + 1}</td><td>${entry.name}</td><td>${entry.score}</td>`;
      tbody.appendChild(row);
    });
  }
});