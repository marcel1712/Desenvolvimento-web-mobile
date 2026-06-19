import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
  email: z.string().email("E-mail inválido."),
  senha: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres.")
    .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula.")
    .regex(/[0-9]/, "Senha deve conter ao menos um número.")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter ao menos um caractere especial."),
  tipo: z.enum(["paciente", "medico"]),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  senha: z.string().min(1, "Senha é obrigatória."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido."),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
