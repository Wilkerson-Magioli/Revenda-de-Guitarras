import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

/** POST /login { email, senha } -> { token, cliente } */
router.post("/", async (req, res) => {
  const { email, senha } = req.body as { email?: string; senha?: string };

  if (!email || !senha) {
    return res.status(400).json({ error: "email e senha são obrigatórios" });
  }

  const cli = await prisma.cliente.findUnique({ where: { email } });
  if (!cli || !cli.senha) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const ok = await bcrypt.compare(senha, cli.senha);
  if (!ok) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign(
    { id: cli.id, email: cli.email, nome: cli.nome },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    cliente: { id: cli.id, nome: cli.nome, email: cli.email },
  });
});

export default router;
