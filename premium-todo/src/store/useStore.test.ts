import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "../store/useStore";

describe("store", () => {
  beforeEach(() => useStore.setState({ tasks: [], theme: "dark" }));
  it("adds task", () => {
    useStore.getState().add({ text: "Fix bug" });
    expect(useStore.getState().tasks).toHaveLength(1);
    expect(useStore.getState().tasks[0].text).toBe("Fix bug");
  });
  it("toggles done", () => {
    useStore.getState().add({ text: "x" });
    const id = useStore.getState().tasks[0].id;
    useStore.getState().toggle(id);
    expect(useStore.getState().tasks[0].done).toBe(true);
  });
  it("removes", () => {
    useStore.getState().add({ text: "x" });
    const id = useStore.getState().tasks[0].id;
    useStore.getState().remove(id);
    expect(useStore.getState().tasks).toHaveLength(0);
  });
  it("reorders", () => {
    useStore.getState().add({ text: "a" });
    useStore.getState().add({ text: "b" });
    const ids = useStore.getState().tasks.map((t) => t.id).reverse();
    useStore.getState().reorder(ids);
    expect(useStore.getState().tasks[0].text).toBe("b");
  });
  it("export/import", () => {
    useStore.getState().add({ text: "z" });
    const data = useStore.getState().exportTasks();
    useStore.setState({ tasks: [] });
    useStore.getState().importTasks(data);
    expect(useStore.getState().tasks).toHaveLength(1);
  });
});
