// src/admin/AdminDashboard.tsx
import "./AdminDashboard.css";
import { useEffect, useMemo, useState } from "react";
import { VictoryPie, VictoryLabel, VictoryTheme } from "victory";

const apiUrl = (import.meta as any)?.env?.VITE_API_URL || "http://localhost:3000";

type GraficoMarca = { marca: string; num: number };
type GraficoCidade = { cidade: string; num: number };
type Totais = { clientes: number; guitarras: number; propostas: number };

async function getJsonSafe<T = unknown>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const txt = await r.text();
    if (!txt) return null;
    if (txt.startsWith("<!DOCTYPE") || txt.startsWith("<html")) return null;
    return JSON.parse(txt) as T;
  } catch {
    return null;
  }
}

export default function AdminDashboard() {
  const [guitarraMarca, setGuitarraMarca] = useState<GraficoMarca[]>([]);
  const [clienteCidade, setClienteCidade] = useState<GraficoCidade[]>([]);
  const [dados, setDados] = useState<Totais>({ clientes: 0, guitarras: 0, propostas: 0 });
  const [loading, setLoading] = useState(false);

  async function carregarTudo() {
    setLoading(true);
    try {
      const [d1, d2, d3] = await Promise.all([
        getJsonSafe<any>(`${apiUrl}/dashboard/gerais`),
        getJsonSafe<any>(`${apiUrl}/dashboard/guitarras-marca`),
        getJsonSafe<any>(`${apiUrl}/dashboard/clientes-cidade`),
      ]);

      setDados({
        clientes: Number(d1?.clientes ?? 0),
        guitarras: Number(d1?.guitarras ?? 0),
        propostas: Number(d1?.propostas ?? 0),
      });

      setGuitarraMarca(Array.isArray(d2) ? d2 : []);
      setClienteCidade(Array.isArray(d3) ? d3 : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const dataMarca = useMemo(
    () => guitarraMarca.map((i) => ({ x: i.marca, y: i.num })),
    [guitarraMarca]
  );
  const dataCidade = useMemo(
    () => clienteCidade.map((i) => ({ x: i.cidade, y: i.num })),
    [clienteCidade]
  );

  return (
    <div className="mt-0">
      {/* === Cabeçalho no padrão das outras páginas (preto/verde) === */}
      <div className="rounded-2xl bg-black text-emerald-400 px-6 py-4 flex items-center justify-between gap-4">
        <h2 className="whitespace-nowrap leading-none text-3xl md:text-4xl font-extrabold">
          Visão Geral do Sistema
        </h2>

        <button
          onClick={carregarTudo}
          disabled={loading}
          className="rounded-xl bg-black text-emerald-400 border border-emerald-500/40 px-5 py-2 font-medium hover:bg-neutral-900 focus:ring-4 focus:ring-emerald-300 disabled:opacity-50"
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6">
        <div className="w-full md:w-2/3 flex flex-col md:flex-row justify-between mx-auto mb-5 gap-3">
          <div className="border-blue-600 border rounded p-6 flex-1">
            <span className="bg-blue-100 text-blue-800 text-xl text-center font-bold mx-auto block px-2.5 py-5 rounded">
              {dados.clientes}
            </span>
            <p className="font-bold mt-2 text-center">Nº Clientes</p>
          </div>
          <div className="border-red-600 border rounded p-6 flex-1">
            <span className="bg-red-100 text-red-800 text-xl text-center font-bold mx-auto block px-2.5 py-5 rounded">
              {dados.guitarras}
            </span>
            <p className="font-bold mt-2 text-center">Nº Guitarras</p>
          </div>
          <div className="border-green-600 border rounded p-6 flex-1">
            <span className="bg-green-100 text-green-800 text-xl text-center font-bold mx-auto block px-2.5 py-5 rounded">
              {dados.propostas}
            </span>
            <p className="font-bold mt-2 text-center">Nº Propostas</p>
          </div>
        </div>

        <div className="div-graficos">
          <svg viewBox="0 0 400 400">
            <VictoryPie
              standalone={false}
              width={400}
              height={400}
              data={dataMarca}
              innerRadius={68}
              labelRadius={100}
              theme={VictoryTheme.clean}
              style={{ labels: { fontSize: 11, fontWeight: "bold" } }}
            />
            <VictoryLabel
              textAnchor="middle"
              style={{ fontSize: 14, fontWeight: "bold", fill: "#c00" }}
              x={200}
              y={200}
              text={["Guitarras", "por Marca"]}
            />
          </svg>

          <svg viewBox="0 0 400 400">
            <VictoryPie
              standalone={false}
              width={400}
              height={400}
              data={dataCidade}
              innerRadius={68}
              labelRadius={100}
              theme={VictoryTheme.clean}
              style={{ labels: { fontSize: 11, fontWeight: "bold" } }}
            />
            <VictoryLabel
              textAnchor="middle"
              style={{ fontSize: 14, fontWeight: "bold", fill: "#c00" }}
              x={200}
              y={200}
              text={["Clientes", "por Cidade"]}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
