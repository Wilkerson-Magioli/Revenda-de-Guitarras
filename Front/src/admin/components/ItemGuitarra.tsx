// src/admin/components/ItemGuitarra.tsx
import { useAdminStore } from "../context/AdminContext";

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

export default function ItemGuitarra({
  item,
  onToggleDestaque,
}: {
  item: Guitarra;
  onToggleDestaque: (id: number, novo: boolean) => void;
}) {
  const admin = useAdminStore((s) => s.admin);
  const podeDestacar = (admin?.nivel ?? 1) >= 2; // nível mínimo 2

  const precoNumber =
    typeof item.preco === "number" ? item.preco : Number(item.preco);
  const precoBRL = precoNumber.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleToggle = () => {
    if (!podeDestacar) return;
    onToggleDestaque(item.id, !item.destaque);
  };

  return (
    <article className="bg-white rounded-2xl shadow ring-1 ring-black/5 overflow-hidden">
      <div className="w-full h-56 bg-white flex items-center justify-center p-2">
        <img
          src={item.foto}
          alt={`${item.marca?.nome ?? ""} ${item.modelo}`}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://via.placeholder.com/400x300?text=Guitarra";
          }}
        />
      </div>

      {/* Centraliza todo o conteúdo textual abaixo da imagem */}
      <div className="p-5 space-y-1.5 text-center">
        <h3 className="text-lg font-bold">
          {item.marca?.nome} {item.modelo}
        </h3>

        <p className="text-gray-600">Preço {precoBRL}</p>

        {item.acessorio && (
          <p className="text-gray-500">
            Acessório: <span className="font-medium">{item.acessorio}</span>
          </p>
        )}

        {/* Selo centralizado */}
        <div className="mt-2 flex justify-center">
          {item.destaque ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Em destaque
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-300">
              Comum
            </span>
          )}
        </div>

        {/* Botão centralizado */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={handleToggle}
            disabled={!podeDestacar}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-500/40 bg-black px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-neutral-900 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50"
            title={
              podeDestacar
                ? item.destaque
                  ? "Remover dos destaques"
                  : "Marcar como destaque"
                : "Seu nível não permite alterar destaque"
            }
          >
            {item.destaque ? "Remover Destaque" : "Marcar Destaque"}
          </button>
        </div>
      </div>
    </article>
  );
}
