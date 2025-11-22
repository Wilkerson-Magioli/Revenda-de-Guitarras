import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

function getPagination(q: any) {
  const page = Math.max(parseInt(String(q.page ?? "1"), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(q.limit ?? "20"), 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

const marcaSelect = {
  id: true,
  nome: true,
  _count: { select: { guitarra: true } }, // quantidade de guitarras da marca
} as const;

// GET /marcas
router.get("/", async (req, res) => {
  try {
    const { skip, limit } = getPagination(req.query);
    const [total, data] = await Promise.all([
      prisma.marca.count(),
      prisma.marca.findMany({
        select: marcaSelect,
        orderBy: { id: "asc" },
        skip, take: limit,
      }),
    ]);
    res.json({ total, pageSize: limit, page: Math.floor(skip / limit) + 1, data });
  } catch {
    res.status(500).json({ error: "Erro ao listar marcas." });
  }
});

// GET /marcas/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.marca.findUnique({ where: { id }, select: marcaSelect });
    if (!item) return res.status(404).json({ error: "Marca não encontrada." });
    res.json(item);
  } catch {
    res.status(500).json({ error: "Erro ao buscar marca." });
  }
});

// GET /marcas/:id/guitarras  -> lista guitarras da marca
router.get("/:id/guitarras", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const guitarras = await prisma.guitarra.findMany({
      where: { marcaId: id },
      include: {
        marca: { select: { id: true, nome: true } },
        admin: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { id: "asc" },
    });
    res.json(guitarras);
  } catch {
    res.status(500).json({ error: "Erro ao listar guitarras da marca." });
  }
});

// GET /marcas/pesquisa/:q
router.get("/pesquisa/:q", async (req, res) => {
  try {
    const q = String(req.params.q ?? "").trim();
    if (!q) return res.status(400).json({ error: "Informe um termo para pesquisa." });
    const data = await prisma.marca.findMany({
      where: { nome: { contains: q, mode: "insensitive" } },
      select: marcaSelect,
      orderBy: { id: "asc" },
      take: 50,
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro na pesquisa." });
  }
});

// POST /marcas  { nome }
router.post("/", async (req, res) => {
  try {
    const { nome } = req.body ?? {};
    if (!nome) return res.status(400).json({ error: "Campo obrigatório: nome." });
    const created = await prisma.marca.create({ data: { nome: String(nome) }, select: marcaSelect });
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "P2002") return res.status(409).json({ error: "Marca já existe." });
    res.status(500).json({ error: "Erro ao criar marca." });
  }
});

// PUT /marcas/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nome } = req.body ?? {};
    const updated = await prisma.marca.update({
      where: { id },
      data: { ...(nome !== undefined ? { nome: String(nome) } : {}) },
      select: marcaSelect,
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Marca não encontrada." });
    if (e?.code === "P2002") return res.status(409).json({ error: "Marca já existe." });
    res.status(500).json({ error: "Erro ao atualizar marca." });
  }
});

// DELETE /marcas/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.marca.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Marca não encontrada." });
    res.status(500).json({ error: "Erro ao excluir marca." });
  }
});

export default router;
