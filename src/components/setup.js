/**
 * Setup.js — Step 1: Topic input + choices manager
 */

import { getState, setState, STEPS } from '../state/store.js';
import { fetchNextStep } from '../api/claude.js';

export function renderSetup(container) {
  container.innerHTML = `
    <div class="card fade-in" id="setup-card">
      <h2 style="margin-bottom: 4px;">What are you deciding?</h2>
      <p style="margin-bottom: 1.25rem;">Describe your topic and add your choices — I'll ask the right questions to guide you.</p>

      <label class="field-label" for="topic-input">Topic or context</label>
      <textarea
        id="topic-input"
        rows="2"
        placeholder="e.g. Choosing a career path, picking a smartphone, deciding where to live…"
      ></textarea>

      <label class="field-label" for="choice-input" style="margin-top: 1rem;">Your choices <span style="color: var(--color-text-hint); font-size: 12px;">(add at least 2)</span></label>
      <div class="choices-grid" id="choices-grid"></div>
      <div class="row">
        <input
          type="text"
          id="choice-input"
          placeholder="Type a choice and press Enter or Add"
          autocomplete="off"
        />
        <button type="button" class="btn btn-sm" id="add-btn">+ Add</button>
      </div>

      <p class="error-text" id="setup-error"></p>

      <div class="action-row" style="margin-top: 1.25rem;">
        <button type="button" class="btn btn-primary" id="start-btn">Start ↗</button>
      </div>
    </div>
  `;

  const topicEl  = container.querySelector('#topic-input');
  const choiceEl = container.querySelector('#choice-input');
  const addBtn   = container.querySelector('#add-btn');
  const startBtn = container.querySelector('#start-btn');
  const errorEl  = container.querySelector('#setup-error');
  const gridEl   = container.querySelector('#choices-grid');

  // Restore state
  const { topic, choices } = getState();
  topicEl.value = topic;
  renderChoices(choices, gridEl);

  // Keep topic in sync with state as user types
  topicEl.addEventListener('input', () => {
    setState({ topic: topicEl.value });
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  }

  function clearError() {
    errorEl.style.display = 'none';
  }

  function addChoice() {
    const val = choiceEl.value.trim();
    if (!val) return;
    const { choices } = getState();
    if (choices.includes(val)) {
      showError(`"${val}" is already in your list.`);
      return;
    }
    setState({ choices: [...choices, val] });
    choiceEl.value = '';
    clearError();
    renderChoices(getState().choices, gridEl);
  }

  addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    addChoice();
  });

  choiceEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addChoice(); }
  });

  startBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const topic = topicEl.value.trim();
    const { choices } = getState();

    if (!topic) { showError('Please describe your decision topic.'); return; }
    if (choices.length < 2) { showError('Add at least 2 choices.'); return; }
    clearError();

    // Disable button to prevent double-click
    startBtn.disabled = true;
    startBtn.textContent = 'Loading…';

    // Save topic then move to loading in one go
    setState({
      topic,
      loadingMessage: 'Generating your first question…',
      step: STEPS.LOADING,
    });

    try {
      const result = await fetchNextStep(topic, choices, []);
      if (result.type === 'question') {
        setState({ currentQuestion: result, questionCount: 1, step: STEPS.QA });
      } else if (result.type === 'verdict') {
        setState({ verdict: result, step: STEPS.VERDICT });
      }
    } catch (err) {
      setState({ step: STEPS.SETUP });
      // Re-render setup with error shown
      renderSetup(container);
      container.querySelector('#setup-error').textContent = err.message;
      container.querySelector('#setup-error').style.display = 'block';
    }
  });
}

function renderChoices(choices, gridEl) {
  if (!choices.length) {
    gridEl.innerHTML = '<span class="empty-hint">No choices added yet.</span>';
    return;
  }
  gridEl.innerHTML = choices.map((c, i) => `
    <div class="choice-pill">
      <span>${c}</span>
      <button type="button" class="pill-remove" data-index="${i}" title="Remove" aria-label="Remove ${c}">×</button>
    </div>
  `).join('');

  gridEl.querySelectorAll('.pill-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(btn.dataset.index);
      const { choices } = getState();
      setState({ choices: choices.filter((_, i) => i !== idx) });
      renderChoices(getState().choices, gridEl);
    });
  });
}