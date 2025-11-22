import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../utils/api";
import { useAdminStore } from "./context/AdminContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const logaAdmin = useAdminStore((s) => s.logaAdmin);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);

      const { admin, token } = await api.post<{ admin: any; token: string }>(
        "/admin/login",
        { email, senha }
      );

      // salva token e admin (store já persiste em localStorage)
      localStorage.setItem("admin_token", token);
      logaAdmin(admin, token);

      toast.success("Login de admin realizado!");
      navigate("/admin", { replace: true }); // força entrar no grupo /admin/*
    } catch (err: any) {
      toast.error(err?.message ?? "Falha no login do admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-lg">
        <div className="text-center mb-4">
          <div className="text-4xl">🎸</div>
          <div className="text-sm text-gray-500 mt-1">Revenda de Guitarras</div>
        </div>
        <h1 className="text-2xl font-extrabold text-center mb-6">
          Admin: Revenda de Guitarras
        </h1>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm">E-mail:</span>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm">Senha:</span>
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>
          <button
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-black text-emerald-400 py-2 hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
