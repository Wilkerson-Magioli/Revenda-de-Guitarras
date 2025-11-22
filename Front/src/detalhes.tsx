// src/detalhes.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "./utils/api";
import { toast } from "sonner";
import { useClienteStore } from "./context/ClienteContext";
import type { GuitarraType } from "./utils/GuitarraType";

export default function Detalhes() {
  const { guitarraId } = useParams<{ guitarraId: string }>();
  const [guitarra, setGuitarra] = useState<GuitarraType | null>(null);
  const [descricao, setDescricao] = useState("");
  const { cliente, token } = useClienteStore();

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<GuitarraType>(`/guitarras/${guitarraId}`);
        setGuitarra(data);
      } catch (e: any) {
        toast.error(e?.message ?? "Erro ao carregar guitarra");
      }
    })();
  }, [guitarraId]);

  async function enviarProposta(e: React.FormEvent) {
    e.preventDefault();
    if (!cliente.id) return toast.info("Identifique-se para enviar proposta.");
    if (!guitarra?.id) return;

    try {
      await api.post(
        "/propostas",
        {
          descricao,
          resposta: "—",
          guitarraId: Number(guitarra.id),
          adminId: 1,
        },
        { auth: !!token }
      );
      setDescricao("");
      toast.success("Proposta enviada!");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao enviar proposta");
    }
  }

  if (!guitarra) return null;

  const preco = Number(guitarra.preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <section className="max-w-7xl mx-auto p-4 md:p-6">
      {/* BOTÃO À DIREITA */}
      <div className="mb-4 flex justify-end">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-black text-emerald-400 hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
        >
          Voltar para guitarras em destaque
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6 bg-white rounded-2xl p-4 md:p-6 shadow ring-1 ring-black/5">
        <img
          src={guitarra.foto}
          alt={guitarra.modelo}
          className="w-full h-[520px] object-contain bg-white rounded-xl"
        />

        <div>
          <h1 className="text-3xl font-extrabold mb-2">
            {guitarra.marca?.nome} {guitarra.modelo}
          </h1>
          <p className="text-gray-700">Preço {preco}</p>
          {guitarra.acessorio && (
            <p className="text-gray-500">
              Acessório: <span className="font-medium">{guitarra.acessorio}</span>
            </p>
          )}

          <h2 className="mt-6 mb-2 text-xl font-bold">
            Descubra o potencial da {guitarra.marca?.nome} {guitarra.modelo}
          </h2>
          <p className="text-sm text-gray-600">
            Combina timbre inspirador, acabamento premium e excelente custo-benefício.
          </p>

          {cliente.id ? (
            <form onSubmit={enviarProposta} className="space-y-2 mt-6">
              <input
                className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
                value={`${cliente.nome} (${cliente.email})`}
                disabled
                readOnly
              />
              <textarea
                className="w-full border rounded p-2"
                placeholder="Descreva sua proposta..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 font-medium bg-black text-emerald-400 rounded-lg hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
              >
                Enviar Proposta
              </button>
            </form>
          ) : (
            <p className="mt-6 text-sm text-gray-600">
              😎 Gostou? Faça login para enviar sua proposta.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
