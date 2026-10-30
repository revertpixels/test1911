import { useEffect, useState, useMemo } from "react";
import { useStore } from "./store/useStore";
import type { Priority, Status } from "./store/useStore";
import { Plus, Search, Sun, Moon, Command, Download, Upload, Check, Trash2, Edit3 } from "lucide-react";

const PRIORITY_COLOR: Record<Priority, string> = { P0: "text-red-400", P1: "text-orange-400", P2: "text-blue-400", P3: "text-zinc-400" };

export default function App() {
  const { tasks, theme, add, update, remove, toggle, toggleTheme, importTasks, exportTasks } = useStore();
  const [view, setView] = useState<"inbox" | "today" | "upcoming" | "completed" | "kanban">("inbox");
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [newText, setNewText] = useState("");

  useEffect(() => { document.documentElement.classList.toggle("light", theme === "light"); }, [theme]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPaletteOpen((p) => !p); }
      if (e.key === "n" && !paletteOpen) { document.getElementById("new-task")?.focus(); }
      if (e.key === "/") { e.preventDefault(); document.getElementById("search")?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [paletteOpen]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (view === "completed") list = list.filter((t) => t.done);
    else if (view === "today") list = list.filter((t) => t.due && new Date(t.due).toDateString() === new Date().toDateString());
    else if (view === "upcoming") list = list.filter((t) => t.due && new Date(t.due) > new Date());
    if (query) list = list.filter((t) => t.text.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [tasks, view, query]);

  function handleAdd() {
    if (!newText.trim()) return;
    add({ text: newText.trim() });
    setNewText("");
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportTasks(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "todos.json"; a.click();
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { importTasks(JSON.parse(r.result as string)); } catch {} };
    r.readAsText(f);
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 border-r border-[var(--border)] p-4 flex flex-col gap-2">
        <div className="font-bold text-lg mb-4">DevTodo</div>
        {(["inbox", "today", "upcoming", "completed", "kanban"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`text-left px-3 py-2 rounded-lg hover:bg-[var(--bg-elev)] ${view === v ? "bg-[var(--bg-elev)]" : ""}`}>{v}</button>
        ))}
        <div className="mt-auto flex gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-[var(--bg-elev)]">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button onClick={() => setPaletteOpen(true)} className="p-2 rounded-lg hover:bg-[var(--bg-elev)]"><Command size={16} /></button>
        </div>
      </aside>
      <main className="flex-1 p-6 max-w-3xl">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-3 text-[var(--muted)]" />
            <input id="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]" />
          </div>
          <button onClick={handleExport} className="p-2 rounded-lg border border-[var(--border)]"><Download size={16} /></button>
          <label className="p-2 rounded-lg border border-[var(--border)] cursor-pointer"><Upload size={16} /><input type="file" accept="application/json" hidden onChange={handleImport} /></label>
        </div>
        <div className="flex gap-2 mb-4">
          <input id="new-task" value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="New task (N)" className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]" />
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black"><Plus size={16} /></button>
        </div>
        {view === "kanban" ? (
          <div className="grid grid-cols-4 gap-3">
            {(["todo", "inprogress", "inreview", "done"] as Status[]).map((s) => (
              <div key={s} className="bg-[var(--bg-elev)] rounded-lg p-3">
                <div className="font-semibold mb-2 capitalize">{s}</div>
                {tasks.filter((t) => t.status === s).map((t) => (
                  <div key={t.id} className="mb-2 p-2 rounded border border-[var(--border)]">{t.text}</div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-elev)]">
                <button onClick={() => toggle(t.id)} className={t.done ? "text-green-400" : "text-[var(--muted)]"}><Check size={16} /></button>
                <span className={t.done ? "line-through text-[var(--muted)]" : ""}>{t.text}</span>
                <span className={`ml-auto text-xs ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                <button onClick={() => update(t.id, { text: prompt("Edit", t.text) || t.text })} className="text-[var(--muted)]"><Edit3 size={14} /></button>
                <button onClick={() => remove(t.id)} className="text-red-400"><Trash2 size={14} /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6 text-sm text-[var(--muted)]">Completed: {tasks.filter((t) => t.done).length} | Total: {tasks.length}</div>
      </main>
      {paletteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24" onClick={() => setPaletteOpen(false)}>
          <div className="bg-[var(--bg-elev)] border border-[var(--border)] rounded-xl p-4 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm text-[var(--muted)] mb-2">Command Palette</div>
            <button className="block w-full text-left px-3 py-2 hover:bg-[var(--bg)] rounded" onClick={() => { toggleTheme(); setPaletteOpen(false); }}>Toggle theme</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-[var(--bg)] rounded" onClick={() => { setView("kanban"); setPaletteOpen(false); }}>Kanban view</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-[var(--bg)] rounded" onClick={() => { handleExport(); setPaletteOpen(false); }}>Export JSON</button>
          </div>
        </div>
      )}
    </div>
  );
}
