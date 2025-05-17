let questions = [];
let currentIndex = 0;
const maxQuestions = 10;
let score = 0;
let timer;
let timeLeft = 30;

document.addEventListener('DOMContentLoaded', () => {
  const themeSwitch = document.querySelector('.theme-switch');
  const html = document.documentElement;
  const nav = document.getElementById('navButtons');
  const heading = document.getElementById('welcomeHeading');

  initializeTheme();

  if (themeSwitch) {
    themeSwitch.addEventListener('click', toggleTheme);
    setupKeyboardAccessibility(themeSwitch);
    updateToggleVisualState(html.getAttribute('data-theme'));
  }

  observeThemeChanges();

  if (window.location.pathname.includes('index.html')) {
    const user = localStorage.getItem('quizUsername');
    if (user) {
      if (nav) nav.style.display = 'block';
      if (heading) heading.textContent = `Welcome, ${user}`;
    } else {
      window.location.href = 'login.html';
    }
  }

  if (document.querySelector('.question-text')) {
    loadQuestion();
  }

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

function initializeTheme() {
  const html = document.documentElement;
  const themeSwitch = document.querySelector('.theme-switch');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  if (themeSwitch) themeSwitch.setAttribute('aria-checked', savedTheme === 'light' ? 'true' : 'false');
}

function toggleTheme() {
  const html = document.documentElement;
  const themeSwitch = document.querySelector('.theme-switch');
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateToggleVisualState(newTheme);
  if (themeSwitch) themeSwitch.setAttribute('aria-checked', newTheme === 'light' ? 'true' : 'false');
  document.body.style.transition = 'background-image 0.5s ease, color 0.3s ease';
  applyThemeSpecificEffects();
  playToggleSound();
}

function updateToggleVisualState(theme) {
  const switchThumb = document.querySelector('.switch-thumb');
  if (switchThumb) switchThumb.style.transform = theme === 'light' ? 'translateX(40px)' : 'translateX(0)';
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
        updateToggleVisualState(currentTheme);
        applyThemeSpecificEffects();
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });
}

function applyThemeSpecificEffects() {
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
      const data = await response.json();
      if (!data.questions || !Array.isArray(data.questions)) {
        alert("Invalid question format from API");
        return;
      }
      questions = data.questions;
    } catch (error) {
      console.error("Error loading questions:", error);
      alert("Could not load quiz questions. Try again later.");
      return;
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
  timeLeft = 30;
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
    timerElement.classList.toggle('time-low', timeLeft <= 3);
  }
}

function disableButtons() {
  document.querySelectorAll('.answer-button').forEach(btn => btn.disabled = true);
}

function checkAnswer(selected, correct, clickedButton) {
  clearInterval(timer);
  document.querySelectorAll('.answer-button').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.letter === correct) btn.classList.add('correct');
    else if (btn === clickedButton && selected !== correct) btn.classList.add('incorrect');
  });
  if (selected === correct) score++;
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
  const username = localStorage.getItem("loggedInUser");
  localStorage.setItem("quizUsername", username);
  location.href = "quiz.html";
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
  audio.play().catch(() => {});
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

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const validUser = "user";
  const validPass = "pass";
  if (username === validUser && password === validPass) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "home.html";
  } else {
    alert("Invalid credentials");
  }
}

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

function checkLoginStatus() {
  const user = localStorage.getItem("loggedInUser");
  if (user) showMainContent(user);
}

function showMainContent(username) {
  document.getElementById("loginSection").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  document.getElementById("menuToggle").style.display = "block";
  document.getElementById("sidebar").style.display = "flex";
  document.getElementById("welcomeMessage").textContent = `Welcome, ${username}!`;
}

function showDashboard(username) {
  document.getElementById('navButtons').style.display = 'block';
  document.querySelectorAll('.input-container').forEach(el => el.style.display = 'none');
  document.querySelector('button[onclick="login()"]').style.display = 'none';
  document.querySelector('p').style.display = 'none';
  document.querySelector('h1').textContent = `Welcome, ${username}!`;
  document.body.classList.add("logged-in");
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.style.display = 'flex';
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  sidebar.classList.toggle("active");
  overlay.style.display = sidebar.classList.contains("active") ? "block" : "none";
}

window.addEventListener('DOMContentLoaded', checkLoginStatus);

function signup() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!firstName || !username || !password || !confirmPassword) {
    alert("Please fill in all required fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const data = { firstName, lastName, username, password };

  fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(response => {
    alert(response.message);
    if (response.success) {
      window.location.href = "login.html";
    }
  });
}