/**
 * QuestionCard.js — Renders the current question + answer options
 */

import { getState, setState, STEPS } from '../state/store.js';
import { fetchNextStep } from '../api/claude.js';

const MAX_QUESTIONS = 6;

export function renderQuestionCard(container) {
  const { currentQuestion, questionCount, topic, choices, qaHistory } = getState();
  const { question, options = [], allow_free } = currentQuestion;
  const progress = Math.min((questionCount / MAX_QUESTIONS) * 100, 90);

  container.innerHTML = `
    <div class="card fade-in">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="badge">Question ${questionCount}</div>
      <h3 id="question-text" style="font-size: 16px; line-height: 1.5; margin-bottom: 8px;">${question}</h3>

      <div class="answer-options" id="answer-options">
        ${options.map((opt, i) => `
          <button class="answer-btn" data-index="${i}">${opt}</button>
        `).join('')}
      </div>

      ${allow_free !== false ? `
        <div class="row free-ans-row" style="margin-top: 8px;">
          <input
            type="text"
            id="free-answer"
            placeholder="Or type your own answer…"
            autocomplete="off"
          />
          <button class="btn btn-sm btn-primary" id="next-btn">Next →</button>
        </div>
      ` : `
        <div style="margin-top: 8px;">
          <button class="btn btn-sm btn-primary" id="next-btn" disabled>Select an option above</button>
        </div>
      `}

      <p class="error-text" id="qa-error">Please select or type an answer first.</p>
    </div>
  `;

  const optionBtns  = container.querySelectorAll('.answer-btn');
  const freeInput   = container.querySelector('#free-answer');
  const nextBtn     = container.querySelector('#next-btn');
  const errorEl     = container.querySelector('#qa-error');

  let selectedOpt = null;

  optionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      optionBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedOpt = btn.textContent;
      if (freeInput) freeInput.value = '';
      errorEl.style.display = 'none';
      if (nextBtn.disabled) nextBtn.disabled = false;
    });
  });

  if (freeInput) {
    freeInput.addEventListener('input', () => {
      if (freeInput.value.trim()) {
        optionBtns.forEach(b => b.classList.remove('selected'));
        selectedOpt = null;
      }
    });
    freeInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitAnswer();
    });
  }

  nextBtn.addEventListener('click', submitAnswer);

  async function submitAnswer() {
    const answer = selectedOpt || (freeInput?.value.trim() ?? '');
    if (!answer) {
      errorEl.style.display = 'block';
      return;
    }

    const newHistory = [...qaHistory, { q: question, a: answer }];
    const isLast = newHistory.length >= MAX_QUESTIONS;

    setState({
      qaHistory: newHistory,
      loadingMessage: isLast ? 'Analyzing your answers…' : 'Thinking of the next question…',
      step: STEPS.LOADING,
    });

    try {
      const result = await fetchNextStep(topic, choices, newHistory);
      if (result.type === 'verdict') {
        setState({ verdict: result, step: STEPS.VERDICT });
      } else {
        setState({
          currentQuestion: result,
          questionCount: questionCount + 1,
          step: STEPS.QA,
        });
      }
    } catch (err) {
      setState({ step: STEPS.QA, error: err.message });
      errorEl.textContent = err.message;
      errorEl.style.display = 'block';
    }
  }
}