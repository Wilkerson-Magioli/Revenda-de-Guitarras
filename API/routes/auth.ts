// routes/auth.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

/* ---------- helpers ---------- */
function signToken(payload: object) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign(payload, secret, { expiresIn: "8h" });
}

/* ---------- CLIENTE: register / login ---------- */
const registerSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(4),
  telefone: z.string().min(8).max(20).optional(),
  cidade: z.string().max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, telefone, cidade } = registerSchema.parse(req.body);

    const exists = await prisma.cliente.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "E-mail já cadastrado" });

    const hash = await bcrypt.hash(senha, 10);

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        senha: hash,
        telefone: telefone ?? null,
        cidade: (cidade ?? "").trim(),
      },
      select: { id: true, nome: true, email: true, telefone: true, cidade: true },
    });

    const token = signToken({ sub: cliente.id, role: "cliente" });
    res.status(201).json({ cliente, token });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Erro no cadastro" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, senha } = loginSchema.parse(req.body);

    const cliente = await prisma.cliente.findUnique({ where: { email } });
    if (!cliente) return res.status(401).json({ error: "Credenciais inválidas" });

    const ok = await bcrypt.compare(senha, cliente.senha);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const safe = {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cidade: cliente.cidade ?? "",
    };

    const token = signToken({ sub: cliente.id, role: "cliente" });
    res.json({ cliente: safe, token });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Erro no login" });
  }
});

/* ---------- ADMIN: login ---------- */
const adminLoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

router.post("/admin/login", async (req, res) => {
  try {
    const { email, senha } = adminLoginSchema.parse(req.body);

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ error: "Credenciais inválidas" });

    let ok = false;

    // senha já hasheada?
    if (admin.senha.startsWith("$2")) {
      ok = await bcrypt.compare(senha, admin.senha);
    } else {
      // Fallback (caso esteja em texto puro no banco)
      ok = senha === admin.senha;
      if (ok) {
        // upgrade automático p/ bcrypt
        const hash = await bcrypt.hash(senha, 10);
        await prisma.admin.update({ where: { id: admin.id }, data: { senha: hash } });
      }
    }

    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const safe = { id: admin.id, nome: admin.nome, email: admin.email, nivel: admin.nivel };
    const token = signToken({ sub: admin.id, role: "admin" });
    res.json({ admin: safe, token });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Erro no login" });
  }
});

export default router;
