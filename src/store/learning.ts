import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LearningEntry {
  id: string;
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
}

interface State {
  entries: LearningEntry[];
  readiness: number;
  addEntry: (e: Omit<LearningEntry, "id" | "createdAt">) => LearningEntry;
  toggleTask: (entryId: string, idx: number) => void;
  reset: () => void;
}

export const useLearningStore = create<State>()(
  persist(
    (set, get) => ({
      entries: [],
      readiness: 12,
      addEntry: (e) => {
        const entry: LearningEntry = {
          ...e,
          id: crypto.randomUUID(),
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
      reset: () => set({ entries: [], readiness: 12 }),
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
