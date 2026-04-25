import { create } from "zustand";
import { persist } from "zustand/middleware";
import { makeConceptId } from "@/lib/conceptId";

export type QuizQuestion =
  | { type: "fill_blank"; prompt: string; answer: string; explanation?: string }
  | { type: "mcq"; prompt: string; options: string[]; correctIndex: number; explanation?: string };

export interface Quiz {
  questions: QuizQuestion[];
  createdAt: number;
}

export interface LearningEntry {
  id: string;
  conceptId: string;
  createdAt: number;
  title: string;
  summary: string;
  keyConcepts: string[];
  actionTasks: { text: string; done: boolean }[];
  skills: string[];
  careerRoles: string[];
  resumeBullet: string;
  nextStep: string;
  readinessDelta: number;
  sourcePreview: string;
  quiz?: Quiz;
  quizBestScore?: number;
  quizAttempts?: number;
  quizPassed?: boolean;
}

export interface LearnerProfile {
  name: string;
  stage: "High school" | "Undergrad" | "Postgrad" | "Working pro";
  targetCareer: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  interests: string[];
}

interface State {
  entries: LearningEntry[];
  readiness: number;
  profile: LearnerProfile | null;
  hasOnboarded: boolean;
  setProfile: (p: LearnerProfile) => void;
  addEntry: (e: Omit<LearningEntry, "id" | "createdAt" | "conceptId">) => LearningEntry;
  toggleTask: (entryId: string, idx: number) => void;
  attachQuiz: (entryId: string, quiz: Quiz) => void;
  recordQuizScore: (entryId: string, scorePct: number) => { firstPass: boolean };
  reset: () => void;
}

export const useLearningStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],
      readiness: 12,
      profile: null,
      hasOnboarded: false,
      setProfile: (p) => set({ profile: p, hasOnboarded: true }),
      addEntry: (e) => {
        const entry: LearningEntry = {
          ...e,
          id: crypto.randomUUID(),
          conceptId: makeConceptId(e.title),
          createdAt: Date.now(),
        };
        set({
          entries: [entry, ...get().entries],
          readiness: Math.min(100, get().readiness + (e.readinessDelta || 3)),
        });
        return entry;
      },
      toggleTask: (entryId, idx) =>
        set({
          entries: get().entries.map((en) =>
            en.id === entryId
              ? {
                  ...en,
                  actionTasks: en.actionTasks.map((t, i) =>
                    i === idx ? { ...t, done: !t.done } : t
                  ),
                }
              : en
          ),
        }),
      attachQuiz: (entryId, quiz) =>
        set({
          entries: get().entries.map((en) =>
            en.id === entryId ? { ...en, quiz } : en
          ),
        }),
      recordQuizScore: (entryId, scorePct) => {
        const en = get().entries.find((x) => x.id === entryId);
        if (!en) return { firstPass: false };
        const prevBest = en.quizBestScore ?? 0;
        const passedNow = scorePct >= 70;
        const firstPass = passedNow && !en.quizPassed;
        set({
          entries: get().entries.map((x) =>
            x.id === entryId
              ? {
                  ...x,
                  quizAttempts: (x.quizAttempts || 0) + 1,
                  quizBestScore: Math.max(prevBest, scorePct),
                  quizPassed: x.quizPassed || passedNow,
                }
              : x
          ),
          readiness: firstPass ? Math.min(100, get().readiness + 5) : get().readiness,
        });
        return { firstPass };
      },
      reset: () => set({ entries: [], readiness: 12, profile: null, hasOnboarded: false }),
    }),
    { name: "abs-careeros" }
  )
);

export const allSkills = (entries: LearningEntry[]) => {
  const map = new Map<string, number>();
  entries.forEach((e) => e.skills.forEach((s) => map.set(s, (map.get(s) || 0) + 1)));
  return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
};

export const allRoles = (entries: LearningEntry[]) => {
  const map = new Map<string, number>();
  entries.forEach((e) => e.careerRoles.forEach((r) => map.set(r, (map.get(r) || 0) + 1)));
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};
