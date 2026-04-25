export type Section = "rw" | "math" | "mixed";
export type SessionType = "practice" | "test";
export type Phase = "questions" | "break" | "results" | "review";

export type Skill = string;

export type Difficulty = "easy" | "med" | "hard";
export type DifficultyChoice = Difficulty | "mixed";

export interface Module {
  label: string;
  sec: Section;
  count: number;
  start: number;
}

export interface Question {
  id: number;
}

export type AnswerMap = Record<number, number | null>;
export type FlagMap = Record<number, boolean>;
export type CrossoutMap = Record<string, boolean>;
export type CorrectMap = Record<number, number>;

export interface ReviewResult {
  answered: boolean;
  correct: boolean;
  picked: number | null | undefined;
  correctChoice: number;
  skill: Skill;
  isRW: boolean;
}

export interface SessionState {
  sessionType: SessionType;
  modules: Module[];
  questions: Question[];
  questionSkills: Skill[];
  correctMap: CorrectMap;
  currentMod: number;
  qIdx: number;
  answers: AnswerMap;
  flags: FlagMap;
  crossouts: CrossoutMap;
}

export type SessionInit =
  | { resume: SessionState }
  | { type: SessionType; n: number; skills: Skill[] };

export interface HistoryEntry {
  id: number;
  date: string;
  type: string;
  skills: Skill[];
  correct: number;
  total: number;
  attempted: number;
  breakdown: boolean[];
  flagged: FlagMap;
  reviewData: ReviewResult[];
}
