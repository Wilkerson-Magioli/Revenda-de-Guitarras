// src/routes/proposta.ts
import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middlewares/requireAuth"; // <- ajuste o caminho se necessário
import { sendMail } from "../utils/mail";

const router = Router();
const prisma = new PrismaClient();

/** Relações que voltam junto com a proposta */
const propostaInclude = {
  cliente: { select: { id: true, nome: true, email: true } },
  guitarra: {
    select: {
      id: true,
      modelo: true,
      preco: true,
      foto: true,
      acessorio: true,
      destaque: true,
      marca: { select: { id: true, nome: true } },
    },
  },
  admin: { select: { id: true, nome: true, email: true } },
} as const;

/** helper simples: só deixa passar admin (token assinado no /admin/login tem role: "admin") */
function requireAdmin(req: AuthRequest, res: any, next: any) {
  if (!req.auth) return res.status(401).json({ error: "Token ausente" });
  if (req.auth.role !== "admin") return res.status(403).json({ error: "Apenas admin" });
  next();
}

/* =============================================================================
 * GET /propostas             -> lista TODAS (apenas admin, com foto da guitarra)
 * ============================================================================= */
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const data = await prisma.proposta.findMany({
      include: propostaInclude,
      orderBy: { id: "asc" },
    });
    res.json(data);
  } catch (err: any) {
    console.error("GET /propostas falhou:", err);
    res.status(500).json({ error: "Erro ao listar propostas." });
  }
});

/* =============================================================================
 * GET /propostas/minhas      -> lista do cliente logado
 * ============================================================================= */
router.get("/minhas", requireAuth, async (req: AuthRequest, res) => {
  try {
    const clienteId = req.auth!.id;
    const data = await prisma.proposta.findMany({
      where: { clienteId },
      include: propostaInclude,
      orderBy: { id: "desc" },
    });
    res.json(data);
  } catch (err) {
    console.error("GET /propostas/minhas falhou:", err);
    res.status(500).json({ error: "Erro ao listar suas propostas." });
  }
});

/* =============================================================================
 * (Opcional) GET /propostas/pesquisa/:q
 * ============================================================================= */
router.get("/pesquisa/:q", requireAuth, requireAdmin, async (req, res) => {
  try {
    const q = String(req.params.q ?? "").trim();
    if (!q) return res.status(400).json({ error: "Informe um termo." });

    const data = await prisma.proposta.findMany({
      where: {
        OR: [
          { descricao: { contains: q, mode: "insensitive" } },
          { resposta: { contains: q, mode: "insensitive" } },
        ],
      },
      include: propostaInclude,
      orderBy: { id: "asc" },
      take: 50,
    });
    res.json(data);
  } catch (err) {
    console.error("GET /propostas/pesquisa falhou:", err);
    res.status(500).json({ error: "Erro na pesquisa." });
  }
});

/* =============================================================================
 * GET /propostas/:id
 * ============================================================================= */
router.get("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });

    const item = await prisma.proposta.findUnique({
      where: { id },
      include: propostaInclude,
    });
    if (!item) return res.status(404).json({ error: "Proposta não encontrada." });
    res.json(item);
  } catch (err) {
    console.error("GET /propostas/:id falhou:", err);
    res.status(500).json({ error: "Erro ao buscar proposta." });
  }
});

/* =============================================================================
 * POST /propostas  (cliente logado cria)
 * ============================================================================= */
const createSchema = z.object({
  descricao: z.string().min(1, "descricao é obrigatória"),
  resposta: z.string().optional().default("—"),
  guitarraId: z.coerce.number().int().positive(),
  adminId: z.coerce.number().int().positive(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }
  const { descricao, resposta, guitarraId, adminId } = parsed.data;

  try {
    // valida FKs essenciais
    const [guitarra, admin] = await Promise.all([
      prisma.guitarra.findUnique({ where: { id: guitarraId } }),
      prisma.admin.findUnique({ where: { id: adminId } }),
    ]);
    if (!guitarra) return res.status(400).json({ error: "guitarraId inválido." });
    if (!admin) return res.status(400).json({ error: "adminId inválido." });

    const created = await prisma.proposta.create({
      data: {
        descricao,
        resposta: resposta?.trim() ? resposta : "—",
        clienteId: req.auth!.id,
        guitarraId,
        adminId,
      },
      include: propostaInclude,
    });

    res.status(201).json(created);
  } catch (e: any) {
    console.error("POST /propostas falhou:", e);
    res.status(400).json({ error: e?.message ?? "Erro ao criar proposta." });
  }
});

/* =============================================================================
 * PUT /propostas/:id   -> atualiza (admin; dispara e-mail se tiver resposta)
 * ============================================================================= */
const updateSchema = z.object({
  descricao: z.string().min(1).optional(),
  resposta: z.string().optional(),
  guitarraId: z.coerce.number().int().positive().optional(),
  adminId: z.coerce.number().int().positive().optional(),
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const data: Prisma.PropostaUpdateInput = {};
    const { descricao, resposta, guitarraId, adminId } = parsed.data;

    if (descricao !== undefined) data.descricao = descricao;
    if (resposta !== undefined) data.resposta = resposta;
    if (guitarraId !== undefined) data.guitarra = { connect: { id: guitarraId } };
    if (adminId !== undefined) data.admin = { connect: { id: adminId } };

    const updated = await prisma.proposta.update({
      where: { id },
      data,
      include: propostaInclude,
    });

    // se houve resposta e temos e-mail do cliente, dispara e-mail
    try {
      if (resposta !== undefined && updated.cliente?.email) {
        await sendMail({
          to: updated.cliente.email,
          subject: `Resposta para sua proposta – ${(updated.guitarra?.marca?.nome ?? "")} ${updated.guitarra?.modelo ?? ""}`.trim(),
          html: `
            <p>Olá, ${updated.cliente.nome}!</p>
            <p>Sua proposta foi respondida:</p>
            <blockquote>${updated.resposta ?? "—"}</blockquote>
            <p>Atenciosamente,<br/>Revenda de Guitarras</p>
          `,
        });
      }
    } catch (mailErr) {
      console.error("Falha ao enviar e-mail:", mailErr);
    }

    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Proposta não encontrada." });
    console.error("PUT /propostas/:id falhou:", e);
    res.status(500).json({ error: "Erro ao atualizar proposta." });
  }
});

/* =============================================================================
 * DELETE /propostas/:id
 * ============================================================================= */
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "ID inválido." });

    await prisma.proposta.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ error: "Proposta não encontrada." });
    console.error("DELETE /propostas/:id falhou:", e);
    res.status(500).json({ error: "Erro ao excluir proposta." });
  }
});

export default router;
