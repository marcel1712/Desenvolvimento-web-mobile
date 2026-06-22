// backend/src/schemas/anamnese.schema.ts
import { z } from "zod";

export const anamneseSchema = z.object({
  idade: z.number().int().min(0).max(150).nullable().optional(),

  // O Drizzle mapeia 'numeric' como string, mas aceitamos número e transformamos
  // para string automaticamente caso o front-end envie como número.
  peso: z
    .union([z.string(), z.number()])
    .transform(String)
    .nullable()
    .optional(),
  altura: z
    .union([z.string(), z.number()])
    .transform(String)
    .nullable()
    .optional(),
  bmi: z
    .union([z.string(), z.number()])
    .transform(String)
    .nullable()
    .optional(),
  horasSono: z
    .union([z.string(), z.number()])
    .transform(String)
    .nullable()
    .optional(),

  // Mapeamento dos campos JSON (Arrays de Strings)
  condicoesSaude: z.array(z.string()).nullable().optional(),
  tipoAlimentacao: z.array(z.string()).nullable().optional(),
  habitos: z.array(z.string()).nullable().optional(),

  // Enums e Textos
  nivelAtividade: z.string().nullable().optional(), // Valida a string que bate com o enum do Postgres
  alergias: z
    .string()
    .max(5000, "O texto de alergias é muito longo")
    .nullable()
    .optional(),
  objetivo: z
    .string()
    .max(5000, "O texto de objetivo é muito longo")
    .nullable()
    .optional(),
});

export type AnamneseBody = z.infer<typeof anamneseSchema>;
