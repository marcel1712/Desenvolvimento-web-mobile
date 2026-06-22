import { eq, inArray } from "drizzle-orm";
import type { Response } from "express";
import { Router } from "express";
import { db } from "../db";
import { anamneses, consultas, usuarios } from "../db/schema";
import type { AuthRequest } from "../middlewares/auth";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import type { AnamneseBody } from "../schemas/anamnese.schema";
import { anamneseSchema } from "../schemas/anamnese.schema";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { id, tipo } = req.user!;

  if (tipo === "paciente") {
    const [anamnese] = await db
      .select()
      .from(anamneses)
      .where(eq(anamneses.pacienteId, id));

    res.json(anamnese ?? null);
    return;
  }

  // Medico: fetch anamneses of all their patients
  const pacientesRows = await db
    .selectDistinct({ pacienteId: consultas.pacienteId })
    .from(consultas)
    .where(eq(consultas.medicoId, id));

  if (pacientesRows.length === 0) {
    res.json([]);
    return;
  }

  const pacienteIds = pacientesRows
    .map((r) => r.pacienteId)
    .filter(Boolean) as number[];

  const lista = await db
    .select({
      id: anamneses.id,
      pacienteId: anamneses.pacienteId,
      pacienteNome: usuarios.nome,
      idade: anamneses.idade,
      peso: anamneses.peso,
      altura: anamneses.altura,
      bmi: anamneses.bmi,
      condicoesSaude: anamneses.condicoesSaude,
      alergias: anamneses.alergias,
      horasSono: anamneses.horasSono,
      nivelAtividade: anamneses.nivelAtividade,
      tipoAlimentacao: anamneses.tipoAlimentacao,
      habitos: anamneses.habitos,
      objetivo: anamneses.objetivo,
      criadoEm: anamneses.criadoEm,
      atualizadoEm: anamneses.atualizadoEm,
    })
    .from(anamneses)
    .leftJoin(usuarios, eq(usuarios.id, anamneses.pacienteId))
    .where(inArray(anamneses.pacienteId, pacienteIds));

  res.json(lista);
});

router.post(
  "/",
  validate(anamneseSchema), // <-- SEGURANÇA: Bloqueia dados inválidos ou injeções aqui
  async (req: AuthRequest, res: Response) => {
    const { id, tipo } = req.user!;

    if (tipo !== "paciente") {
      res
        .status(403)
        .json({ message: "Apenas pacientes podem criar anamneses" });
      return;
    }

    const [existing] = await db
      .select({ id: anamneses.id })
      .from(anamneses)
      .where(eq(anamneses.pacienteId, id));

    if (existing) {
      res
        .status(409)
        .json({ message: "Anamnese já existe. Use PUT para atualizar." });
      return;
    }

    // Usando o corpo da requisição já validado e higienizado pelo Zod
    const body = req.body as AnamneseBody;

    const [created] = await db
      .insert(anamneses)
      .values({
        pacienteId: id,
        idade: body.idade ?? null,
        peso: body.peso ?? null,
        altura: body.altura ?? null,
        bmi: body.bmi ?? null,
        condicoesSaude: body.condicoesSaude ?? null,
        alergias: body.alergias ?? null,
        horasSono: body.horasSono ?? null,
        nivelAtividade: (body.nivelAtividade as any) ?? null, // Cast seguro para bater com o enum do banco
        tipoAlimentacao: body.tipoAlimentacao ?? null,
        habitos: body.habitos ?? null,
        objetivo: body.objetivo ?? null,
      })
      .returning();

    res.status(201).json(created);
  },
);

router.put(
  "/:id",
  validate(anamneseSchema), // <-- SEGURANÇA: Validação também na atualização
  async (req: AuthRequest, res: Response) => {
    const { id: userId, tipo } = req.user!;

    if (tipo !== "paciente") {
      res
        .status(403)
        .json({ message: "Apenas pacientes podem atualizar anamneses" });
      return;
    }

    const anamneseId = Number(req.params.id);

    const [existing] = await db
      .select({ id: anamneses.id, pacienteId: anamneses.pacienteId })
      .from(anamneses)
      .where(eq(anamneses.id, anamneseId));

    if (!existing || existing.pacienteId !== userId) {
      res.status(404).json({ message: "Anamnese não encontrada" });
      return;
    }

    // Usando o corpo da requisição já validado e higienizado pelo Zod
    const body = req.body as AnamneseBody;

    const [updated] = await db
      .update(anamneses)
      .set({
        idade: body.idade ?? null,
        peso: body.peso ?? null,
        altura: body.altura ?? null,
        bmi: body.bmi ?? null,
        condicoesSaude: body.condicoesSaude ?? null,
        alergias: body.alergias ?? null,
        horasSono: body.horasSono ?? null,
        nivelAtividade: (body.nivelAtividade as any) ?? null,
        tipoAlimentacao: body.tipoAlimentacao ?? null,
        habitos: body.habitos ?? null,
        objetivo: body.objetivo ?? null,
        atualizadoEm: new Date(),
      })
      .where(eq(anamneses.id, anamneseId))
      .returning();

    res.json(updated);
  },
);

export default router;
