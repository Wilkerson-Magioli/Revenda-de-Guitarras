import { useEffect, useState, useMemo } from "react";
import ItemGuitarra from "./components/ItemGuitarra"; // se seu ItemGuitarra estiver fora de /admin, use ../components/ItemGuitarra

const API = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

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
  const [lista, setLista] = useState<Guitarra[]>([]);
  const [q, setQ] = useState("");

  async function carregar() {
    const r = await fetch(`${API}/guitarras`);
    const j = (await r.json()) as unknown;
    setLista(Array.isArray(j) ? (j as Guitarra[]) : ([] as Guitarra[]));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function toggleDestaque(id: number, novo: boolean) {
    const token = localStorage.getItem("admin_token") || "";
    await fetch(`${API}/guitarras/${id}/destaque`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ destaque: novo }),
    });
    await carregar();
  }

  const filtrada = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return lista;
    return lista.filter((g) =>
      (g.modelo ?? "").toLowerCase().includes(term) ||
      (g.marca?.nome ?? "").toLowerCase().includes(term) ||
      (g.acessorio ?? "").toLowerCase().includes(term)
    );
  }, [lista, q]);

  return (
    <div className="container mt-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Cadastro de Guitarras</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="filtrar por modelo/marca"
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtrada.map((g) => (
          <ItemGuitarra key={g.id} item={g} onToggleDestaque={toggleDestaque} />
        ))}
      </div>

      {filtrada.length === 0 && (
        <p className="text-gray-500 mt-6">Nenhuma guitarra encontrada.</p>
      )}
    </div>
  );
}
