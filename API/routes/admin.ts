// routes/admin.ts
import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

const JWT = process.env.JWT_SECRET || "dev_secret_admin";

// Nunca retornamos a senha do admin
const adminSelect = {
  id: true,
  nome: true,
  email: true,
  nivel: true,
  createdAt: true,
  updatedAt: true,
} as const;

/* =========================================
   LOGIN: POST /login
   - aceita senha em texto puro (caso legado);
   - se bater, atualiza para hash automaticamente.
========================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = (req.body ?? {}) as {
      email?: string;
      senha?: string;
    };

    if (!email || !senha) {
      return res
        .status(400)
        .json({ error: "email e senha são obrigatórios" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Credenciais inválidas" });

    let ok = false;

    // Senha já hasheada?
    if (admin.senha.startsWith("$2")) {
      ok = await bcrypt.compare(senha, admin.senha);
    } else {
      // Fallback para bases legadas (senha em texto puro)
      ok = senha === admin.senha;
      if (ok) {
        const hash = await bcrypt.hash(senha, 10);
        await prisma.admin.update({ where: { id: admin.id }, data: { senha: hash } });
      }
    }

    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign({ sub: admin.id, role: "admin" }, JWT, {
      expiresIn: "8h",
    });

    const { id, nome, nivel } = admin;
    return res.json({ admin: { id, nome, email: admin.email, nivel }, token });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? "Erro no login" });
  }
});

/* =========================================
   LISTAR: GET /
========================================= */
router.get("/", async (_req, res) => {
  try {
    const data = await prisma.admin.findMany({
      select: adminSelect,
      orderBy: { id: "asc" },
    });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Erro ao listar admins." });
  }
});

/* =========================================
   BUSCAR POR ID: GET /:id
========================================= */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "ID inválido." });

    const item = await prisma.admin.findUnique({
      where: { id },
      select: adminSelect,
    });
    if (!item) return res.status(404).json({ error: "Admin não encontrado." });
    res.json(item);
  } catch {
    res.status(500).json({ error: "Erro ao buscar admin." });
  }
});

/* =========================================
   CRIAR: POST /
   - sempre salva senha com bcrypt
========================================= */
router.post("/", async (req, res) => {
  try {
    const { nome, email, senha, nivel } = req.body ?? {};
    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ error: "Campos obrigatórios: nome, email, senha." });
    }

    const hash = await bcrypt.hash(String(senha), 10);

    const created = await prisma.admin.create({
      data: {
        nome: String(nome),
        email: String(email),
        senha: hash,
        ...(nivel !== undefined ? { nivel: Number(nivel) } : {}),
      },
      select: adminSelect,
    });
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Email já está em uso." });
    }
    res.status(500).json({ error: "Erro ao criar admin." });
  }
});

/* =========================================
   ATUALIZAR: PUT /:id
   - se vier senha, re-hash
========================================= */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "ID inválido." });

    const { nome, email, senha, nivel } = req.body ?? {};
    const data: Prisma.AdminUpdateInput = {};

    if (nome !== undefined) data.nome = String(nome);
    if (email !== undefined) data.email = String(email);
    if (nivel !== undefined) data.nivel = Number(nivel) as any;

    if (senha !== undefined) {
      data.senha = await bcrypt.hash(String(senha), 10);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data,
      select: adminSelect,
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025")
      return res.status(404).json({ error: "Admin não encontrado." });
    if (e?.code === "P2002")
      return res.status(409).json({ error: "Email já está em uso." });
    res.status(500).json({ error: "Erro ao atualizar admin." });
  }
});

/* =========================================
   APAGAR: DELETE /:id
========================================= */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "ID inválido." });

    await prisma.admin.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    if (e?.code === "P2025")
      return res.status(404).json({ error: "Admin não encontrado." });
    res.status(500).json({ error: "Erro ao excluir admin." });
  }
});

export default router;
