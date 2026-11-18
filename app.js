const startScreen = document.querySelector('#start-screen');
const gameScreen = document.querySelector('#game-screen');
const endScreen = document.querySelector('#end-screen');
const settingsForm = document.querySelector('#settings-form');
const answerForm = document.querySelector('#answer-form');
const questionCountInput = document.querySelector('#question-count');
const timeLimitInput = document.querySelector('#time-limit');
const progressLabel = document.querySelector('#progress');
const progressBar = document.querySelector('#progress-bar');
const scoreLabel = document.querySelector('#score');
const timerLabel = document.querySelector('#timer');
const questionLabel = document.querySelector('#question');
const answerInput = document.querySelector('#answer');
const feedbackLabel = document.querySelector('#feedback');
const finalScore = document.querySelector('#final-score');
const finalMessage = document.querySelector('#final-message');

const praise = [
  'SUPER! Täiesti õige! 🌟', 'VÄGA TUBLI! 🎉', 'Sa oled nutikas! 🧠',
  'Suurepärane töö! 🏆', 'Just nii! Jätka samas vaimus! 🚀',
  'Võimas! Õige vastus! ⭐', 'Matemaatika tuleb sul hästi välja! 😊'
];
const encouragement = [
  'Proovi veel! Sa saad hakkama! 💪', 'Peaaegu! Mõtle natuke veel! 😊',
  'Ära anna alla! Proovi uuesti! ⭐', 'Iga katse teeb sind targemaks! 🚀'
];

let totalQuestions = 10;
let timeLimit = 30;
let currentQuestion = 0;
let correctAnswers = 0;
let correctResult = 0;
let timeLeft = 0;
let timerId = null;
let nextQuestionId = null;
let locked = false;

function showScreen(screen) {
  startScreen.hidden = screen !== 'start';
  gameScreen.hidden = screen !== 'game';
  endScreen.hidden = screen !== 'end';
}

function stopTimers() {
  if (timerId !== null) clearInterval(timerId);
  if (nextQuestionId !== null) clearTimeout(nextQuestionId);
  timerId = null;
  nextQuestionId = null;
}

function startGame() {
  totalQuestions = Number(questionCountInput.value);
  timeLimit = Number(timeLimitInput.value);
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 100 ||
      !Number.isInteger(timeLimit) || timeLimit < 5 || timeLimit > 300) {
    alert('Palun vali tehete arv vahemikus 1–100 ja aeg vahemikus 5–300 sekundit.');
    return;
  }
  currentQuestion = 0;
  correctAnswers = 0;
  showScreen('game');
  nextQuestion();
}

function nextQuestion() {
  stopTimers();
  if (currentQuestion >= totalQuestions) {
    finishGame();
    return;
  }
  currentQuestion += 1;
  let a = Math.floor(Math.random() * 100) + 1;
  let b = Math.floor(Math.random() * 100) + 1;
  let operation;
  if (Math.random() < 0.5) {
    operation = '+';
    correctResult = a + b;
  } else {
    operation = '−';
    if (a < b) [a, b] = [b, a];
    correctResult = a - b;
  }
  questionLabel.textContent = `${a} ${operation} ${b} = ?`;
  progressLabel.textContent = `Tehe ${currentQuestion} / ${totalQuestions}`;
  scoreLabel.textContent = `⭐ ${correctAnswers} õiget`;
  progressBar.style.width = `${((currentQuestion - 1) / totalQuestions) * 100}%`;
  feedbackLabel.textContent = 'Ootan sinu vastust! 😊';
  feedbackLabel.className = 'feedback';
  answerInput.value = '';
  answerInput.disabled = false;
  document.querySelector('#check-button').disabled = false;
  locked = false;
  timeLeft = timeLimit;
  updateTimer();
  answerInput.focus();
  timerId = setInterval(() => {
    if (timeLeft > 0) timeLeft -= 1;
    updateTimer();
    if (timeLeft === 0) {
      clearInterval(timerId);
      timerId = null;
      timerLabel.textContent = '⏰ AEG SAI OTSA!';
      timerLabel.classList.add('urgent');
      feedbackLabel.textContent = 'Pole hullu! Proovi rahulikult edasi! 💪';
      feedbackLabel.className = 'feedback timeup';
    }
  }, 1000);
}

function updateTimer() {
  timerLabel.textContent = `⏱ ${timeLeft} s`;
  timerLabel.classList.toggle('urgent', timeLeft <= 5);
}

function checkAnswer(event) {
  event.preventDefault();
  if (locked) return;
  const raw = answerInput.value.trim();
  if (raw === '') {
    feedbackLabel.textContent = 'Kirjuta kõigepealt vastus! 😊';
    feedbackLabel.className = 'feedback';
    return;
  }
  const answer = Number(raw);
  if (!Number.isInteger(answer)) {
    feedbackLabel.textContent = 'Palun sisesta täisarv!';
    feedbackLabel.className = 'feedback bad';
    return;
  }
  if (answer === correctResult) {
    correctAnswers += 1;
    locked = true;
    if (timerId !== null) clearInterval(timerId);
    timerId = null;
    scoreLabel.textContent = `⭐ ${correctAnswers} õiget`;
    progressBar.style.width = `${(currentQuestion / totalQuestions) * 100}%`;
    feedbackLabel.textContent = praise[Math.floor(Math.random() * praise.length)];
    feedbackLabel.className = 'feedback good';
    answerInput.disabled = true;
    document.querySelector('#check-button').disabled = true;
    nextQuestionId = setTimeout(nextQuestion, 1300);
  } else {
    feedbackLabel.textContent = encouragement[Math.floor(Math.random() * encouragement.length)];
    feedbackLabel.className = 'feedback bad';
    answerInput.select();
  }
}

function finishGame() {
  stopTimers();
  finalScore.textContent = `${correctAnswers} / ${totalQuestions} õiget vastust!`;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  if (percentage === 100) finalMessage.textContent = 'Kõik õiged! Sa oled tõeline matemaatik! 🏆';
  else if (percentage >= 70) finalMessage.textContent = 'Väga tubli töö! Oled palju õppinud! 🌟';
  else finalMessage.textContent = 'Tubli pingutus! Harjutades läheb iga kord paremini! 💪';
  showScreen('end');
}

settingsForm.addEventListener('submit', (event) => {
  event.preventDefault();
  startGame();
});
answerForm.addEventListener('submit', checkAnswer);
document.querySelector('#again-button').addEventListener('click', () => showScreen('start'));
