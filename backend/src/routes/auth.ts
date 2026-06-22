import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { tokensRevogados, usuarios } from "../db/schema";
import type { AuthRequest } from "../middlewares/auth";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import type {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
} from "../schemas/auth.schema";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
} from "../schemas/auth.schema";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET não está definido nas variáveis de ambiente.",
  );
}
const SALT_ROUNDS = 10;

router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response) => {
    const { nome, email, senha, tipo } = req.body as RegisterBody;

    const [existente] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));

    if (existente) {
      res.status(409).json({ message: "E-mail já cadastrado." });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const [usuario] = await db
      .insert(usuarios)
      .values({ nome, email, senhaHash, tipo })
      .returning({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        tipo: usuarios.tipo,
      });

    const token = jwt.sign(
      { id: usuario!.id, email: usuario!.email, tipo: usuario!.tipo },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({ token, usuario });
  },
);

router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response) => {
    const { email, senha } = req.body as LoginBody;

    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));

    if (!usuario) {
      res.status(401).json({ message: "Credenciais inválidas." });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

    if (!senhaValida) {
      res.status(401).json({ message: "Credenciais inválidas." });
      return;
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  },
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  async (req: Request, res: Response) => {
    const { email } = req.body as ForgotPasswordBody;

    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));

    // Sempre retornar 200 por seguranca
    if (!usuario) {
      res.json({
        message: "Se o e-mail existir, você receberá as instruções.",
      });
      return;
    }

    // TODO: talvez nao seja necessario implementar esse fluxo por completo, tem que ver com a lina

    res.json({ message: "Se o e-mail existir, você receberá as instruções." });
  },
);

router.post(
  "/logout",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        res.status(400).json({ message: "Token não fornecido." });
        return;
      }

      // Salva o token na blacklist
      await db.insert(tokensRevogados).values({ token });

      res
        .status(200)
        .json({ message: "Logout realizado com sucesso e token revogado." });
    } catch (error) {
      console.error("Erro no logout:", error);
      res.status(500).json({ message: "Erro interno ao realizar logout." });
    }
  },
);

export default router;
