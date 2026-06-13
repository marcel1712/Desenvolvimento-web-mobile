import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import { apiFetch } from "../lib/api";

export type Medico = {
  id: number;
  nome: string;
  email: string;
  tipo: "paciente" | "medico";
  googleConectado: boolean;
};

export function useMedicos() {
  const { token } = useAuth();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiFetch<Medico[]>("/api/users/medicos", { token })
      .then(setMedicos)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  return { medicos, isLoading, error };
}
