/* Kodumata – vanemate brauserite versioon (ES5, sh iOS 9 Safari). */
(function () {
  'use strict';

  function byId(id) {
    return document.getElementById(id);
      function focusAnswerField() {
    if (!answerInput.disabled) {
      answerInput.focus();
    }
  }
  }

  var startScreen = byId('start-screen');
  var gameScreen = byId('game-screen');
  var endScreen = byId('end-screen');
  var settingsForm = byId('settings-form');
  var answerForm = byId('answer-form');
  var numberRangeInput = byId('number-range');
  var questionCountInput = byId('question-count');
  var timeLimitInput = byId('time-limit');
  var progressLabel = byId('progress');
  var progressBar = byId('progress-bar');
  var scoreLabel = byId('score');
  var timerLabel = byId('timer');
  var questionLabel = byId('question');
  var answerInput = byId('answer');
  var feedbackLabel = byId('feedback');
  var finalScore = byId('final-score');
  var finalMessage = byId('final-message');
  var checkButton = byId('check-button');
  var againButton = byId('again-button');

  var praise = [
    'SUPER! Täiesti õige! 🌟',
    'VÄGA TUBLI! 🎉',
    'Sa oled nutikas! 🧠',
    'Suurepärane töö! 🏆',
    'Just nii! Jätka samas vaimus! 🚀',
    'Võimas! Õige vastus! ⭐',
    'Matemaatika tuleb sul hästi välja! 😊'
  ];

  var encouragement = [
    'Proovi veel! Sa saad hakkama! 💪',
    'Peaaegu! Mõtle natuke veel! 😊',
    'Ära anna alla! Proovi uuesti! ⭐',
    'Iga katse teeb sind targemaks! 🚀'
  ];

  var totalQuestions = 10;
  var timeLimit = 30;
  var numberLimit = 100;
  var currentQuestion = 0;
  var correctAnswers = 0;
  var correctResult = 0;
  var timeLeft = 0;
  var wrongAttempts = 0;
  var timerId = null;
  var nextQuestionId = null;
  var locked = false;

  function showScreen(screen) {
    startScreen.hidden = screen !== 'start';
    gameScreen.hidden = screen !== 'game';
    endScreen.hidden = screen !== 'end';
  }

  function stopTimers() {
    if (timerId !== null) {
      window.clearInterval(timerId);
    }
    if (nextQuestionId !== null) {
      window.clearTimeout(nextQuestionId);
    }
    timerId = null;
    nextQuestionId = null;
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function setFeedback(message, className) {
    feedbackLabel.textContent = message;
    feedbackLabel.className = 'feedback' + (className ? ' ' + className : '');
  }

  function makeQuestion() {
    var a;
    var b;
    var operation;

    if (Math.random() < 0.5) {
      operation = '+';
      a = randomInteger(1, numberLimit - 1);
      b = randomInteger(1, numberLimit - a);
      correctResult = a + b;
    } else {
      operation = '−';
      a = randomInteger(1, numberLimit);
      b = randomInteger(1, a);
      correctResult = a - b;
    }

    questionLabel.textContent = a + ' ' + operation + ' ' + b + ' = ?';
  }

  function isWholeNumber(value) {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
  }

  function startGame() {
    totalQuestions = Number(questionCountInput.value);
    timeLimit = Number(timeLimitInput.value);
    numberLimit = Number(numberRangeInput.value);

    if (!isWholeNumber(totalQuestions) || totalQuestions < 1 || totalQuestions > 100 ||
        !isWholeNumber(timeLimit) || timeLimit < 5 || timeLimit > 300 ||
        (numberLimit !== 50 && numberLimit !== 100)) {
      window.alert('Palun kontrolli tehete arvu, aega ja arvude vahemikku.');
      return;
    }

    currentQuestion = 0;
    correctAnswers = 0;
    showScreen('game');
    nextQuestion();
  }

  function updateTimer() {
    timerLabel.textContent = '⏱ ' + timeLeft + ' s';
    if (timeLeft <= 5) {
      addClass(timerLabel, 'urgent');
    } else {
      removeClass(timerLabel, 'urgent');
    }
  }

  function addClass(element, className) {
    if ((' ' + element.className + ' ').indexOf(' ' + className + ' ') === -1) {
      element.className = element.className ? element.className + ' ' + className : className;
    }
  }

  function removeClass(element, className) {
    var expression = new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g');
    element.className = element.className.replace(expression, ' ').replace(/^\s+|\s+$/g, '');
  }

  function nextQuestion() {
    stopTimers();

    if (currentQuestion >= totalQuestions) {
      finishGame();
      return;
    }

    currentQuestion += 1;
    wrongAttempts = 0;
    locked = false;
    makeQuestion();

    progressLabel.textContent = 'Tehe ' + currentQuestion + ' / ' + totalQuestions;
    scoreLabel.textContent = '⭐ ' + correctAnswers + ' õiget';
    progressBar.style.width = (((currentQuestion - 1) / totalQuestions) * 100) + '%';
    setFeedback('Ootan sinu vastust! 😊', '');
    answerInput.value = '';
    answerInput.disabled = false;
    checkButton.disabled = false;
    focusAnswerField();

    timeLeft = timeLimit;
    updateTimer();

    timerId = window.setInterval(function () {
      if (timeLeft > 0) {
        timeLeft -= 1;
      }
      updateTimer();

      if (timeLeft === 0) {
        window.clearInterval(timerId);
        timerId = null;
        timerLabel.textContent = '⏰ AEG SAI OTSA!';
        addClass(timerLabel, 'urgent');
        setFeedback('Pole hullu! Proovi rahulikult edasi! 💪', 'timeup');
      }
    }, 1000);
  }

  function checkAnswer(event) {
    var raw;
    var answer;
    var remaining;

    if (event && event.preventDefault) {
      event.preventDefault();
    }
    if (locked) {
      return false;
    }

    raw = String(answerInput.value).replace(/^\s+|\s+$/g, '');
    if (raw === '') {
      setFeedback('Kirjuta kõigepealt vastus! 😊', '');
      return false;
    }

    answer = Number(raw);
    if (!isWholeNumber(answer)) {
      setFeedback('Palun sisesta täisarv!', 'bad');
      return false;
    }

    if (answer === correctResult) {
      correctAnswers += 1;
      locked = true;
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
      scoreLabel.textContent = '⭐ ' + correctAnswers + ' õiget';
      progressBar.style.width = ((currentQuestion / totalQuestions) * 100) + '%';
      setFeedback(praise[randomInteger(0, praise.length - 1)], 'good');
      answerInput.disabled = true;
      checkButton.disabled = true;
      nextQuestionId = window.setTimeout(nextQuestion, 1300);
      return false;
    }

    wrongAttempts += 1;
    if (typeof answerInput.select === 'function') {
      answerInput.select();
    }

    if (wrongAttempts >= 3) {
      locked = true;
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
      setFeedback('Õige vastus oli ' + correctResult + '. Pole hullu – õpime ja proovime järgmist! 💪', 'timeup');
      answerInput.disabled = true;
      checkButton.disabled = true;
      nextQuestionId = window.setTimeout(nextQuestion, 2500);
      return false;
    }
    
    focusAnswerField();
    remaining = 3 - wrongAttempts;
    setFeedback(
      encouragement[randomInteger(0, encouragement.length - 1)] +
      ' Veel ' + remaining + (remaining === 1 ? ' katse.' : ' katset.'),
      'bad'
    );
    return false;
  }

  function finishGame() {
    var percentage;
    stopTimers();
    finalScore.textContent = correctAnswers + ' / ' + totalQuestions + ' õiget vastust!';
    percentage = Math.round((correctAnswers / totalQuestions) * 100);

    if (percentage === 100) {
      finalMessage.textContent = 'Kõik õiged! Sa oled tõeline matemaatik! 🏆';
    } else if (percentage >= 70) {
      finalMessage.textContent = 'Väga tubli töö! Oled palju õppinud! 🌟';
    } else {
      finalMessage.textContent = 'Tubli pingutus! Harjutades läheb iga kord paremini! 💪';
    }
    showScreen('end');
  }

  settingsForm.addEventListener('submit', function (event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }
    startGame();
    return false;
  }, false);

  answerForm.addEventListener('submit', checkAnswer, false);

  againButton.addEventListener('click', function () {
    stopTimers();
    showScreen('start');
  }, false);

  /* Näita avakuva kohe; mängu käivitamine toimub vormi kaudu. */
  showScreen('start');
}());
