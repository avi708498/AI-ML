
/**
 * claude.js — AI API interactions (Groq)
 */

const API_KEY = "paste your api here";
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL   = 'llama-3.3-70b-versatile';

function buildSystemPrompt(topic, choices) {
  const choiceList = choices.map((c, i) => `${i + 1}) ${c}`).join(', ');
  return `You are a friendly, concise decision coach. The user is deciding about: "${topic}". Their options are: ${choiceList}.

Your job: ask targeted questions one at a time to understand their priorities, constraints, and preferences. After 4–6 questions, give a clear recommendation.

Respond ONLY with valid JSON in one of two formats:

Format A — a question (use when you need more info):
{
  "type": "question",
  "question": "Short question under 20 words?",
  "options": ["Option A", "Option B", "Option C"],
  "allow_free": true
}
The options array should have 2–4 short, relevant answer choices.

Format B — final verdict (use after 4+ answered questions):
{
  "type": "verdict",
  "winner": "<one of the exact choice names>",
  "headline": "<10-word headline summarizing the recommendation>",
  "explanation": "<3–5 sentences explaining why this fits their answers best>",
  "caveat": "<1 sentence on when another option might be better>"
}

Rules:
- No markdown, preamble, or extra keys — pure JSON only.
- Questions must be specific to their topic and choices, not generic.
- Verdict must reference specific answers the user gave.
- Winner must be one of the exact strings from the choices list.`;
}

function buildUserMessage(qaHistory) {
  if (qaHistory.length === 0) {
    return 'Start with your first question.';
  }

  const history = qaHistory
    .map(({ q, a }) => `Q: ${q}\nA: ${a}`)
    .join('\n\n');

  const isEnoughInfo = qaHistory.length >= 4;

  return `Here are my answers so far:\n\n${history}\n\n${
    isEnoughInfo
      ? 'You now have enough information. Give me the final verdict.'
      : 'Ask your next question, or give the verdict if you have enough info.'
  }`;
}

async function fetchNextStep(topic, choices, qaHistory) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        { role: 'system', content: buildSystemPrompt(topic, choices) },
        { role: 'user',   content: buildUserMessage(qaHistory) },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data  = await response.json();
  const raw   = data.choices?.[0]?.message?.content || '';
  const clean = raw.replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Unexpected response format from AI. Please try again.');
  }

  if (!parsed.type || !['question', 'verdict'].includes(parsed.type)) {
    throw new Error('Invalid response type from AI.');
  }

  return parsed;
}

export { fetchNextStep };