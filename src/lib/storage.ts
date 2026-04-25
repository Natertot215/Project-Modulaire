import type { SessionState } from "../types";

const PREFIX = "sat:";

export function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function set<T>(key: string, value: T | null | undefined): void {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {
    // ignore quota/permission errors for now
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* noop */
  }
}

export function isValidSessionState(s: unknown): s is SessionState {
  if (!s || typeof s !== "object") return false;
  const v = s as Partial<SessionState>;
  return (
    (v.sessionType === "practice" || v.sessionType === "test") &&
    Array.isArray(v.modules) &&
    v.modules.length > 0 &&
    Array.isArray(v.questions) &&
    Array.isArray(v.questionSkills) &&
    typeof v.currentMod === "number" &&
    typeof v.qIdx === "number" &&
    v.answers != null &&
    typeof v.answers === "object" &&
    v.flags != null &&
    typeof v.flags === "object" &&
    v.crossouts != null &&
    typeof v.crossouts === "object" &&
    v.correctMap != null &&
    typeof v.correctMap === "object" &&
    Object.keys(v.correctMap).length === v.questions.length
  );
}
