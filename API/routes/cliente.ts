// routes/cliente.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({});
const router = Router();

/** POST /clientes  { nome, email, senha, telefone?, cidade? } */
router.post("/", async (req, res) => {
  const { nome, email, senha, telefone, cidade } = (req.body ?? {}) as {
    nome?: string;
    email?: string;
    senha?: string;
    telefone?: string | null;
    cidade?: string | null;
  };

  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ error: "nome, email e senha são obrigatórios" });
  }

  const jaExiste = await prisma.cliente.findUnique({ where: { email } });
  if (jaExiste) {
    return res.status(409).json({ error: "Email já cadastrado" });
  }

  const hash = await bcrypt.hash(senha, 10);

  const cli = await prisma.cliente.create({
    data: {
      nome,
      email,
      senha: hash,
      telefone: telefone ?? null,
      // se no schema estiver `cidade String @default("")`, pode omitir; mas vamos garantir:
      cidade: (cidade ?? "").trim(),
    },
    select: { id: true, nome: true, email: true, telefone: true, cidade: true },
  });

  return res.status(201).json(cli);
});

/** GET /clientes  (lista simples) */
router.get("/", async (_req, res) => {
  const lista = await prisma.cliente.findMany({
    // select: { id: true, nome: true, email: true, telefone: true, cidade: true },
    orderBy: { id: "asc" },
  });
  res.json(lista);
});

export default router;
