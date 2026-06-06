import { useState } from "react";
import { useAuth } from "./auth/useAuth";
import { apiFetch } from "../lib/api";
import type { UserProfile } from "./useUserProfile";

export interface UpdateProfilePayload {
  nome?: string;
  telefone?: string;
  fotoUrl?: string;
}

export interface UseUpdateProfileReturn {
  isLoading: boolean;
  error: string | null;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>;
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await apiFetch<UserProfile>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(payload),
        token: token ?? undefined,
      });
      return updated;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, updateProfile };
}
