import { Router } from "express";
import type { Response } from "express";
import { eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db";
import { protocolos, usuarios } from "../db/schema";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import type { AuthRequest } from "../middlewares/auth";
import { criarProtocoloSchema } from "../schemas/protocolo.schema";
import type { CriarProtocoloBody } from "../schemas/protocolo.schema";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthRequest, res: Response) => {
  const { id, tipo } = req.user!;

  const medicoAlias = alias(usuarios, "medico");
  const pacienteAlias = alias(usuarios, "paciente");

  const filtro =
    tipo === "paciente"
      ? eq(protocolos.pacienteId, id)
      : eq(protocolos.medicoId, id);

  const lista = await db
    .select({
      id: protocolos.id,
      titulo: protocolos.titulo,
      tipo: protocolos.tipo,
      conteudoExercicios: protocolos.conteudoExercicios,
      conteudoDieta: protocolos.conteudoDieta,
      caloriasTotal: protocolos.caloriasTotal,
      versao: protocolos.versao,
      criadoEm: protocolos.criadoEm,
      medico: {
        id: medicoAlias.id,
        nome: medicoAlias.nome,
      },
      paciente: {
        id: pacienteAlias.id,
        nome: pacienteAlias.nome,
      },
    })
    .from(protocolos)
    .leftJoin(medicoAlias, eq(medicoAlias.id, protocolos.medicoId))
    .leftJoin(pacienteAlias, eq(pacienteAlias.id, protocolos.pacienteId))
    .where(filtro);

  res.json(lista);
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  const [protocolo] = await db
    .select()
    .from(protocolos)
    .where(eq(protocolos.id, id));

  if (!protocolo) {
    res.status(404).json({ message: "Protocolo não encontrado." });
    return;
  }

  const pertenceAoUsuario =
    protocolo.pacienteId === req.user!.id ||
    protocolo.medicoId === req.user!.id;

  if (!pertenceAoUsuario) {
    res.status(403).json({ message: "Acesso negado." });
    return;
  }

  res.json(protocolo);
});

router.post(
  "/",
  validate(criarProtocoloSchema),
  async (req: AuthRequest, res: Response) => {
    if (req.user!.tipo !== "medico") {
      res.status(403).json({ message: "Apenas médicos podem criar protocolos." });
      return;
    }

    const { pacienteId, titulo, tipo, conteudoExercicios, conteudoDieta, caloriasTotal } =
      req.body as CriarProtocoloBody;

    const [paciente] = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.id, pacienteId));

    if (!paciente) {
      res.status(404).json({ message: "Paciente não encontrado." });
      return;
    }

    const medicoAlias = alias(usuarios, "medico");
    const pacienteAlias = alias(usuarios, "paciente");

    const [inserted] = await db
      .insert(protocolos)
      .values({
        medicoId: req.user!.id,
        pacienteId,
        titulo,
        tipo,
        conteudoExercicios,
        conteudoDieta,
        caloriasTotal,
      })
      .returning({ id: protocolos.id });

    const [protocolo] = await db
      .select({
        id: protocolos.id,
        titulo: protocolos.titulo,
        tipo: protocolos.tipo,
        conteudoExercicios: protocolos.conteudoExercicios,
        conteudoDieta: protocolos.conteudoDieta,
        caloriasTotal: protocolos.caloriasTotal,
        versao: protocolos.versao,
        criadoEm: protocolos.criadoEm,
        medico: { id: medicoAlias.id, nome: medicoAlias.nome },
        paciente: { id: pacienteAlias.id, nome: pacienteAlias.nome },
      })
      .from(protocolos)
      .leftJoin(medicoAlias, eq(medicoAlias.id, protocolos.medicoId))
      .leftJoin(pacienteAlias, eq(pacienteAlias.id, protocolos.pacienteId))
      .where(eq(protocolos.id, inserted.id));

    res.status(201).json(protocolo);
  }
);

export default router;
