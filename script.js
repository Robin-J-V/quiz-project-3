/**
 * Quiz Application with Integrated Theme Management
 * Combines quiz functionality and theme switching in a single unified script
 */

// Global quiz variables
let questions = [];
let currentIndex = 0;
const maxQuestions = 10;
let score = 0;
let timer;
let timeLeft = 10;

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  // Find the theme toggle element
  const themeSwitch = document.querySelector('.theme-switch');
  const html = document.documentElement;
  
  // Initialize theme from localStorage or use default
  initializeTheme();
  
  // Set up theme toggle event listeners if toggle exists
  if (themeSwitch) {
    // Click event for mouse users
    themeSwitch.addEventListener('click', toggleTheme);
    
    // Keyboard accessibility
    setupKeyboardAccessibility(themeSwitch);
    
    // Set initial visual state
    updateToggleVisualState(html.getAttribute('data-theme'));
  } else {
    console.warn('Theme switch element not found on this page');
  }
  
  // Set up theme change observer
  observeThemeChanges();
  
  // Load first question if we're on the quiz page
  if (document.querySelector('.question-text')) {
    loadQuestion();
  }
});

/**
 * Initialize theme from localStorage or use default
 */
function initializeTheme() {
  const html = document.documentElement;
  const themeSwitch = document.querySelector('.theme-switch');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  
  html.setAttribute('data-theme', savedTheme);
  console.log(`Theme initialized to: ${savedTheme}`);
  
  // If we have a theme switch, update its ARIA state
  if (themeSwitch) {
    themeSwitch.setAttribute('aria-checked', savedTheme === 'light' ? 'true' : 'false');
  }
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
  const html = document.documentElement;
  const themeSwitch = document.querySelector('.theme-switch');
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Update HTML attribute
  html.setAttribute('data-theme', newTheme);
  
  // Save preference to localStorage
  localStorage.setItem('theme', newTheme);
  
  // Update the toggle's visual state
  updateToggleVisualState(newTheme);
  
  // Update ARIA attributes for accessibility
  if (themeSwitch) {
    themeSwitch.setAttribute('aria-checked', newTheme === 'light' ? 'true' : 'false');
  }
  
  // Add smooth transition effect
  document.body.style.transition = 'background-image 0.5s ease, color 0.3s ease';
  
  // Apply theme-specific effects
  applyThemeSpecificEffects();
  
  // Optional: play subtle sound effect
  playToggleSound();
  
  console.log(`Theme changed to: ${newTheme}`);
}

/**
 * Update the visual state of the toggle switch
 */
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

/**
 * Set up keyboard accessibility for the theme toggle
 */
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

/**
 * Play subtle sound effect when toggling theme
 */
function playToggleSound() {
  try {
    const toggleSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YQAAAAA=');
    toggleSound.volume = 0.2;
    toggleSound.play();
  } catch (error) {
    // Silent failure if audio can't play
  }
}

/**
 * Observe theme changes
 */
function observeThemeChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        // Theme was changed, update any theme-dependent elements
        const currentTheme = document.documentElement.getAttribute('data-theme');
        console.log(`Theme change detected by observer: ${currentTheme}`);
        
        // Update the toggle's visual state
        updateToggleVisualState(currentTheme);
        
        // Apply any other theme-specific effects
        applyThemeSpecificEffects();
      }
    });
  });
  
  observer.observe(document.documentElement, { attributes: true });
}

/**
 * Apply theme-specific effects
 */
function applyThemeSpecificEffects() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  
  // Add transition class to body for smooth effect
  document.body.classList.add('theme-transition');
  
  // Remove the class after animation completes
  setTimeout(() => {
    document.body.classList.remove('theme-transition');
  }, 500);
}

/**
 * Load quiz question
 */
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
      // Fallback to sample questions for testing
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

/**
 * Display current question
 */
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

/**
 * Start question timer
 */
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

/**
 * Update timer display
 */
function updateTimerDisplay() {
  const timerElement = document.querySelector('.timer');
  if (timerElement) {
    timerElement.textContent = `Time left: ${timeLeft}`;
    
    // Add visual indication when time is running low
    if (timeLeft <= 3) {
      timerElement.classList.add('time-low');
    } else {
      timerElement.classList.remove('time-low');
    }
  }
}

/**
 * Disable all answer buttons
 */
function disableButtons() {
  const allButtons = document.querySelectorAll('.answer-button');
  allButtons.forEach(btn => btn.disabled = true);
}

/**
 * Check selected answer
 */
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

/**
 * End quiz and redirect to results
 */
function endQuiz() {
  localStorage.setItem('quizScore', score);
  saveScore(score); 
  window.location.href = `/results.html`; 
}

function startQuiz() {
  const username = document.getElementById("username").value.trim();
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
