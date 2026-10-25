"use client";

import { useEffect, useState } from "react";

type Todo = { id: number; text: string; done: boolean };

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  function addTodo() {
    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setInput("");
  }

  function toggle(id: number) {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: number) {
    setTodos(todos.filter((t) => t.id !== id));
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
          <button
            onClick={addTodo}
            className="px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {todos.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span className={t.done ? "line-through text-zinc-400" : "text-black dark:text-white"}>
                {t.text}
              </span>
              <button onClick={() => remove(t.id)} className="ml-auto text-red-500">
                ?
              </button>
            </li>
          ))}
        </ul>
        {todos.length === 0 && (
          <p className="text-zinc-400 text-sm mt-4">No tasks yet.</p>
        )}
      </div>
    </main>
  );
}
