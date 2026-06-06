import { useEffect, useState } from "react";
import { useAuth } from "./auth/useAuth";
import { apiFetch } from "../lib/api";

export type Meta = {
  id: number;
  pacienteId: number;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export interface UseMetasReturn {
  metas: Meta[];
  isLoading: boolean;
  error: string | null;
  createMeta: (payload: { titulo: string; descricao?: string }) => Promise<Meta>;
  updateMeta: (id: number, payload: { titulo?: string; descricao?: string; concluida?: boolean }) => Promise<Meta>;
  deleteMeta: (id: number) => Promise<void>;
}

export function useMetas(): UseMetasReturn {
  const { token } = useAuth();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    apiFetch<Meta[]>("/api/metas", { token })
      .then(setMetas)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  async function createMeta(payload: { titulo: string; descricao?: string }): Promise<Meta> {
    const nova = await apiFetch<Meta>("/api/metas", {
      method: "POST",
      body: JSON.stringify(payload),
      token: token ?? undefined,
    });
    setMetas((prev) => [...prev, nova]);
    return nova;
  }

  async function updateMeta(
    id: number,
    payload: { titulo?: string; descricao?: string; concluida?: boolean }
  ): Promise<Meta> {
    const atualizada = await apiFetch<Meta>(`/api/metas/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      token: token ?? undefined,
    });
    setMetas((prev) => prev.map((m) => (m.id === id ? atualizada : m)));
    return atualizada;
  }

  async function deleteMeta(id: number): Promise<void> {
    await apiFetch<void>(`/api/metas/${id}`, {
      method: "DELETE",
      token: token ?? undefined,
    });
    setMetas((prev) => prev.filter((m) => m.id !== id));
  }

  return { metas, isLoading, error, createMeta, updateMeta, deleteMeta };
}
