import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request, saveSession } from "../api";
import type { User } from "../types";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await request<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(data.token, data.user);
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-slate-800">Criar conta</h1>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 rounded p-2">{error}</p>
        )}

        <label className="block text-sm text-slate-700">
          Nome
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Senha (mínimo 6 caracteres)
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>

        <p className="text-sm text-slate-600 text-center">
          Já tem conta?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}