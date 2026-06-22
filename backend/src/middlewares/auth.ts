import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  id: number;
  email: string;
  tipo: "paciente" | "medico";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

// Verifica a variável de ambiente logo na inicialização do arquivo
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET não está definido nas variáveis de ambiente.",
  );
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1]!;

  try {
    const payload = jwt.verify(
      token,
      JWT_SECRET as string,
    ) as unknown as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado." });
  }
}
