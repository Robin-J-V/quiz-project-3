# Quiz-Project 3

Quiz-Project
Features
Multi-Page App: Home, Rules, Quiz, Results, Leaderboard, and Study pages, Player Profile with play history
Randomized Quiz: 10 random questions per game from Triva API.
Timer: 30-second countdown per question with auto-advance.
Answer Feedback: Visual indicators for correct/incorrect answers.
Score Tracking: Real-time scoring and result reveal with sound.
Leaderboard: Top 10 Leaderboard connected to mongodb shows top 10 players and their scores
Study Mode: Scrollable list of 500+ trivia questions and answers.
Theme Toggle: Dark/Light mode with animation and persistence.
Responsive Design: Mobile-friendly layout and styles.

Running the App

Visit: https://quiz-project-3.onrender.com

To run locally:
Open your terminal and navigate to the project folder.
install the dependencies:
npm install node-fetch@2
npm install dotenv
npm install mongodb

start the server:

-node server.js

then enter http://localhost:3000/ in your browser



Group Member Responsibilities

Farhan Azad:
-updated colors
-rerouted html files
-increased question timer


Robin Verma:
-created user account for mongo db and connected data base to project
-connected leaderboard to mongo db which keeps track of top 10 players and their scores
-connected user profile to mongo db so that player history is recorded and leaderboard has real player information
-made it so user profile keeps track of player average score, quizes taken, highest score, the date quizes were taken/score history. all is saveda to and retrived from mongodb
-connected quiz trivia API
-created capactiy for real users to sign up, to login and log out with user information/log in information being saved in and retrieved from mongodb. 



Sarmad Ali:
-creted login and sign up html pages
-created side bar for profile and sign out buttons and loading home page