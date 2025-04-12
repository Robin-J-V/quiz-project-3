function saveScore(score) {
    const name = localStorage.getItem("quizUsername") || "Anonymous";
    const leaderboard = JSON.parse(localStorage.getItem("quizLeaderboard")) || [];
  
    leaderboard.push({ name, score });
    localStorage.setItem("quizLeaderboard", JSON.stringify(leaderboard));
  }
  