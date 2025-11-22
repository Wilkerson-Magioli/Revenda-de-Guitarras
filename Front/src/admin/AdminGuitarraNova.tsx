import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminStore } from "./context/AdminContext";
import { api } from "../utils/api";

type Marca = { id: number; nome: string };

export default function AdminGuitarraNova() {
  const navigate = useNavigate();

  const admin = useAdminStore((s) => s.admin);
  const token = useAdminStore((s) => s.token);

  const [modelo, setModelo] = useState("");
  const [preco, setPreco] = useState("");
  const [foto, setFoto] = useState("");
  const [acessorio, setAcessorio] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [marcaId, setMarcaId] = useState<number | "">("");

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingMarcas(true);
        const raw = await api.get<any>("/marcas"); // já vem com cache-buster

        // Normaliza para array
        const lista: Marca[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.marcas)
          ? raw.marcas
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.rows)
          ? raw.rows
          : [];

        if (!mounted) return;
        setMarcas(lista);
        if (!lista.length) {
          console.warn("GET /marcas retornou lista vazia ou formato inesperado:", raw);
        }
      } catch (err: any) {
        if (!mounted) return;
        setMarcas([]);
        toast.error(err?.message ?? "Não foi possível carregar as marcas");
      } finally {
        if (mounted) setLoadingMarcas(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSalvar(e: React.FormEvent) {
    e.preventDefault();

    if (!admin?.id || !token) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!marcaId) {
      toast.error("Selecione a marca.");
      return;
    }

    try {
      const body = {
        modelo,
        preco, // "16000" ou "16.000,00" — o back converte
        foto,
        acessorio: acessorio || undefined,
        destaque,
        marcaId: Number(marcaId),
        adminId: Number(admin.id),
      };

      await api.post("/guitarras", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Guitarra cadastrada!");
      navigate("/admin/guitarras", { replace: true });
    } catch (err: any) {
      toast.error(err?.message ?? "Falha ao cadastrar guitarra");
    }
  }

  return (
    <div className="mt-6">
      <div className="rounded-2xl bg-black text-emerald-400 px-6 py-4">
        <h2 className="whitespace-nowrap leading-none text-3xl md:text-4xl font-extrabold">
          Nova Guitarra
        </h2>
      </div>

      <form
        onSubmit={onSalvar}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-2xl p-6 shadow"
      >
        <label className="block">
          <span className="text-sm">Modelo</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm flex items-center justify-between">
            <span>Marca</span>
            <span className="text-xs text-gray-500">
              {loadingMarcas ? "carregando…" : `${marcas.length} marcas carregadas`}
            </span>
          </span>
          <select
            className="mt-1 w-full rounded border px-3 py-2"
            value={marcaId}
            onChange={(e) => setMarcaId(Number(e.target.value))}
            required
          >
            <option value="">Selecione...</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm">Preço (R$)</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Ex.: 16000 ou 16.000,00"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className="text-sm">Admin ID</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2 bg-gray-100"
            value={admin?.id ?? ""}
            disabled
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm">Foto (URL)</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            required
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm">Acessórios (opcional)</span>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={acessorio}
            onChange={(e) => setAcessorio(e.target.value)}
          />
        </label>

        <label className="flex items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={destaque}
            onChange={(e) => setDestaque(e.target.checked)}
          />
          <span>Destaque?</span>
        </label>

        <div className="md:col-span-2 flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/guitarras")}
            className="rounded-lg border px-4 py-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-black text-emerald-400 px-5 py-2 font-medium hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
