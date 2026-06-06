import { z } from "zod";

export const createMetaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório.").max(255),
  descricao: z.string().optional(),
});

export const updateMetaSchema = z.object({
  titulo: z.string().min(1).max(255).optional(),
  descricao: z.string().optional(),
  concluida: z.boolean().optional(),
});

export type CreateMetaBody = z.infer<typeof createMetaSchema>;
export type UpdateMetaBody = z.infer<typeof updateMetaSchema>;
