import { Router } from "express";
import type { Response } from "express";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { anamneses, consultas, usuarios } from "../db/schema";
import { authenticate } from "../middlewares/auth";
import type { AuthRequest } from "../middlewares/auth";

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

  const pacienteIds = pacientesRows.map((r) => r.pacienteId).filter(Boolean) as number[];

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

export default router;
