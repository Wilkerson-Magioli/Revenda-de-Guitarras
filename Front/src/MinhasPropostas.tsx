// src/MinhasPropostas.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "./utils/api";
import { useClienteStore } from "./context/ClienteContext";

type Marca = { id: number; nome: string };
type Guitarra = {
  id: number;
  modelo: string;
  preco: number | string | null;
  foto: string;
  acessorio?: string | null;
  marca?: Marca | null;
};

type Proposta = {
  id: number;
  descricao: string;
  resposta: string | null; // pode vir null do backend
  createdAt: string;
  guitarra: Guitarra | null;
};

export default function MinhasPropostas() {
  const { token, cliente } = useClienteStore();
  const [lista, setLista] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const autorizado = useMemo(() => Boolean(token && cliente?.id), [token, cliente?.id]);

  useEffect(() => {
    if (!autorizado) {
      setLista([]);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // Envia Authorization de forma explícita.
        const resp = await api.get<
          Proposta[] | { data: Proposta[] } | { items: Proposta[] }
        >("/propostas/minhas", {
          headers: { Authorization: `Bearer ${token}` },
          // params: { clienteId: cliente!.id }, // use apenas se o backend exigir
        });

        // Aceita diferentes formatos de retorno
        const raw: any = (resp as any)?.data ?? resp ?? [];
        const data: Proposta[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.items)
          ? raw.items
          : Array.isArray(raw.data)
          ? raw.data
          : [];

        setLista(data);
      } catch (e: any) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Erro ao carregar propostas";
        setErr(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, [autorizado, token, cliente?.id]);

  return (
    <div className="bg-neutral-200 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold">Minhas Propostas</h2>
          <Link
            to="/"
            className="rounded-xl bg-black px-4 py-2 text-emerald-400 border border-emerald-500/40 hover:bg-neutral-900 transition focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            Voltar para Guitarras em Destaque
          </Link>
        </div>

        <p className="text-gray-600 mb-4">
          Cliente:{" "}
          <span className="font-medium">{cliente?.nome ?? "—"}</span>{" "}
          ({cliente?.email ?? "—"})
        </p>

        {err && (
          <div className="mb-6 rounded-lg bg-red-50 text-red-700 px-4 py-3">{err}</div>
        )}
        {loading && (
          <div className="mb-6 rounded-lg bg-blue-50 text-blue-700 px-4 py-3">
            Carregando...
          </div>
        )}

        {!loading && autorizado && lista.length === 0 && !err && (
          <p className="text-gray-500">Você ainda não enviou nenhuma proposta.</p>
        )}

        {!autorizado && (
          <p className="text-gray-500">
            Faça login para visualizar suas propostas.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p) => {
            const g = p.guitarra;
            const precoNumber = Number(g?.preco ?? 0);
            const preco =
              isFinite(precoNumber)
                ? precoNumber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : String(g?.preco ?? "—");

            const temResposta = p.resposta && p.resposta !== "—";
            const status = temResposta ? "Respondida" : "Aguardando resposta";

            return (
              <article
                key={p.id}
                className="bg-white rounded-2xl shadow ring-1 ring-black/5 overflow-hidden"
              >
                <div className="w-full h-56 bg-white flex items-center justify-center p-2">
                  {g?.foto ? (
                    <img
                      src={g.foto}
                      alt={g?.modelo ?? "Guitarra"}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-sm text-gray-400">Sem imagem</div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold">
                    {(g?.marca?.nome ?? "") + (g?.modelo ? ` ${g.modelo}` : "")}
                  </h3>
                  <p className="text-gray-600">Preço {preco}</p>
                  {!!g?.acessorio && (
                    <p className="text-gray-500">
                      Acessório: <span className="font-medium">{g.acessorio}</span>
                    </p>
                  )}

                  <hr className="my-3" />

                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Sua proposta:</span> {p.descricao}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium">Status:</span> {status}
                  </p>

                  {temResposta && (
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Resposta do admin:</span> {p.resposta}
                    </p>
                  )}

                  <div className="mt-4">
                    {g?.id ? (
                      <Link
                        to={`/guitarras/${g.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-black text-emerald-400 rounded-lg hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
                      >
                        Ver guitarra
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-400">Guitarra não encontrada</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
