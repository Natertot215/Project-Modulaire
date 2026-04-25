// Stub API layer. Replace `generateCorrectAnswers` with a real Anthropic-powered
// call when the API integration is wired. All call sites that need correct
// answers or question content should go through this module so the swap is
// isolated.

import type { CorrectMap } from "../types";

export interface GeneratedQuestion {
  id: number;
  prompt: string;
  passage?: string;
  choices: string[];
  correctChoice: number;
  skill: string;
  explanation: string;
}

/**
 * Build a correctMap for `count` questions. Today: random per question.
 * Later: pulled from Anthropic-generated content.
 */
export function generateCorrectAnswers(count: number): CorrectMap {
  const map: CorrectMap = {};
  for (let i = 0; i < count; i++) {
    map[i] = Math.floor(Math.random() * 4);
  }
  return map;
}

/**
 * Placeholder: returns synthesized question content for an index.
 * Swap for real API data when available.
 */
export function getQuestionContent(_qIndex: number): Omit<GeneratedQuestion, "id" | "correctChoice" | "skill"> {
  return {
    prompt: "Question text will appear here",
    passage: "Generated passage content. Select text while the highlight tool is active to mark important sections for reference.",
    choices: ["Answer placeholder", "Answer placeholder", "Answer placeholder", "Answer placeholder"],
    explanation: "Explanation placeholder — AI-generated reasoning will appear here.",
  };
}
