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
