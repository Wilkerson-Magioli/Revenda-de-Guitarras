// src/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./utils/api";
import { useClienteStore } from "./context/ClienteContext";
import { toast } from "sonner";

export default function Login() {
  const [modo, setModo] = useState<"login" | "register">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setAuth = useClienteStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (modo === "register") {
        const { cliente, token } = await api.post<{ cliente: any; token: string }>(
          "/auth/register",
          { nome, email, telefone: telefone || undefined, senha }
        );
        setAuth(cliente, token);
        toast.success("Cadastro realizado!");
        navigate("/", { replace: true });
      } else {
        const { cliente, token } = await api.post<{ cliente: any; token: string }>(
          "/auth/login",
          { email, senha }
        );
        setAuth(cliente, token);
        toast.success("Login realizado!");
        navigate("/", { replace: true });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Falha");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="max-w-xl mx-auto mt-10 bg-white rounded-xl p-6 shadow">
      <h2 className="text-2xl font-bold mb-4">
        {modo === "login" ? "Dados de Acesso do Cliente" : "Crie sua conta"}
      </h2>

      <form className="space-y-3" onSubmit={onSubmit}>
        {modo === "register" && (
          <>
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Telefone (opcional)"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </>
        )}

        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Seu e-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 rounded-xl bg-black text-emerald-400 font-medium border border-emerald-500/40 hover:bg-neutral-900 transition focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-60"
        >
          {submitting
            ? (modo === "login" ? "Entrando..." : "Cadastrando...")
            : (modo === "login" ? "Entrar" : "Cadastrar")}
        </button>
      </form>

      <div className="text-sm mt-4">
        {modo === "login" ? (
          <>
            Ainda não possui conta?{" "}
            <button className="underline" onClick={() => setModo("register")}>
              Cadastre-se
            </button>
          </>
        ) : (
          <>
            Já possui conta?{" "}
            <button className="underline" onClick={() => setModo("login")}>
              Fazer login
            </button>
          </>
        )}
      </div>
    </section>
  );
}
