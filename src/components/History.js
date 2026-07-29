/**
 * History.js — Shows Q&A answers collected so far
 */

import { getState } from '../state/store.js';

export function renderHistory(container) {
  const { qaHistory } = getState();

  if (!qaHistory.length) {
    container.innerHTML = `
      <div class="card card-muted fade-in">
        <span class="field-label" style="margin-bottom: 0;">Answers so far</span>
        <p class="empty-hint" style="margin-top: 4px;">Your answers will appear here as you go.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card card-muted fade-in">
      <span class="field-label" style="margin-bottom: 10px;">Answers so far</span>
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
}