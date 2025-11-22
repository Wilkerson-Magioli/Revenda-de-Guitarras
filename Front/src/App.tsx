import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";

import Layout from "./layout";
import Login from "./Login";
import Detalhes from "./detalhes";
import MinhasPropostas from "./MinhasPropostas";

// ---- Admin (área restrita)
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminGuitarras from "./admin/AdminGuitarras";
import AdminClientes from "./admin/AdminClientes";
import AdminPropostas from "./admin/AdminPropostas";
import Admins from "./admin/Admins";
import AdminGuitarraNova from "./admin/AdminGuitarraNova"; // <-- tela de cadastro
import { useAdminStore } from "./admin/context/AdminContext";

// Base da API
const API_BASE: string =
  ((import.meta as any)?.env?.VITE_API_URL as string) || "http://localhost:3000";

type Marca = { id: number; nome: string };
type Guitarra = {
  id: number | string;
  modelo: string;
  preco: string | number;
  foto: string;
  acessorio?: string | null;
  destaque: boolean;
  marca?: Marca | null;
};

function norm(s: string) {
  const hasNormalize = typeof (s as any)?.normalize === "function";
  const base = hasNormalize ? (s as any).normalize("NFD") : s;
  return base.replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Página inicial (lista) */
function Home() {
  const [itens, setItens] = useState<Guitarra[]>([]);
  const [q, setQ] = useState("");
  const [soDestaque, setSoDestaque] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function carregar(term?: string, apenasDestaque?: boolean) {
    try {
      setLoading(true);
      setErr(null);

      const qs = new URLSearchParams();
      if ((term ?? "").trim()) qs.append("search", term!.trim());
      if (apenasDestaque === true) qs.append("destaque", "true");

      const url = `${API_BASE}/guitarras?${qs.toString()}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Falha ao carregar guitarras");

      const data: Guitarra[] = await res.json();
      setItens(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao carregar guitarras");
      setItens([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setSoDestaque(true);
    setQ("");
    carregar("", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePesquisar = () => {
    setSoDestaque(false);
    carregar(q, false);
  };

  const handleExibirDestaques = () => {
    setSoDestaque(true);
    setQ("");
    carregar("", true);
  };

  const handleMostrarTodos = () => {
    setSoDestaque(false);
    setQ("");
    carregar("", false);
  };

  const lista = useMemo(() => {
    let base = itens;

    if (soDestaque) base = base.filter((g) => g.destaque);

    const termo = q.trim();
    if (termo) {
      const nq = norm(termo);
      base = base.filter((g) => {
        const marca = norm(g.marca?.nome ?? "");
        const modelo = norm(g.modelo ?? "");
        const acessorio = norm(g.acessorio ?? "");
        return (
          marca.includes(nq) ||
          modelo.includes(nq) ||
          (acessorio && acessorio.includes(nq))
        );
      });
    }
    return base;
  }, [itens, soDestaque, q]);

  return (
    <div className="bg-neutral-200 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center mb-8">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Informe modelo, marca ou acessório"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-4 focus:ring-emerald-300"
            onKeyDown={(e) => e.key === "Enter" && handlePesquisar()}
          />
          <button
            type="button"
            onClick={handlePesquisar}
            className="px-6 py-3 rounded-xl bg-black text-emerald-400 font-medium hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
          >
            Pesquisar
          </button>
          <button
            type="button"
            onClick={handleExibirDestaques}
            className="px-6 py-3 rounded-xl bg-black text-emerald-400 font-medium hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
          >
            Exibir Destaques
          </button>
          <button
            type="button"
            onClick={handleMostrarTodos}
            className="px-6 py-3 rounded-xl bg-black text-emerald-400 font-medium hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
          >
            Mostrar Todos
          </button>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">
          {soDestaque ? "Guitarras em destaque" : "Guitarras"}
        </h2>

        {err && (
          <div className="mb-6 rounded-lg bg-red-50 text-red-700 px-4 py-3">
            {err}
          </div>
        )}
        {loading && (
          <div className="mb-6 rounded-lg bg-blue-50 text-blue-700 px-4 py-3">
            Carregando...
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((g) => {
            const precoNumber =
              typeof g.preco === "number" ? g.preco : Number(g.preco);
            const precoBRL = precoNumber.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });

            const idNum = Number(g.id);
            const acessorioTxt =
              g.acessorio && g.acessorio.trim().length > 0 ? g.acessorio : "—";

            return (
              <article
                key={idNum}
                className="bg-white rounded-2xl shadow ring-1 ring-black/5 overflow-hidden"
              >
                <div className="w-full h-64 bg-white flex items-center justify-center p-2">
                  <img
                    src={g.foto}
                    alt={g.modelo}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">
                    {g.marca?.nome} {g.modelo}
                  </h3>

                  <p className="text-gray-600">Preço {precoBRL}</p>

                  <p className="text-gray-500">
                    Acessório: <span className="font-medium">{acessorioTxt}</span>
                  </p>

                  <Link
                    to={`/guitarras/${idNum}`}
                    className="mt-3 inline-flex items-center justify-center px-4 py-2 text-sm md:text-base font-medium bg-black text-emerald-400 rounded-lg hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
                  >
                    Detalhes
                    <svg
                      className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                      aria-hidden="true"
                      viewBox="0 0 14 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {!loading && lista.length === 0 && !err && (
          <p className="text-gray-500 mt-6">Nenhuma guitarra encontrada.</p>
        )}
      </div>
    </div>
  );
}

/** Gate com hidratação: só decide depois de ler o localStorage */
function AdminGate() {
  const storeToken = useAdminStore((s) => s.token);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(storeToken ?? null);

  useEffect(() => {
    // garante leitura do localStorage antes da decisão
    const t = storeToken ?? (typeof window !== "undefined" ? localStorage.getItem("admin_token") : null);
    setToken(t);
    setReady(true);
  }, [storeToken]);

  if (!ready) return null; // ou skeleton

  return token ? <AdminLayout /> : <AdminLogin />;
}

export default function App() {
  return (
    <Routes>
      {/* Área pública */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="guitarras/:guitarraId" element={<Detalhes />} />
        <Route path="minhas-propostas" element={<MinhasPropostas />} />
      </Route>

      {/* Área administrativa */}
      <Route path="admin/*" element={<AdminGate />}>
        <Route index element={<AdminDashboard />} />
        <Route path="guitarras" element={<AdminGuitarras />} />
        <Route path="guitarras/novo" element={<AdminGuitarraNova />} />
        <Route path="clientes" element={<AdminClientes />} />
        <Route path="propostas" element={<AdminPropostas />} />
        <Route path="admins" element={<Admins />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
