// src/routes/guitarra.ts
import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

/** Lê o token do header Authorization e valida com o JWT_SECRET */
function getAuth(req: any) {
  const hdr = String(req.header("authorization") || "");
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET || "sua_chave_super_secreta");
    // payload esperado: { sub: admin.id, role: "admin" }
    const id = typeof payload.sub === "string" ? Number(payload.sub) : payload.sub;
    return { id: Number(id), role: payload.role ?? "admin" };
  } catch {
    return null;
  }
}
function requireAdminOr401(req: any, res: any) {
  const a = getAuth(req);
  if (!a || a.role !== "admin") {
    res.status(401).json({ error: "Token ausente ou inválido" });
    return null;
  }
  return a;
}
function asDecimal(v: number | string): Prisma.Decimal {
  if (typeof v === "number") return new Prisma.Decimal(v.toFixed(2));
  // remove R$, espaços, separador de milhar, troca vírgula por ponto
  const s = v.replace(/[R$\s]/g, "").replace(/\./g, "").replace(",", ".");
  return new Prisma.Decimal(s || "0");
}

/* ============================================================================
 * GET /guitarras  -> lista TODAS (admin usa esta rota; público já usa a Home)
 * ========================================================================== */
router.get("/", async (_req, res) => {
  try {
    const data = await prisma.guitarra.findMany({
      include: { marca: true },
      orderBy: { id: "asc" },
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao listar guitarras." });
  }
});

/* ============================================================================
 * GET /guitarras/:id
 * ========================================================================== */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });
  try {
    const item = await prisma.guitarra.findUnique({
      where: { id },
      include: { marca: true },
    });
    if (!item) return res.status(404).json({ error: "Guitarra não encontrada." });
    res.json(item);
  } catch {
    res.status(500).json({ error: "Erro ao buscar guitarra." });
  }
});

/* ============================================================================
 * Schemas
 * ========================================================================== */
const createSchema = z.object({
  modelo: z.string().min(1, "modelo é obrigatório"),
  preco: z.union([z.number(), z.string()]),
  foto: z.string().url().optional().default(""),
  acessorio: z.string().optional().nullable(),
  destaque: z.boolean().optional().default(false),
  ativo: z.boolean().optional().default(true), // << NOVO
  marcaId: z.coerce.number().int().positive(),
  adminId: z.coerce.number().int().positive(),
});

const updateSchema = z.object({
  modelo: z.string().min(1).optional(),
  preco: z.union([z.number(), z.string()]).optional(),
  foto: z.string().url().optional(),
  acessorio: z.string().nullable().optional(),
  destaque: z.boolean().optional(),
  ativo: z.boolean().optional(), // << NOVO
  marcaId: z.coerce.number().int().positive().optional(),
  adminId: z.coerce.number().int().positive().optional(),
});

const patchDestaqueSchema = z.object({
  destaque: z.boolean(),
});

/* ============================================================================
 * POST /guitarras (admin)
 * ========================================================================== */
router.post("/", async (req, res) => {
  const auth = requireAdminOr401(req, res);
  if (!auth) return;

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { modelo, preco, foto, acessorio, destaque, ativo, marcaId, adminId } = parsed.data;

  try {
    const [marca, adminDB] = await Promise.all([
      prisma.marca.findUnique({ where: { id: marcaId } }),
      prisma.admin.findUnique({ where: { id: adminId } }),
    ]);
    if (!marca) return res.status(400).json({ error: "marcaId inválido." });
    if (!adminDB) return res.status(400).json({ error: "adminId inválido." });

    if (destaque) {
      const max = Number(process.env.MAX_DESTAQUES || 3);
      const qtd = await prisma.guitarra.count({ where: { destaque: true } });
      if (qtd >= max) {
        return res.status(400).json({ error: `Limite de destaques atingido (${max}).` });
      }
    }

    const created = await prisma.guitarra.create({
      data: {
        modelo,
        preco: asDecimal(preco),              // << Decimal OK
        foto,
        acessorio: acessorio ?? null,
        destaque: !!destaque,
        ativo: ativo ?? true,                 // << NOVO
        marcaId,
        adminId,
      },
      include: { marca: true },
    });

    // Log
    await prisma.log.create({
      data: { acao: "GUITARRA_CREATE", tabela: "Guitarra", registroId: created.id, adminId: auth.id },
    });

    res.status(201).json(created);
  } catch (e: any) {
    res.status(400).json({ error: e?.message ?? "Erro ao criar guitarra." });
  }
});

/* ============================================================================
 * PUT /guitarras/:id (admin)
 * ========================================================================== */
router.put("/:id", async (req, res) => {
  const auth = requireAdminOr401(req, res);
  if (!auth) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { modelo, preco, foto, acessorio, destaque, ativo, marcaId, adminId } = parsed.data;

  const data: Prisma.GuitarraUpdateInput = {};
  if (modelo !== undefined) data.modelo = modelo;
  if (preco !== undefined) data.preco = asDecimal(preco);
  if (foto !== undefined) data.foto = foto;
  if (acessorio !== undefined) data.acessorio = acessorio;
  if (destaque !== undefined) data.destaque = destaque;
  if (ativo !== undefined) data.ativo = ativo;             // << NOVO
  if (marcaId !== undefined) data.marca = { connect: { id: marcaId } };
  if (adminId !== undefined) data.admin = { connect: { id: adminId } };

  try {
    if (destaque === true) {
      const max = Number(process.env.MAX_DESTAQUES || 3);
      const qtd = await prisma.guitarra.count({ where: { destaque: true } });
      const atual = await prisma.guitarra.findUnique({ where: { id } });
      const jaEraDestaque = atual?.destaque === true;
      const limiteUltrapassado = jaEraDestaque ? qtd > max : qtd >= max;
      if (limiteUltrapassado) {
        return res.status(400).json({ error: `Limite de destaques atingido (${max}).` });
      }
    }

    const updated = await prisma.guitarra.update({
      where: { id },
      data,
      include: { marca: true },
    });

    await prisma.log.create({
      data: { acao: "GUITARRA_UPDATE", tabela: "Guitarra", registroId: updated.id, adminId: auth.id },
    });

    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Guitarra não encontrada." });
    res.status(500).json({ error: "Erro ao atualizar guitarra." });
  }
});

/* ============================================================================
 * PATCH /guitarras/:id/destaque (admin)
 * ========================================================================== */
router.patch("/:id/destaque", async (req, res) => {
  const auth = requireAdminOr401(req, res);
  if (!auth) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });

  const parsed = patchDestaqueSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { destaque } = parsed.data;

  try {
    if (destaque) {
      const max = Number(process.env.MAX_DESTAQUES || 3);
      const qtd = await prisma.guitarra.count({ where: { destaque: true } });
      const atual = await prisma.guitarra.findUnique({ where: { id } });
      const jaEra = atual?.destaque === true;
      const limite = jaEra ? qtd > max : qtd >= max;
      if (limite) {
        return res.status(400).json({ error: `Limite de destaques atingido (${max}).` });
      }
    }

    const updated = await prisma.guitarra.update({
      where: { id },
      data: { destaque },
      include: { marca: true },
    });

    await prisma.log.create({
      data: { acao: "GUITARRA_TOGGLE_DESTAQUE", tabela: "Guitarra", registroId: updated.id, adminId: auth.id },
    });

    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Guitarra não encontrada." });
    res.status(500).json({ error: "Erro ao atualizar destaque." });
  }
});

/* ============================================================================
 * DELETE /guitarras/:id (admin)
 * ========================================================================== */
router.delete("/:id", async (req, res) => {
  const auth = requireAdminOr401(req, res);
  if (!auth) return;

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });

  try {
    await prisma.guitarra.delete({ where: { id } });
    await prisma.log.create({
      data: { acao: "GUITARRA_DELETE", tabela: "Guitarra", registroId: id, adminId: auth.id },
    });
    res.status(204).send();
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Guitarra não encontrada." });
    res.status(500).json({ error: "Erro ao excluir guitarra." });
  }
});

export default router;
