/**
 * store.js — Central application state
 * Single source of truth. All components read from and write to this.
 */

const STEPS = {
  SETUP: 'setup',
  QA: 'qa',
  LOADING: 'loading',
  VERDICT: 'verdict',
};

const state = {
  step: STEPS.SETUP,
  topic: '',
  choices: [],
  qaHistory: [],       // [{ q: string, a: string }]
  currentQuestion: null, // { question, options, allow_free }
  questionCount: 0,
  verdict: null,       // { winner, headline, explanation, caveat }
  loadingMessage: 'Thinking…',
  error: null,
};

const listeners = new Set();

function getState() {
  return { ...state };
}

function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach(fn => fn({ ...state }));
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn); // returns unsubscribe
}

function reset() {
  setState({
    step: STEPS.SETUP,
    topic: '',
    choices: [],
    qaHistory: [],
    currentQuestion: null,
    questionCount: 0,
    verdict: null,
    loadingMessage: 'Thinking…',
    error: null,
  });
}

export { STEPS, getState, setState, subscribe, reset };