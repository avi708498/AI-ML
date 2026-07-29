/**
 * Verdict.js — Final recommendation card
 */

import { getState, reset } from '../state/store.js';

export function renderVerdict(container) {
  const { verdict, topic, choices, qaHistory } = getState();
  const { winner, headline, explanation, caveat } = verdict;

  container.innerHTML = `
    <div class="card card-accent slide-up">
      <div class="badge badge-success">Recommendation</div>
      <div class="verdict-winner">${winner}</div>
      <div class="verdict-headline">${headline}</div>
      <div class="divider"></div>
      <div class="verdict-body">${explanation}</div>
      ${caveat ? `<div class="verdict-caveat">💡 ${caveat}</div>` : ''}
      <div class="action-row">
        <button class="btn" id="restart-btn">↩ Start over</button>
        <button class="btn" id="followup-btn">Ask a follow-up ↗</button>
      </div>
    </div>

    <div class="card card-muted fade-in">
      <span class="field-label" style="margin-bottom: 10px;">Your full Q&A</span>
      <div class="qa-history-list">
        ${qaHistory.map(({ q, a }) => `
          <div class="qa-item">
            <div class="qa-q">${q}</div>
            <div class="qa-a">${a}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#restart-btn').addEventListener('click', () => {
    reset();
  });

  container.querySelector('#followup-btn').addEventListener('click', () => {
    const summary =
      `Topic: ${topic}\n` +
      `Choices: ${choices.join(', ')}\n\n` +
      `Q&A:\n${qaHistory.map(({ q, a }) => `Q: ${q}\nA: ${a}`).join('\n')}\n\n` +
      `Recommendation: ${winner} — ${headline}\n\n` +
      `I have a follow-up question about this recommendation.`;

    if (typeof sendPrompt === 'function') {
      sendPrompt(summary);
    } else {
      alert('Follow-up: paste the above into the chat.');
    }
  });
}