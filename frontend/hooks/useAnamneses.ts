import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import { apiFetch } from "../lib/api";

export type AnamneseMedico = {
  id: number;
  pacienteId: number;
  pacienteNome: string;
  idade: number | null;
  peso: string | null;
  altura: string | null;
  bmi: string | null;
  condicoesSaude: string[] | null;
  alergias: string | null;
  horasSono: string | null;
  nivelAtividade: string | null;
  tipoAlimentacao: string[] | null;
  habitos: string[] | null;
  objetivo: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type AnamnesePaciente = {
  id: number;
  pacienteId: number;
  idade: number | null;
  peso: string | null;
  altura: string | null;
  bmi: string | null;
  condicoesSaude: string[] | null;
  alergias: string | null;
  horasSono: string | null;
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso" | null;
  tipoAlimentacao: string[] | null;
  habitos: string[] | null;
  objetivo: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

export type SalvarAnamneseInput = {
  idade?: number | null;
  peso?: string | null;
  altura?: string | null;
  bmi?: string | null;
  condicoesSaude?: string[] | null;
  alergias?: string | null;
  horasSono?: string | null;
  nivelAtividade?: "sedentario" | "leve" | "moderado" | "intenso" | null;
  tipoAlimentacao?: string[] | null;
  habitos?: string[] | null;
  objetivo?: string | null;
};

export function useAnamneses() {
  const { token } = useAuth();
  const [anamneses, setAnamneses] = useState<AnamneseMedico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiFetch<AnamneseMedico[]>("/api/anamneses", { token })
      .then(setAnamneses)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { anamneses, isLoading, error };
}

export function usePacienteAnamnese() {
  const { token } = useAuth();
  const [anamnese, setAnamnese] = useState<AnamnesePaciente | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiFetch<AnamnesePaciente | null>("/api/anamneses", { token })
      .then((data) => setAnamnese(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [token]);

  async function salvar(data: SalvarAnamneseInput) {
    if (!token) throw new Error("Não autenticado");
    setIsSaving(true);
    try {
      if (anamnese) {
        const updated = await apiFetch<AnamnesePaciente>(
          `/api/anamneses/${anamnese.id}`,
          { method: "PUT", token, body: JSON.stringify(data) }
        );
        setAnamnese(updated);
      } else {
        const created = await apiFetch<AnamnesePaciente>("/api/anamneses", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        });
        setAnamnese(created);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return { anamnese, isLoading, isSaving, salvar };
}
