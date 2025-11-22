import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/* Helpers de formatação */
const PREPOS = new Set(["de", "da", "das", "do", "dos", "e"]);
function titleize(pt: string) {
  return (pt ?? "")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .split(/\s+/)
    .map((w, i) =>
      PREPOS.has(w) && i > 0
        ? w
        : (w[0]?.toLocaleUpperCase("pt-BR") ?? "") + w.slice(1)
    )
    .join(" ");
}

/* ------------------------------------------------------------------ */
/* GET /dashboard/gerais -> totais                                      */
/* ------------------------------------------------------------------ */
router.get("/gerais", async (_req, res) => {
  try {
    const [clientes, guitarras, propostas] = await Promise.all([
      prisma.cliente.count(),
      prisma.guitarra.count(),
      prisma.proposta.count(),
    ]);
    res.json({ clientes, guitarras, propostas });
  } catch {
    res.status(500).json({ error: "Erro ao buscar totais." });
  }
});

/* ------------------------------------------------------------------ */
/* GET /dashboard/guitarras-marca -> [{ marca, num }]                  */
/* ------------------------------------------------------------------ */
router.get("/guitarras-marca", async (_req, res) => {
  try {
    const rows = await prisma.guitarra.findMany({
      select: { marca: { select: { nome: true } } },
    });

    const map = new Map<string, { marca: string; num: number }>();
    for (const r of rows) {
      const raw = (r.marca?.nome ?? "").trim();
      if (!raw) continue;
      const key = raw.toLocaleLowerCase("pt-BR"); // agrupa por lowercase
      const cur = map.get(key) ?? { marca: titleize(raw), num: 0 };
      cur.num += 1;
      map.set(key, cur);
    }
    res.json([...map.values()]);
  } catch {
    res.status(500).json({ error: "Erro ao agrupar guitarras por marca." });
  }
});

/* ------------------------------------------------------------------ */
/* GET /dashboard/clientes-cidade -> [{ cidade, num }]                 */
/* ------------------------------------------------------------------ */
router.get("/clientes-cidade", async (_req, res) => {
  try {
    const rows = await prisma.cliente.findMany({ select: { cidade: true } });

    const map = new Map<string, { cidade: string; num: number }>();
    for (const r of rows) {
      const raw = (r.cidade ?? "").trim();
      if (!raw) continue;
      const key = raw.toLocaleLowerCase("pt-BR"); // chave de agrupamento
      const cur = map.get(key) ?? { cidade: titleize(raw), num: 0 };
      cur.num += 1;
      map.set(key, cur);
    }
    res.json([...map.values()]);
  } catch {
    res.status(500).json({ error: "Erro ao agrupar clientes por cidade." });
  }
});

export default router;
