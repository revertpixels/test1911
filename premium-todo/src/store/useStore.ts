import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Priority = "P0" | "P1" | "P2" | "P3";
export type Tag = "bug" | "feature" | "refactor" | "review" | "docs" | "devops";
export type TaskType = "bug" | "feature" | "review" | "deploy" | "research";
export type Status = "todo" | "inprogress" | "inreview" | "done";

export interface Subtask { id: string; text: string; done: boolean; }
export interface Task {
  id: string;
  text: string;
  done: boolean;
  priority: Priority;
  tags: Tag[];
  type: TaskType;
  status: Status;
  due?: string;
  estimate?: number;
  url?: string;
  notes?: string;
  subtasks: Subtask[];
  createdAt: number;
}

interface State {
  tasks: Task[];
  theme: "dark" | "light";
  add: (t: Partial<Task> & { text: string }) => void;
  update: (id: string, patch: Partial<Task>) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  reorder: (ids: string[]) => void;
  toggleTheme: () => void;
  importTasks: (tasks: Task[]) => void;
  exportTasks: () => Task[];
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      tasks: [],
      theme: "dark",
      add: (t) => set((s) => ({
        tasks: [...s.tasks, {
          id: crypto.randomUUID(),
          text: t.text,
          done: false,
          priority: t.priority ?? "P2",
          tags: t.tags ?? [],
          type: t.type ?? "feature",
          status: t.status ?? "todo",
          due: t.due,
          estimate: t.estimate,
          url: t.url,
          notes: t.notes,
          subtasks: t.subtasks ?? [],
          createdAt: Date.now(),
        }],
      })),
      update: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t) })),
      remove: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      toggle: (id) => set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, done: !t.done, status: !t.done ? "done" : "todo" } : t) })),
      reorder: (ids) => set((s) => {
        const map = new Map(s.tasks.map((t) => [t.id, t]));
        return { tasks: ids.map((id) => map.get(id)!).filter(Boolean) };
      }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      importTasks: (tasks) => set({ tasks }),
      exportTasks: () => get().tasks,
    }),
    { name: "premium-todo" }
  )
);
