import { z } from "zod";

export const consultaIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ConsultaIdParam = z.infer<typeof consultaIdParamSchema>;
