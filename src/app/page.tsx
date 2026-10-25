"use client";

import { useEffect, useState } from "react";

type Todo = { id: number; text: string; done: boolean };

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    fetch("/api/todos").then((r) => r.json()).then(setTodos);
  }, []);

  async function addTodo() {
    const text = input.trim();
    if (!text) return;
    const res = await fetch("/api/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    const todo = await res.json();
    setTodos((t) => [...t, todo]);
    setInput("");
  }

  async function toggle(t: Todo) {
    const res = await fetch("/api/todos", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, done: !t.done }) });
    const updated = await res.json();
    setTodos((list) => list.map((x) => (x.id === t.id ? updated : x)));
  }

  async function remove(id: number) {
    await fetch("/api/todos", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setTodos((list) => list.filter((x) => x.id !== id));
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4 text-black dark:text-white">Dev Todo</h1>
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-black dark:text-white"
          />
          <button onClick={addTodo} className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {todos.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
              <span className={t.done ? "line-through text-zinc-400" : "text-black dark:text-white"}>{t.text}</span>
              <button onClick={() => remove(t.id)} className="ml-auto text-red-500">?</button>
            </li>
          ))}
        </ul>
        {todos.length === 0 && <p className="text-zinc-400 text-sm mt-4">No tasks yet.</p>}
      </div>
    </main>
  );
}
