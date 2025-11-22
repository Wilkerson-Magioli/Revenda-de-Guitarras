// middlewares/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export interface AuthInfo { id: number; role?: string; email?: string }
export interface AuthRequest extends Request { auth?: AuthInfo }

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token ausente" });
  }
  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const sub = payload?.sub;
    const id =
      typeof sub === "string" ? Number(sub) :
      typeof sub === "number" ? sub : NaN;

    if (!id || Number.isNaN(id)) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.auth = { id, role: payload?.role, email: payload?.email };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
