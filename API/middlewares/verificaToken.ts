// src/middlewares/verificaToken.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT = process.env.JWT_SECRET || "dev_secret";

export interface AuthPayload {
  sub: number | string;
  role?: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: { id: number; role?: string; email?: string };
    }
  }
}

export function verificaToken(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token ausente" });
  }
  const token = h.slice(7);
  try {
    const payload = jwt.verify(token, JWT) as AuthPayload;
    const idNum = typeof payload.sub === "string" ? Number(payload.sub) : (payload.sub as number);
    if (!idNum || Number.isNaN(idNum)) {
      return res.status(401).json({ error: "Token inválido" });
    }
    req.auth = { id: idNum, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function verificaAdmin(req: Request, res: Response, next: NextFunction) {
  verificaToken(req, res, () => {
    if (req.auth?.role !== "admin") {
      return res.status(403).json({ error: "Apenas administradores" });
    }
    next();
  });
}
