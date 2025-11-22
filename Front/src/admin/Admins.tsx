import { useEffect, useMemo, useState } from "react";

const API =
  ((import.meta as any)?.env?.VITE_API_URL as string) || "http://localhost:3000";

type Admin = {
  id: number;
  nome: string;
  email: string;
  nivel?: number | null;
};

export default function Admins() {
  const [lista, setLista] = useState<Admin[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const r = await fetch(`${API}/admin`, {
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const j = await r.json();
      setLista(Array.isArray(j) ? j : []);
    } catch {
      setLista([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrada = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return lista;
    return lista.filter((a) => {
      const nome = (a.nome ?? "").toLowerCase();
      const email = (a.email ?? "").toLowerCase();
      const nivel = String(a.nivel ?? "").toLowerCase();
      return nome.includes(term) || email.includes(term) || nivel.includes(term);
    });
  }, [lista, q]);

  return (
    <div>
      {/* Faixa superior preta com título e ações */}
      <div className="rounded-2xl overflow-hidden ring-1 ring-black/5 bg-black text-emerald-400">
        <div className="px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
          <h2 className="text-3xl font-extrabold">Controle de Admins</h2>
          <div className="flex w-full md:w-auto items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar por nome/e-mail/nível"
              className="flex-1 md:w-80 rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:ring-4 focus:ring-emerald-300"
            />
            <button
              onClick={carregar}
              disabled={loading}
              className="rounded-lg bg-neutral-900 text-emerald-400 px-4 py-2 font-medium hover:bg-neutral-800 focus:ring-4 focus:ring-emerald-300 disabled:opacity-60"
            >
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-black/5 bg-white">
        <table className="min-w-full">
          {/* Cabeçalho preto/verde */}
          <thead className="bg-black text-emerald-400">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">E-mail</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nível</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>

          {/* Sem divide-y para não ter barras entre IDs */}
          <tbody className="text-sm">
            {filtrada.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                {/* ID agora sem fundo preto e sem texto verde */}
                <td className="px-6 py-4 font-semibold text-gray-800">{a.id}</td>
                <td className="px-6 py-4">{a.nome}</td>
                <td className="px-6 py-4">{a.email}</td>
                <td className="px-6 py-4">{a.nivel ?? "—"}</td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-emerald-500/40 bg-black px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-neutral-900 focus:outline-none focus:ring-4 focus:ring-emerald-300"
                    onClick={() => alert("Em breve: editar admin")}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}

            {filtrada.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  Nenhum admin encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
