import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import { apiFetch } from "../lib/api";
import type { Meta } from "./useMetas";

export function useMetasPaciente(pacienteId: number | null) {
  const { token } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || pacienteId === null) {
      setMetas([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    apiFetch<Meta[]>(`/api/metas/paciente/${pacienteId}`, { token })
      .then(setMetas)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token, pacienteId]);

  return { metas, isLoading, error };
}
