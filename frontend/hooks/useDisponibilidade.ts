import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/auth/useAuth";

type DiaSemana =
  | "domingo"
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";

export type DisponibilidadeSlot = {
  id: number;
  medicoId: number;
  diaSemana: DiaSemana;
  horarioInicio: string;
  criadoEm: string;
};

type AddSlotPayload = {
  diaSemana: DiaSemana;
  horarioInicio: string;
};

interface UseDisponibilidadeReturn {
  slots: DisponibilidadeSlot[];
  isLoading: boolean;
  error: string | null;
  addSlot: (payload: AddSlotPayload) => Promise<void>;
  removeSlot: (id: number) => Promise<void>;
}

export function useDatasDisponiveis(medicoId: number | null) {
  const { token } = useAuth();
  const [datas, setDatas] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!medicoId || !token) {
      setDatas(new Set());
      return;
    }

    const today = new Date();
    const inicio = new Date(today);
    inicio.setDate(today.getDate() + 1);
    const fim = new Date(today);
    fim.setDate(today.getDate() + 60);

    const pad = (n: number) => String(n).padStart(2, "0");
    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

    setIsLoading(true);
    apiFetch<string[]>(
      `/api/disponibilidade/datas-disponiveis?medicoId=${medicoId}&inicio=${fmt(inicio)}&fim=${fmt(fim)}`,
      { token }
    )
      .then((dates) => setDatas(new Set(dates)))
      .catch(() => setDatas(new Set()))
      .finally(() => setIsLoading(false));
  }, [medicoId, token]);

  return { datas, isLoading };
}

export function useDisponibilidade(): UseDisponibilidadeReturn {
  const { token } = useAuth();
  const [slots, setSlots] = useState<DisponibilidadeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      try {
        const result = await apiFetch<DisponibilidadeSlot[]>(
          "/api/disponibilidade",
          { token: token ?? undefined }
        );
        setSlots(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [token]);

  const addSlot = async (payload: AddSlotPayload): Promise<void> => {
    setError(null);
    try {
      const newSlot = await apiFetch<DisponibilidadeSlot>(
        "/api/disponibilidade",
        {
          method: "POST",
          body: JSON.stringify(payload),
          token: token ?? undefined,
        }
      );
      setSlots((prev) => [...prev, newSlot]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  };

  const removeSlot = async (id: number): Promise<void> => {
    setError(null);
    try {
      await apiFetch<void>(`/api/disponibilidade/${id}`, {
        method: "DELETE",
        token: token ?? undefined,
      });
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  };

  return { slots, isLoading, error, addSlot, removeSlot };
}
