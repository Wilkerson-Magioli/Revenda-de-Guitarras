// src/admin/AdminGuitarras.tsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import { toast } from "sonner";
import { useAdminStore } from "./context/AdminContext";
import ItemGuitarra from "./components/ItemGuitarra";
import { Link } from "react-router-dom";

type Marca = { id: number; nome: string };
type Guitarra = {
  id: number;
  modelo: string;
  preco: number | string;
  foto: string;
  acessorio?: string | null;
  destaque?: boolean;
  marca?: Marca | null;
};

export default function AdminGuitarras() {
  const token = useAdminStore((s) => s.token);

  const [itens, setItens] = useState<Guitarra[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    try {
      setLoading(true);
      const data = await api.get<Guitarra[]>("/guitarras");
      setItens(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao carregar guitarras");
      setItens([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const lista = useMemo(() => {
    const nq = q.trim().toLowerCase();
    if (!nq) return itens;
    return itens.filter((g) => {
      const marca = (g.marca?.nome ?? "").toLowerCase();
      const modelo = (g.modelo ?? "").toLowerCase();
      const acess = (g.acessorio ?? "").toLowerCase();
      return marca.includes(nq) || modelo.includes(nq) || (acess && acess.includes(nq));
    });
  }, [itens, q]);

  async function onToggleDestaque(id: number, novo: boolean) {
    try {
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }
      await api.put(
        "/guitarras/" + id + "/destaque",
        { destaque: novo },
        { headers: { Authorization: "Bearer " + token } }
      );
      await carregar();
      toast.success(novo ? "Marcada como destaque" : "Removida dos destaques");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao alterar destaque");
    }
  }

  return (
    <div className="mt-6">
      {/* Faixa de título preta com texto verde */}
      <div className="rounded-2xl bg-black text-emerald-400 px-6 py-4 flex items-center justify-between gap-4">
        {/* Impede quebra de linha do título */}
        <h2 className="whitespace-nowrap leading-none text-3xl md:text-4xl font-extrabold">
          Cadastro de Guitarras
        </h2>

        <div className="flex gap-3 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar por modelo/marca"
            className="rounded-xl border border-emerald-500/40 bg-white px-4 py-2 text-black w-[320px] outline-none focus:ring-4 focus:ring-emerald-300"
          />
          {/* Navega para a página de novo cadastro */}
          <Link
            to="/admin/guitarras/novo"
            className="inline-flex items-center justify-center text-center rounded-xl bg-black text-emerald-400 border border-emerald-500/40 px-5 py-2 font-medium hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
        >
            Cadastrar Guitarra
        </Link>

        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-lg bg-blue-50 text-blue-700 px-4 py-3">Carregando...</div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((g) => (
            <ItemGuitarra key={g.id} item={g} onToggleDestaque={onToggleDestaque} />
          ))}
          {!lista.length && (
            <div className="rounded-xl bg-white px-4 py-6 text-gray-500">
              Nenhuma guitarra encontrada.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
