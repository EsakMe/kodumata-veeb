const startScreen = document.querySelector('#start-screen');
const gameScreen = document.querySelector('#game-screen');
const endScreen = document.querySelector('#end-screen');
const settingsForm = document.querySelector('#settings-form');
const answerForm = document.querySelector('#answer-form');
const numberRangeInput = document.querySelector('#number-range');
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
const checkButton = document.querySelector('#check-button');

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
let numberLimit = 100;
let currentQuestion = 0;
let correctAnswers = 0;
let correctResult = 0;
let timeLeft = 0;
let wrongAttempts = 0;
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

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeQuestion() {
  let a;
  let b;
  let operation;

  if (Math.random() < 0.5) {
    // Liitmisel valime teise arvu nii, et summa ei ületaks valitud piiri.
    operation = '+';
    a = randomInteger(1, numberLimit - 1);
    b = randomInteger(1, numberLimit - a);
    correctResult = a + b;
  } else {
    // Lahutamisel on mõlemad arvud valitud vahemikus ja vastus pole negatiivne.
    operation = '−';
    a = randomInteger(1, numberLimit);
    b = randomInteger(1, a);
    correctResult = a - b;
  }

  questionLabel.textContent = `${a} ${operation} ${b} = ?`;
}

function startGame() {
  totalQuestions = Number(questionCountInput.value);
  timeLimit = Number(timeLimitInput.value);
  numberLimit = Number(numberRangeInput.value);

  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 100 ||
      !Number.isInteger(timeLimit) || timeLimit < 5 || timeLimit > 300 ||
      ![50, 100].includes(numberLimit)) {
    alert('Palun kontrolli tehete arvu, aega ja arvude vahemikku.');
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
  wrongAttempts = 0;
  makeQuestion();

  progressLabel.textContent = `Tehe ${currentQuestion} / ${totalQuestions}`;
  scoreLabel.textContent = `⭐ ${correctAnswers} õiget`;
  progressBar.style.width = `${((currentQuestion - 1) / totalQuestions) * 100}%`;
  feedbackLabel.textContent = 'Ootan sinu vastust! 😊';
  feedbackLabel.className = 'feedback';
  answerInput.value = '';
  answerInput.disabled = false;
  checkButton.disabled = false;
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
    feedbackLabel.textContent = praise[randomInteger(0, praise.length - 1)];
    feedbackLabel.className = 'feedback good';
    answerInput.disabled = true;
    checkButton.disabled = true;
    nextQuestionId = setTimeout(nextQuestion, 1300);
    return;
  }

  wrongAttempts += 1;
  answerInput.select();

  if (wrongAttempts >= 3) {
    locked = true;
    if (timerId !== null) clearInterval(timerId);
    timerId = null;
    feedbackLabel.textContent = `Õige vastus oli ${correctResult}. Pole hullu – õpime ja proovime järgmist! 💪`;
    feedbackLabel.className = 'feedback timeup';
    answerInput.disabled = true;
    checkButton.disabled = true;
    nextQuestionId = setTimeout(nextQuestion, 2500);
    return;
  }

  const remaining = 3 - wrongAttempts;
  feedbackLabel.textContent = `${encouragement[randomInteger(0, encouragement.length - 1)]} Veel ${remaining} ${remaining === 1 ? 'katse' : 'katset'}.`;
  feedbackLabel.className = 'feedback bad';
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
document.querySelector('#again-button').addEventListener('click', () => {
  stopTimers();
  showScreen('start');
});
