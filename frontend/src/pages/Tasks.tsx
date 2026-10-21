import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getUser, request } from "../api";
import type { Task, TaskStatus } from "../types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "A fazer",
  DOING: "Fazendo",
  DONE: "Feito",
};

function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : "Erro inesperado";
}

export default function Tasks() {
  const navigate = useNavigate();
  const user = getUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request<Task[]>("/tasks")
      .then(setTasks)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError("");

    try {
      const task = await request<Task>("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description.trim() || undefined,
        }),
      });
      setTasks((prev) => [task, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleStatus(id: number, status: TaskStatus) {
    setError("");
    try {
      const updated = await request<Task>(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleDelete(id: number) {
    setError("");
    try {
      await request<void>(`/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow">
        <div className="max-w-2xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-slate-800">Minhas tarefas</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">Olá, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl shadow p-4 space-y-3"
        >
          <input
            type="text"
            required
            placeholder="Título da tarefa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700"
          >
            Adicionar tarefa
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded p-2">{error}</p>
        )}

        {loading ? (
          <p className="text-slate-500">Carregando...</p>
        ) : tasks.length === 0 ? (
          <p className="text-slate-500">
            Nenhuma tarefa ainda. Crie a primeira acima.
          </p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="bg-white rounded-xl shadow p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p
                    className={`font-medium ${
                      task.status === "DONE"
                        ? "line-through text-slate-400"
                        : "text-slate-800"
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-slate-500">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatus(task.id, e.target.value as TaskStatus)
                    }
                    className="rounded border border-slate-300 px-2 py-1 text-sm"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}