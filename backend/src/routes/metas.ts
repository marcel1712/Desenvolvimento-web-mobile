import { Router } from "express";
import type { Response, NextFunction } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { metas } from "../db/schema";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import type { AuthRequest } from "../middlewares/auth";
import { createMetaSchema, updateMetaSchema } from "../schemas/meta.schema";
import type { CreateMetaBody, UpdateMetaBody } from "../schemas/meta.schema";

const router = Router();

router.use(authenticate);

function requirePaciente(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.tipo !== "paciente") {
    res.status(403).json({ message: "Acesso restrito a pacientes." });
    return;
  }
  next();
}

router.use(requirePaciente);

router.get("/", async (req: AuthRequest, res: Response) => {
  const lista = await db
    .select()
    .from(metas)
    .where(eq(metas.pacienteId, req.user!.id))
    .orderBy(desc(metas.criadoEm));

  res.json(lista);
});

router.post(
  "/",
  validate(createMetaSchema),
  async (req: AuthRequest, res: Response) => {
    const { titulo, descricao } = req.body as CreateMetaBody;

    const [nova] = await db
      .insert(metas)
      .values({
        pacienteId: req.user!.id,
        titulo,
        descricao,
      })
      .returning();

    res.status(201).json(nova);
  }
);

router.patch(
  "/:id",
  validate(updateMetaSchema),
  async (req: AuthRequest, res: Response) => {
    const id = Number(req.params.id);
    const payload = req.body as UpdateMetaBody;

    const [meta] = await db
      .select()
      .from(metas)
      .where(eq(metas.id, id));

    if (!meta) {
      res.status(404).json({ message: "Meta não encontrada." });
      return;
    }

    if (meta.pacienteId !== req.user!.id) {
      res.status(403).json({ message: "Acesso negado." });
      return;
    }

    const [atualizada] = await db
      .update(metas)
      .set({ ...payload, atualizadoEm: new Date() })
      .where(eq(metas.id, id))
      .returning();

    res.json(atualizada);
  }
);

router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  const [meta] = await db
    .select()
    .from(metas)
    .where(eq(metas.id, id));

  if (!meta) {
    res.status(404).json({ message: "Meta não encontrada." });
    return;
  }

  if (meta.pacienteId !== req.user!.id) {
    res.status(403).json({ message: "Acesso negado." });
    return;
  }

  await db.delete(metas).where(eq(metas.id, id));

  res.status(204).send();
});

export default router;
