type Marca = { id: number; nome: string };
type Guitarra = {
  id: number;
  modelo: string;
  preco: string | number;
  foto: string;
  acessorio?: string | null;
  destaque?: boolean;
  marca?: Marca | null;
};

export default function CardInstrumento({ item }: { item: Guitarra }) {
  const preco = Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(Number(item.preco));

  return (
    <article className="rounded-2xl overflow-hidden bg-white shadow">
      <img src={item.foto} alt={item.modelo} className="h-60 w-full object-cover" />
      <div className="p-4">
        <h3 className="text-xl font-bold">{item.marca?.nome ? `${item.marca.nome} ` : ""}{item.modelo}</h3>
        <p className="mt-1 text-gray-600">Preço {preco}</p>
        {item.acessorio && <p className="mt-1 text-sm text-gray-500">Acessório: {item.acessorio}</p>}
      </div>
    </article>
  );
}
