// src/admin/AdminGuitarraForm.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { toast } from "sonner";
import { useAdminStore } from "./context/AdminContext";

type Marca = { id: number; nome: string };

export default function AdminGuitarraForm() {
  const navigate = useNavigate();
  const admin = useAdminStore((s) => s.admin);
  const token = useAdminStore((s) => s.token);

  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelo, setModelo] = useState("");
  const [marcaId, setMarcaId] = useState<number | "">("");
  const [preco, setPreco] = useState("");
  const [foto, setFoto] = useState("");
  const [acessorio, setAcessorio] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<Marca[]>("/marcas");
        setMarcas(data ?? []);
      } catch {
        setMarcas([]);
      }
    })();
  }, []);

  async function onSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !admin?.id) {
      toast.error("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!marcaId) {
      toast.error("Selecione a marca.");
      return;
    }
    try {
      setSaving(true);
      const body = {
        modelo,
        preco, // string aceitável; backend converte para número
        foto,
        acessorio: acessorio || undefined,
        destaque,
        marcaId: Number(marcaId),
        adminId: Number(admin.id),
      };
      await api.post("/guitarras", body, {
        headers: { Authorization: "Bearer " + token },
      });
      toast.success("Guitarra cadastrada com sucesso!");
      navigate("/admin/guitarras", { replace: true });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao cadastrar guitarra");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6">
      {/* cabeçalho padrão preto/verde */}
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
          <span className="text-sm">Marca</span>
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
            placeholder="Ex.: 15000 ou 15.000,00"
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

        <label className="flex items-center gap-2">
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
            disabled={saving}
            className="rounded-lg bg-black text-emerald-400 px-5 py-2 font-medium hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300 disabled:opacity-60"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
