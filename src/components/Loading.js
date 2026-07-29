/**
 * Loading.js — Thinking animation shown between API calls
 */

import { getState } from '../state/store.js';

export function renderLoading(container) {
  const { loadingMessage } = getState();

  container.innerHTML = `
    <div class="card fade-in">
      <div class="thinking-dots">
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <span class="thinking-label">${loadingMessage}</span>
      </div>
    </div>
  `;
}