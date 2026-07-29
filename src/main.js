/**
 * main.js — App bootstrap
 * Routes to the correct component based on step changes only.
 */

import { subscribe, getState, STEPS } from './state/store.js';
import { renderSetup }        from './components/Setup.js';
import { renderQuestionCard } from './components/QuestionCard.js';
import { renderHistory }      from './components/History.js';
import { renderLoading }      from './components/Loading.js';
import { renderVerdict }      from './components/Verdict.js';

const pane = document.getElementById('main-pane');

function render(state) {
  pane.innerHTML = '';

  switch (state.step) {
    case STEPS.SETUP: {
      renderSetup(pane);
      break;
    }
    case STEPS.QA: {
      const qaEl   = document.createElement('div');
      const histEl = document.createElement('div');
      pane.appendChild(qaEl);
      pane.appendChild(histEl);
      renderQuestionCard(qaEl);
      renderHistory(histEl);
      break;
    }
    case STEPS.LOADING: {
      const loadEl = document.createElement('div');
      pane.appendChild(loadEl);
      renderLoading(loadEl);
      if (state.qaHistory.length) {
        const histEl = document.createElement('div');
        pane.appendChild(histEl);
        renderHistory(histEl);
      }
      break;
    }
    case STEPS.VERDICT: {
      renderVerdict(pane);
      break;
    }
  }
}

// Initial render
render(getState());

// Only re-render when the STEP changes, not on every state update
let prevStep = getState().step;
subscribe(state => {
  if (state.step !== prevStep) {
    prevStep = state.step;
    render(state);
  }
});