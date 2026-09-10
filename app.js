/**
 * DevPulse Quiz Application Engine
 * Handles gameplay logic, timer, scoring, question interaction, audio,
 * confetti celebrations, high scores, and review.
 */

// ==================== STATE ====================
const state = {
  config: {
    category: 'all',
    difficulty: 'all',
    count: 8,
    timerMode: 'timed'
  },
  quiz: {
    questions: [],
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    history: [], // [{ question, userSelection, isCorrect, correctText, explanation }]
    timerRemaining: 15,
    timerInterval: null,
    hasAnswered: false,
    selectedMultiIndices: new Set(),
    fiftyFiftyUsed: false,
    hintUsed: false,
    startTime: null,
    totalElapsedSeconds: 0
  }
};

// ==================== DOM ELEMENTS ====================
const elements = {
  // Views
  setupView: document.getElementById('setup-view'),
  quizView: document.getElementById('quiz-view'),
  resultsView: document.getElementById('results-view'),
  reviewView: document.getElementById('review-view'),

  // Header
  soundToggleBtn: document.getElementById('sound-toggle-btn'),
  soundIconOn: document.getElementById('sound-icon-on'),
  soundIconOff: document.getElementById('sound-icon-off'),
  leaderboardBtn: document.getElementById('leaderboard-btn'),

  // Setup options
  categoryChips: document.querySelectorAll('#category-selector .option-chip'),
  difficultyChips: document.querySelectorAll('#difficulty-selector .option-chip'),
  countChips: document.querySelectorAll('#count-selector .option-chip'),
  timerChips: document.querySelectorAll('#timer-selector .option-chip'),
  startQuizBtn: document.getElementById('start-quiz-btn'),

  // Quiz Arena
  categoryBadge: document.getElementById('quiz-category-badge'),
  difficultyBadge: document.getElementById('quiz-difficulty-badge'),
  streakBadge: document.getElementById('streak-badge'),
  streakCounter: document.getElementById('streak-counter'),
  timerContainer: document.getElementById('timer-container'),
  timerCircleProgress: document.getElementById('timer-circle-progress'),
  timerSeconds: document.getElementById('timer-seconds'),
  progressFill: document.getElementById('quiz-progress-fill'),
  currentQIndex: document.getElementById('current-q-index'),
  totalQCount: document.getElementById('total-q-count'),
  questionTypeBadge: document.getElementById('question-type-badge'),
  lifeline5050: document.getElementById('lifeline-5050'),
  lifelineHint: document.getElementById('lifeline-hint'),
  questionTitle: document.getElementById('question-title'),
  questionHintBox: document.getElementById('question-hint-box'),
  questionHintText: document.getElementById('question-hint-text'),
  optionsContainer: document.getElementById('options-container'),
  explanationBox: document.getElementById('explanation-box'),
  explanationText: document.getElementById('explanation-text'),
  quitQuizBtn: document.getElementById('quit-quiz-btn'),
  actionQuizBtn: document.getElementById('action-quiz-btn'),
  actionQuizBtnText: document.getElementById('action-quiz-btn-text'),
  actionQuizBtnIcon: document.getElementById('action-quiz-btn-icon'),

  // Results
  resultsScoreMeter: document.getElementById('results-score-meter'),
  resultsPercentVal: document.getElementById('results-percent-val'),
  performanceTitle: document.getElementById('performance-title'),
  performanceDesc: document.getElementById('performance-desc'),
  statTotalScore: document.getElementById('stat-total-score'),
  statCorrectCount: document.getElementById('stat-correct-count'),
  statWrongCount: document.getElementById('stat-wrong-count'),
  statMaxStreak: document.getElementById('stat-max-streak'),
  statTimeTaken: document.getElementById('stat-time-taken'),
  reviewAnswersBtn: document.getElementById('review-answers-btn'),
  restartQuizBtn: document.getElementById('restart-quiz-btn'),
  changeSettingsBtn: document.getElementById('change-settings-btn'),
  shareScoreBtn: document.getElementById('share-score-btn'),

  // Review
  backToResultsBtn: document.getElementById('back-to-results-btn'),
  reviewList: document.getElementById('review-list'),
  reviewPlayAgainBtn: document.getElementById('review-play-again-btn'),

  // Leaderboard Modal
  leaderboardModal: document.getElementById('leaderboard-modal'),
  closeLeaderboardBtn: document.getElementById('close-leaderboard-btn'),
  closeModalFooterBtn: document.getElementById('close-modal-footer-btn'),
  clearLeaderboardBtn: document.getElementById('clear-leaderboard-btn'),
  leaderboardList: document.getElementById('leaderboard-list'),

  // Toast & Confetti
  toastNotice: document.getElementById('toast-notice'),
  toastMessage: document.getElementById('toast-message'),
  confettiCanvas: document.getElementById('confetti-canvas')
};

// ==================== INITIALIZATION ====================
function init() {
  setupConfigListeners();
  setupActionListeners();
  setupKeyboardNavigation();
  updateSoundIcon();
}

// Switch Active View
function showView(viewName) {
  const views = [elements.setupView, elements.quizView, elements.resultsView, elements.reviewView];
  views.forEach(v => v.classList.remove('active'));

  if (viewName === 'setup') elements.setupView.classList.add('active');
  if (viewName === 'quiz') elements.quizView.classList.add('active');
  if (viewName === 'results') elements.resultsView.classList.add('active');
  if (viewName === 'review') elements.reviewView.classList.add('active');
}

// Show Toast
function showToast(msg, icon = '✨') {
  elements.toastMessage.textContent = msg;
  elements.toastNotice.querySelector('#toast-icon').textContent = icon;
  elements.toastNotice.classList.add('show');
  setTimeout(() => {
    elements.toastNotice.classList.remove('show');
  }, 2800);
}

// ==================== CONFIGURATION SELECTION ====================
function setupConfigListeners() {
  function bindChips(chips, configKey, isNumeric = false) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        audio.playClick();
        chips.forEach(c => {
          c.classList.remove('selected');
          c.setAttribute('aria-checked', 'false');
        });
        chip.classList.add('selected');
        chip.setAttribute('aria-checked', 'true');
        const val = chip.dataset.value;
        state.config[configKey] = isNumeric ? parseInt(val, 10) : val;
      });
    });
  }

  bindChips(elements.categoryChips, 'category');
  bindChips(elements.difficultyChips, 'difficulty');
  bindChips(elements.countChips, 'count', true);
  bindChips(elements.timerChips, 'timerMode');

  elements.startQuizBtn.addEventListener('click', startQuiz);
}

// ==================== SOUND TOGGLE ====================
function updateSoundIcon() {
  if (audio.isMuted) {
    elements.soundIconOn.style.display = 'none';
    elements.soundIconOff.style.display = 'block';
  } else {
    elements.soundIconOn.style.display = 'block';
    elements.soundIconOff.style.display = 'none';
  }
}

elements.soundToggleBtn.addEventListener('click', () => {
  const muted = audio.toggleMute();
  updateSoundIcon();
  showToast(muted ? "Sound muted" : "Sound unmuted", muted ? "🔇" : "🔊");
});

// ==================== GAMEPLAY LIFECYCLE ====================
function startQuiz() {
  audio.playClick();
  
  // Filter questions according to config
  const filtered = getFilteredQuestions(
    state.config.category,
    state.config.difficulty,
    state.config.count
  );

  if (filtered.length === 0) {
    showToast("No questions available for this combination. Try another!", "⚠️");
    return;
  }

  // Initialize Quiz State
  state.quiz = {
    questions: filtered,
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    currentStreak: 0,
    maxStreak: 0,
    history: [],
    timerRemaining: 15,
    timerInterval: null,
    hasAnswered: false,
    selectedMultiIndices: new Set(),
    fiftyFiftyUsed: false,
    hintUsed: false,
    startTime: Date.now(),
    totalElapsedSeconds: 0
  };

  showView('quiz');
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const q = state.quiz.questions[state.quiz.currentIndex];
  state.quiz.hasAnswered = false;
  state.quiz.selectedMultiIndices.clear();
  state.quiz.fiftyFiftyUsed = false;
  state.quiz.hintUsed = false;

  // Reset UI components
  elements.explanationBox.style.display = 'none';
  elements.questionHintBox.style.display = 'none';
  elements.lifeline5050.disabled = q.type !== 'single';
  elements.lifelineHint.disabled = false;

  // Update Meta Badges
  elements.currentQIndex.textContent = state.quiz.currentIndex + 1;
  elements.totalQCount.textContent = state.quiz.questions.length;
  
  const categoryNames = {
    'all': 'Mixed',
    'web-dev': 'Web Dev',
    'cs-logic': 'CS & Logic',
    'tech-ai': 'Tech & AI'
  };
  elements.categoryBadge.textContent = categoryNames[q.category] || q.category;
  
  elements.difficultyBadge.className = `difficulty-tag ${q.difficulty}`;
  elements.difficultyBadge.textContent = q.difficulty;

  // Type badge
  const typeLabels = {
    'single': 'Single Choice',
    'multi': 'Multi-Select',
    'fill': 'Fill in Blank',
    'boolean': 'True / False'
  };
  elements.questionTypeBadge.textContent = typeLabels[q.type] || 'Question';

  // Progress Bar
  const progressPercent = ((state.quiz.currentIndex) / state.quiz.questions.length) * 100;
  elements.progressFill.style.width = `${progressPercent}%`;

  // Question Title
  elements.questionTitle.textContent = q.question;
  elements.questionHintText.textContent = q.hint || "Think carefully about standard conventions!";

  // Reset Streak Badge
  elements.streakCounter.textContent = state.quiz.currentStreak;
  if (state.quiz.currentStreak >= 2) {
    elements.streakBadge.classList.add('active');
  } else {
    elements.streakBadge.classList.remove('active');
  }

  // Render question body based on type
  renderQuestionBody(q);

  // Setup Action Button
  if (q.type === 'multi') {
    elements.actionQuizBtn.disabled = true;
    elements.actionQuizBtnText.textContent = "Submit Answer (0 selected)";
    elements.actionQuizBtn.onclick = () => submitMultiAnswer(q);
  } else if (q.type === 'fill') {
    elements.actionQuizBtn.disabled = true;
    elements.actionQuizBtnText.textContent = "Submit Answer";
    elements.actionQuizBtn.onclick = () => submitFillAnswer(q);
  } else {
    // For single and boolean, options trigger immediate evaluation
    elements.actionQuizBtn.disabled = true;
    elements.actionQuizBtnText.textContent = "Select an Option";
    elements.actionQuizBtn.onclick = null;
  }

  // Start Timer if enabled
  startTimer();
}

// Timer Logic
function startTimer() {
  clearInterval(state.quiz.timerInterval);

  if (state.config.timerMode === 'relaxed') {
    elements.timerContainer.style.display = 'none';
    return;
  }

  elements.timerContainer.style.display = 'flex';
  elements.timerContainer.classList.remove('warning');
  state.quiz.timerRemaining = 15;
  updateTimerUI();

  state.quiz.timerInterval = setInterval(() => {
    state.quiz.timerRemaining--;
    updateTimerUI();

    if (state.quiz.timerRemaining <= 0) {
      clearInterval(state.quiz.timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerUI() {
  const total = 15;
  const current = state.quiz.timerRemaining;
  elements.timerSeconds.textContent = current;

  // Circle perimeter = 2 * PI * 18 = 113.1
  const fullPerimeter = 113.1;
  const offset = fullPerimeter - (current / total) * fullPerimeter;
  elements.timerCircleProgress.style.strokeDashoffset = offset;

  if (current <= 5) {
    elements.timerContainer.classList.add('warning');
  } else {
    elements.timerContainer.classList.remove('warning');
  }
}

function handleTimeout() {
  if (state.quiz.hasAnswered) return;
  const q = state.quiz.questions[state.quiz.currentIndex];
  audio.playWrong();

  resolveQuestionResult({
    question: q,
    isCorrect: false,
    userSelection: "⏱️ Time expired",
    speedBonus: 0
  });

  showToast("Time's up for this question!", "⏱️");
}

// Render dynamic inputs based on type
function renderQuestionBody(q) {
  elements.optionsContainer.innerHTML = '';

  if (q.type === 'single') {
    renderSingleChoice(q);
  } else if (q.type === 'multi') {
    renderMultiChoice(q);
  } else if (q.type === 'fill') {
    renderFillInTheBlank(q);
  } else if (q.type === 'boolean') {
    renderTrueFalse(q);
  }
}

// 1. Single Choice Options
function renderSingleChoice(q) {
  const keys = ['A', 'B', 'C', 'D'];
  q.options.forEach((optText, index) => {
    const item = document.createElement('div');
    item.className = 'option-item';
    item.dataset.index = index;
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Option ${keys[index]}: ${optText}`);

    item.innerHTML = `
      <div class="option-item-left">
        <span class="option-key">${keys[index]}</span>
        <span class="option-text">${optText}</span>
      </div>
      <div class="option-status-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;

    item.addEventListener('click', () => {
      if (state.quiz.hasAnswered) return;
      evaluateSingleChoice(q, index);
    });

    elements.optionsContainer.appendChild(item);
  });
}

function evaluateSingleChoice(q, selectedIndex) {
  if (state.quiz.hasAnswered) return;
  clearInterval(state.quiz.timerInterval);

  const isCorrect = (selectedIndex === q.answer);
  const optionItems = elements.optionsContainer.querySelectorAll('.option-item');
  
  optionItems.forEach((item, idx) => {
    item.classList.add('locked');
    if (idx === q.answer) {
      item.classList.add('correct');
    } else if (idx === selectedIndex && !isCorrect) {
      item.classList.add('wrong');
      item.querySelector('.option-status-icon').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
    }
  });

  resolveQuestionResult({
    question: q,
    isCorrect,
    userSelection: q.options[selectedIndex],
    speedBonus: state.config.timerMode === 'timed' ? state.quiz.timerRemaining * 8 : 0
  });
}

// 2. Multi-Select Options
function renderMultiChoice(q) {
  const keys = ['A', 'B', 'C', 'D', 'E'];
  q.options.forEach((optText, index) => {
    const item = document.createElement('div');
    item.className = 'option-item';
    item.dataset.index = index;
    item.tabIndex = 0;
    item.setAttribute('role', 'checkbox');
    item.setAttribute('aria-checked', 'false');

    item.innerHTML = `
      <div class="option-item-left">
        <div class="option-checkbox">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span class="option-key">${keys[index]}</span>
        <span class="option-text">${optText}</span>
      </div>
      <div class="option-status-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;

    item.addEventListener('click', () => {
      if (state.quiz.hasAnswered) return;
      audio.playClick();
      
      if (state.quiz.selectedMultiIndices.has(index)) {
        state.quiz.selectedMultiIndices.delete(index);
        item.classList.remove('selected');
        item.setAttribute('aria-checked', 'false');
      } else {
        state.quiz.selectedMultiIndices.add(index);
        item.classList.add('selected');
        item.setAttribute('aria-checked', 'true');
      }

      const count = state.quiz.selectedMultiIndices.size;
      elements.actionQuizBtn.disabled = count === 0;
      elements.actionQuizBtnText.textContent = `Submit Answer (${count} selected)`;
    });

    elements.optionsContainer.appendChild(item);
  });
}

function submitMultiAnswer(q) {
  if (state.quiz.hasAnswered || state.quiz.selectedMultiIndices.size === 0) return;
  clearInterval(state.quiz.timerInterval);

  const selectedArr = Array.from(state.quiz.selectedMultiIndices).sort();
  const correctArr = [...q.answer].sort();

  const isCorrect = (
    selectedArr.length === correctArr.length &&
    selectedArr.every((val, idx) => val === correctArr[idx])
  );

  const optionItems = elements.optionsContainer.querySelectorAll('.option-item');
  optionItems.forEach((item, idx) => {
    item.classList.add('locked');
    if (correctArr.includes(idx)) {
      item.classList.add('correct');
    } else if (selectedArr.includes(idx)) {
      item.classList.add('wrong');
    }
  });

  const userSelections = selectedArr.map(i => q.options[i]).join(', ');

  resolveQuestionResult({
    question: q,
    isCorrect,
    userSelection: userSelections,
    speedBonus: state.config.timerMode === 'timed' ? state.quiz.timerRemaining * 8 : 0
  });
}

// 3. Fill in the Blank
function renderFillInTheBlank(q) {
  const container = document.createElement('div');
  container.className = 'fill-arena';

  container.innerHTML = `
    <div class="fill-input-wrapper">
      <input type="text" id="fill-text-input" class="fill-input" 
             placeholder="${q.placeholder || 'Type your answer here...'}" 
             autocomplete="off" spellcheck="false" autofocus />
    </div>
  `;

  elements.optionsContainer.appendChild(container);

  const inputEl = container.querySelector('#fill-text-input');
  inputEl.addEventListener('input', () => {
    const val = inputEl.value.trim();
    elements.actionQuizBtn.disabled = val.length === 0;
    elements.actionQuizBtnText.textContent = "Submit Answer";
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && inputEl.value.trim().length > 0 && !state.quiz.hasAnswered) {
      submitFillAnswer(q);
    }
  });
}

function submitFillAnswer(q) {
  if (state.quiz.hasAnswered) return;
  const inputEl = document.getElementById('fill-text-input');
  if (!inputEl) return;

  const rawUserVal = inputEl.value.trim();
  if (!rawUserVal) return;

  clearInterval(state.quiz.timerInterval);

  const cleanUser = rawUserVal.toLowerCase();
  const isCorrect = q.acceptedAnswers.some(ans => ans.toLowerCase() === cleanUser);

  inputEl.disabled = true;
  if (isCorrect) {
    inputEl.classList.add('correct');
  } else {
    inputEl.classList.add('wrong');
  }

  resolveQuestionResult({
    question: q,
    isCorrect,
    userSelection: rawUserVal,
    speedBonus: state.config.timerMode === 'timed' ? state.quiz.timerRemaining * 8 : 0
  });
}

// 4. True / False Choice
function renderTrueFalse(q) {
  const container = document.createElement('div');
  container.className = 'tf-grid';

  container.innerHTML = `
    <div class="tf-card true-card" data-val="true" role="button" tabindex="0">
      <div class="tf-icon-circle">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span class="tf-card-label">True</span>
    </div>
    <div class="tf-card false-card" data-val="false" role="button" tabindex="0">
      <div class="tf-icon-circle">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
      <span class="tf-card-label">False</span>
    </div>
  `;

  const cards = container.querySelectorAll('.tf-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      if (state.quiz.hasAnswered) return;
      const selectedVal = card.dataset.val === 'true';
      evaluateTrueFalse(q, selectedVal, cards);
    });
  });

  elements.optionsContainer.appendChild(container);
}

function evaluateTrueFalse(q, selectedVal, cards) {
  if (state.quiz.hasAnswered) return;
  clearInterval(state.quiz.timerInterval);

  const isCorrect = (selectedVal === q.answer);

  cards.forEach(c => {
    c.classList.add('locked');
    const cVal = c.dataset.val === 'true';
    if (cVal === q.answer) {
      c.classList.add('correct');
    } else if (cVal === selectedVal && !isCorrect) {
      c.classList.add('wrong');
    }
  });

  resolveQuestionResult({
    question: q,
    isCorrect,
    userSelection: selectedVal ? 'True' : 'False',
    speedBonus: state.config.timerMode === 'timed' ? state.quiz.timerRemaining * 8 : 0
  });
}

// Resolve Common Question Result
function resolveQuestionResult({ question, isCorrect, userSelection, speedBonus }) {
  state.quiz.hasAnswered = true;
  clearInterval(state.quiz.timerInterval);

  // Difficulty base points
  const basePoints = { 'easy': 100, 'medium': 150, 'hard': 200 }[question.difficulty] || 100;

  if (isCorrect) {
    state.quiz.correctCount++;
    state.quiz.currentStreak++;
    if (state.quiz.currentStreak > state.quiz.maxStreak) {
      state.quiz.maxStreak = state.quiz.currentStreak;
    }

    // Streak Multiplier
    let multiplier = 1.0;
    if (state.quiz.currentStreak >= 5) multiplier = 2.0;
    else if (state.quiz.currentStreak >= 3) multiplier = 1.5;
    else if (state.quiz.currentStreak >= 2) multiplier = 1.2;

    const earnedPoints = Math.round((basePoints + speedBonus) * multiplier);
    state.quiz.score += earnedPoints;

    if (state.quiz.currentStreak >= 2) {
      audio.playStreak();
      elements.streakBadge.classList.add('active');
    } else {
      audio.playCorrect();
    }
  } else {
    state.quiz.wrongCount++;
    state.quiz.currentStreak = 0;
    elements.streakBadge.classList.remove('active');
    audio.playWrong();
  }

  elements.streakCounter.textContent = state.quiz.currentStreak;

  // Record History for Review
  let correctFormatted = '';
  if (question.type === 'single') {
    correctFormatted = question.options[question.answer];
  } else if (question.type === 'multi') {
    correctFormatted = question.answer.map(i => question.options[i]).join(', ');
  } else if (question.type === 'fill') {
    correctFormatted = question.acceptedAnswers[0];
  } else if (question.type === 'boolean') {
    correctFormatted = question.answer ? 'True' : 'False';
  }

  state.quiz.history.push({
    id: question.id,
    question: question.question,
    type: question.type,
    userSelection,
    correctFormatted,
    isCorrect,
    explanation: question.explanation
  });

  // Display Explanation
  elements.explanationText.textContent = question.explanation;
  elements.explanationBox.style.display = 'block';

  // Transform bottom action button into Next Question
  elements.actionQuizBtn.disabled = false;
  elements.actionQuizBtnText.textContent = (state.quiz.currentIndex === state.quiz.questions.length - 1)
    ? "View Final Results"
    : "Next Question";
  
  elements.actionQuizBtn.onclick = () => {
    audio.playClick();
    goToNextQuestion();
  };
}

function goToNextQuestion() {
  state.quiz.currentIndex++;
  if (state.quiz.currentIndex < state.quiz.questions.length) {
    renderCurrentQuestion();
  } else {
    finishQuiz();
  }
}

// ==================== LIFELINES ====================
elements.lifeline5050.addEventListener('click', () => {
  if (state.quiz.hasAnswered || state.quiz.fiftyFiftyUsed) return;
  const q = state.quiz.questions[state.quiz.currentIndex];
  if (q.type !== 'single') return;

  state.quiz.fiftyFiftyUsed = true;
  elements.lifeline5050.disabled = true;
  audio.playLifeline();

  // Find two wrong indices to eliminate
  const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== q.answer);
  // Shuffle wrong indices and pick first 2
  for (let i = wrongIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
  }
  const toEliminate = wrongIndices.slice(0, 2);

  const optionItems = elements.optionsContainer.querySelectorAll('.option-item');
  toEliminate.forEach(idx => {
    if (optionItems[idx]) {
      optionItems[idx].classList.add('eliminated');
    }
  });

  showToast("✂️ 50:50 Lifeline applied! Two wrong answers eliminated.", "✨");
});

elements.lifelineHint.addEventListener('click', () => {
  if (state.quiz.hintUsed) return;
  state.quiz.hintUsed = true;
  elements.lifelineHint.disabled = true;
  audio.playLifeline();

  elements.questionHintBox.style.display = 'flex';
  showToast("💡 Hint revealed below!", "💡");
});

// Quit confirmation
elements.quitQuizBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to exit? Your current progress will be lost.")) {
    clearInterval(state.quiz.timerInterval);
    audio.playClick();
    showView('setup');
  }
});

// ==================== RESULTS SCREEN ====================
function finishQuiz() {
  clearInterval(state.quiz.timerInterval);
  state.quiz.totalElapsedSeconds = Math.round((Date.now() - state.quiz.startTime) / 1000);

  const totalQuestions = state.quiz.questions.length;
  const accuracyPercent = Math.round((state.quiz.correctCount / totalQuestions) * 100);

  // Update Stats DOM
  elements.statTotalScore.textContent = state.quiz.score.toLocaleString();
  elements.statCorrectCount.textContent = state.quiz.correctCount;
  elements.statWrongCount.textContent = state.quiz.wrongCount;
  elements.statMaxStreak.textContent = `🔥 ${state.quiz.maxStreak}`;
  elements.statTimeTaken.textContent = `${state.quiz.totalElapsedSeconds}s`;

  // Animate Circular Gauge
  elements.resultsPercentVal.textContent = `0%`;
  const fullDash = 440; // 2 * PI * 70 ≈ 439.8
  elements.resultsScoreMeter.style.strokeDashoffset = fullDash;

  showView('results');

  setTimeout(() => {
    const targetOffset = fullDash - (accuracyPercent / 100) * fullDash;
    elements.resultsScoreMeter.style.strokeDashoffset = targetOffset;
    animateCount(elements.resultsPercentVal, 0, accuracyPercent, 1200, '%');
  }, 100);

  // Tier Titles & Badges
  if (accuracyPercent >= 90) {
    elements.performanceTitle.innerHTML = "Coding <span>Grandmaster!</span> 🏆";
    elements.performanceDesc.textContent = "Spectacular mastery! You demonstrated elite comprehension across technical domains.";
    audio.playFanfare();
    launchConfetti();
  } else if (accuracyPercent >= 70) {
    elements.performanceTitle.innerHTML = "Tech <span>Virtuoso!</span> 🚀";
    elements.performanceDesc.textContent = "Impressive score! Your fundamental foundation and technical speed are top tier.";
    audio.playFanfare();
    launchConfetti();
  } else if (accuracyPercent >= 50) {
    elements.performanceTitle.innerHTML = "Rising <span>Developer!</span> 💡";
    elements.performanceDesc.textContent = "Good effort! Review the detailed answers below to lock in the key concepts.";
    audio.playCorrect();
  } else {
    elements.performanceTitle.innerHTML = "Keep <span>Building!</span> 🌱";
    elements.performanceDesc.textContent = "A great learning opportunity! Explore the detailed answer explanations to level up.";
    audio.playWrong();
  }

  // Save to Leaderboard
  saveHighscore({
    category: state.config.category,
    score: state.quiz.score,
    accuracy: accuracyPercent,
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  });
}

function animateCount(elem, start, end, duration, suffix = '') {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    elem.textContent = `${value}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      elem.textContent = `${end}${suffix}`;
    }
  };
  window.requestAnimationFrame(step);
}

// ==================== REVIEW SYSTEM ====================
function renderReview() {
  elements.reviewList.innerHTML = '';

  state.quiz.history.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = `review-item ${item.isCorrect ? 'is-correct' : 'is-wrong'}`;

    card.innerHTML = `
      <div class="review-q-header">
        <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Question ${index + 1}</span>
        <span class="review-badge ${item.isCorrect ? 'correct' : 'wrong'}">
          ${item.isCorrect ? '✅ Correct' : '❌ Incorrect'}
        </span>
      </div>
      <h3 class="review-q-text">${item.question}</h3>
      <div class="review-answers-box">
        <div class="review-line ${item.isCorrect ? 'user-correct' : 'user-wrong'}">
          <strong>Your Answer:</strong>
          <span>${item.userSelection}</span>
        </div>
        ${!item.isCorrect ? `
          <div class="review-line actual">
            <strong>Correct Answer:</strong>
            <span>${item.correctFormatted}</span>
          </div>
        ` : ''}
      </div>
      <p class="review-exp">💡 <strong>Insight:</strong> ${item.explanation}</p>
    `;

    elements.reviewList.appendChild(card);
  });
}

// ==================== LEADERBOARD (LOCALSTORAGE) ====================
function getHighScores() {
  try {
    return JSON.parse(localStorage.getItem('devpulse_quiz_leaderboard')) || [];
  } catch (e) {
    return [];
  }
}

function saveHighscore(newEntry) {
  const list = getHighScores();
  list.push(newEntry);
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, 10);
  localStorage.setItem('devpulse_quiz_leaderboard', JSON.stringify(trimmed));
}

function renderLeaderboardModal() {
  const scores = getHighScores();
  elements.leaderboardList.innerHTML = '';

  if (scores.length === 0) {
    elements.leaderboardList.innerHTML = `
      <div class="empty-leaderboard">
        <p>No scores recorded yet. Play a quiz to make history!</p>
      </div>
    `;
    return;
  }

  scores.forEach((item, idx) => {
    const rank = idx + 1;
    const rankClass = rank === 1 ? 'top-1' : (rank === 2 ? 'top-2' : (rank === 3 ? 'top-3' : ''));
    
    const div = document.createElement('div');
    div.className = 'leaderboard-item';
    div.innerHTML = `
      <span class="leaderboard-rank ${rankClass}">#${rank}</span>
      <div class="leaderboard-meta">
        <div class="leaderboard-cat">${item.category} • ${item.accuracy}% Acc</div>
        <div class="leaderboard-date">${item.date}</div>
      </div>
      <div class="leaderboard-score">${item.score.toLocaleString()} pts</div>
    `;
    elements.leaderboardList.appendChild(div);
  });
}

function openLeaderboard() {
  audio.playClick();
  renderLeaderboardModal();
  elements.leaderboardModal.classList.add('active');
}

function closeLeaderboard() {
  audio.playClick();
  elements.leaderboardModal.classList.remove('active');
}

// ==================== CONFETTI CELEBRATION ENGINE ====================
function launchConfetti() {
  const canvas = elements.confettiCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 120;
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ffffff'];
  const particles = [];

  for (let i = 0; i < confettiCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height * 0.5,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      opacity: 1
    });
  }

  let animationFrame;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height - 50) {
        p.opacity -= 0.02;
      }

      if (p.opacity > 0 && p.y < canvas.height) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  };

  render();
}

// ==================== ACTION LISTENERS ====================
function setupActionListeners() {
  // Results Screen buttons
  elements.reviewAnswersBtn.addEventListener('click', () => {
    audio.playClick();
    renderReview();
    showView('review');
  });

  elements.restartQuizBtn.addEventListener('click', () => {
    audio.playClick();
    startQuiz();
  });

  elements.changeSettingsBtn.addEventListener('click', () => {
    audio.playClick();
    showView('setup');
  });

  elements.shareScoreBtn.addEventListener('click', () => {
    audio.playClick();
    const shareText = `🚀 DevPulse Quiz: I scored ${state.quiz.score.toLocaleString()} pts (${Math.round((state.quiz.correctCount / state.quiz.questions.length) * 100)}% accuracy) with a peak streak of 🔥 ${state.quiz.maxStreak}! Can you beat my score?`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast("Score card copied to clipboard!", "📋");
      }).catch(() => {
        showToast("Score: " + state.quiz.score + " pts", "🎯");
      });
    } else {
      showToast("Score: " + state.quiz.score + " pts", "🎯");
    }
  });

  // Review Screen buttons
  elements.backToResultsBtn.addEventListener('click', () => {
    audio.playClick();
    showView('results');
  });

  elements.reviewPlayAgainBtn.addEventListener('click', () => {
    audio.playClick();
    startQuiz();
  });

  // Leaderboard Modal
  elements.leaderboardBtn.addEventListener('click', openLeaderboard);
  elements.closeLeaderboardBtn.addEventListener('click', closeLeaderboard);
  elements.closeModalFooterBtn.addEventListener('click', closeLeaderboard);

  elements.clearLeaderboardBtn.addEventListener('click', () => {
    if (confirm("Clear all recorded high scores?")) {
      localStorage.removeItem('devpulse_quiz_leaderboard');
      renderLeaderboardModal();
      showToast("Leaderboard cleared", "🗑️");
    }
  });

  elements.leaderboardModal.addEventListener('click', (e) => {
    if (e.target === elements.leaderboardModal) {
      closeLeaderboard();
    }
  });

  window.addEventListener('resize', () => {
    if (elements.confettiCanvas) {
      elements.confettiCanvas.width = window.innerWidth;
      elements.confettiCanvas.height = window.innerHeight;
    }
  });
}

// Keyboard shortcuts (1-4, A-D, Enter)
function setupKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // Ignore when inside input element
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    // Modal close on Escape
    if (e.key === 'Escape' && elements.leaderboardModal.classList.contains('active')) {
      closeLeaderboard();
      return;
    }

    if (!elements.quizView.classList.contains('active')) return;

    const q = state.quiz.questions[state.quiz.currentIndex];
    if (!q) return;

    // Single choice shortcut (1-4 or A-D)
    if (q.type === 'single' && !state.quiz.hasAnswered) {
      const keyMap = {
        '1': 0, 'a': 0, 'A': 0,
        '2': 1, 'b': 1, 'B': 1,
        '3': 2, 'c': 2, 'C': 2,
        '4': 3, 'd': 3, 'D': 3
      };
      if (e.key in keyMap) {
        const idx = keyMap[e.key];
        const optionItems = elements.optionsContainer.querySelectorAll('.option-item');
        if (optionItems[idx]) {
          evaluateSingleChoice(q, idx);
        }
      }
    }

    // True/False shortcut ('t', 'f')
    if (q.type === 'boolean' && !state.quiz.hasAnswered) {
      const cards = elements.optionsContainer.querySelectorAll('.tf-card');
      if ((e.key === 't' || e.key === 'T' || e.key === '1') && cards[0]) {
        evaluateTrueFalse(q, true, cards);
      } else if ((e.key === 'f' || e.key === 'F' || e.key === '2') && cards[1]) {
        evaluateTrueFalse(q, false, cards);
      }
    }

    // Enter to trigger Next question when answered
    if (e.key === 'Enter' && state.quiz.hasAnswered && !elements.actionQuizBtn.disabled) {
      elements.actionQuizBtn.click();
    }
  });
}

// Start application
document.addEventListener('DOMContentLoaded', init);
