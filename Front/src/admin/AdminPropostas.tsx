import { useEffect, useMemo, useState } from "react";

const API =
  ((import.meta as any)?.env?.VITE_API_URL as string) || "http://localhost:3000";

type Proposta = {
  id: number;
  descricao: string;
  resposta: string | null;
  cliente?: { id: number; nome: string; email: string } | null;
  guitarra?: {
    id: number;
    modelo: string;
    preco: number | string;
    foto: string;
    acessorio?: string | null;
    destaque?: boolean;
    marca?: { id: number; nome: string } | null;
  } | null;
};

export default function AdminPropostas() {
  const [lista, setLista] = useState<Proposta[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [respEdits, setRespEdits] = useState<Record<number, string>>({});

  async function carregar() {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const r = await fetch(`${API}/propostas`, {
        headers: {
          Accept: "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const j = await r.json();
      if (Array.isArray(j)) {
        setLista(j);
        const m: Record<number, string> = {};
        j.forEach((p) => (m[p.id] = (p.resposta ?? "—").replace(/^—$/, "")));
        setRespEdits(m);
      } else {
        setLista([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvarResposta(p: Proposta) {
    const resposta = (respEdits[p.id] ?? "").trim();
    setSavingId(p.id);
    try {
      const token = localStorage.getItem("admin_token") || "";
      const r = await fetch(`${API}/propostas/${p.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ resposta: resposta || "—" }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e?.error || "Falha ao salvar resposta");
      }
      await carregar();
    } catch (e) {
      console.error(e);
      alert("Falha ao salvar resposta.");
    } finally {
      setSavingId(null);
    }
  }

  const filtrada = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return lista;
    return lista.filter((p) => {
      const cliente = `${p.cliente?.nome ?? ""} ${p.cliente?.email ?? ""}`.toLowerCase();
      const guit = `${p.guitarra?.marca?.nome ?? ""} ${p.guitarra?.modelo ?? ""}`.toLowerCase();
      const desc = (p.descricao ?? "").toLowerCase();
      return cliente.includes(term) || guit.includes(term) || desc.includes(term);
    });
  }, [lista, q]);

  return (
    <div>
      {/* Faixa superior preta com título e ações */}
      <div className="rounded-2xl overflow-hidden ring-1 ring-black/5 bg-black text-emerald-400">
        <div className="px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
          <h2 className="text-3xl font-extrabold">Controle de Propostas</h2>

          <div className="flex w-full md:w-auto items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filtrar por cliente/guitarra"
              className="flex-1 md:w-80 rounded-lg border border-gray-300 bg-white px-3 py-2 text-black outline-none focus:ring-4 focus:ring-emerald-300"
            />
            <button
              onClick={carregar}
              disabled={loading}
              className="rounded-lg bg-neutral-900 text-emerald-400 px-4 py-2 font-medium hover:bg-neutral-800 focus:ring-4 focus:ring-emerald-300 disabled:opacity-50"
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
              <th className="px-6 py-3 text-left text-sm font-semibold">Foto</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Guitarra</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Descrição</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Resposta</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
            </tr>
          </thead>

          {/* Sem divide-y para não ter barras entre IDs */}
          <tbody className="text-sm">
            {filtrada.map((p) => {
              const foto = p.guitarra?.foto;
              const marca = p.guitarra?.marca?.nome ?? "—";
              const modelo = p.guitarra?.modelo ?? "—";
              const clienteNome = p.cliente?.nome ?? "—";
              const clienteEmail = p.cliente?.email ?? "—";

              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  {/* ID agora sem fundo preto e sem texto verde */}
                  <td className="px-6 py-4 font-semibold text-gray-800">{p.id}</td>

                  <td className="px-6 py-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden ring-1 ring-black/5 bg-white">
                      {foto ? (
                        <img
                          src={foto}
                          alt={`${marca} ${modelo}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://via.placeholder.com/64x64?text=IMG";
                          }}
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/64x64?text=IMG"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium">{clienteNome}</div>
                    <div className="text-gray-500">{clienteEmail}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-medium">{marca}</div>
                    <div className="text-gray-500">{modelo}</div>
                  </td>

                  <td className="px-6 py-4">{p.descricao}</td>

                  <td className="px-6 py-4">
                    <input
                      value={respEdits[p.id] ?? ""}
                      onChange={(e) =>
                        setRespEdits((s) => ({ ...s, [p.id]: e.target.value }))
                      }
                      placeholder="—"
                      className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-4 focus:ring-emerald-300"
                    />
                  </td>

                  <td className="px-6 py-4">
                    <button
                      type="button"
                      disabled={savingId === p.id}
                      onClick={() => salvarResposta(p)}
                      className="inline-flex items-center justify-center rounded-lg border border-emerald-500/40 bg-black px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-neutral-900 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingId === p.id ? "Salvando..." : "Salvar"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtrada.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                  Nenhuma proposta encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
