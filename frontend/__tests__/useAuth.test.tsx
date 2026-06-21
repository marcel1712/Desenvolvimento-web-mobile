import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../hooks/auth/AuthContext";
import { useAuth } from "../hooks/auth/useAuth";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AuthProvider, null, children);
}

describe("useAuth", () => {
  it("dado uso dentro de AuthProvider, retorna o contexto de autenticação", async () => {
    const { result, unmount } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.logout).toBe("function");
    expect(result.current.token).toBeNull();
    expect(result.current.usuario).toBeNull();
    unmount();
  });

  it("dado AsyncStorage com dados salvos, retorna o token e usuário restaurados", async () => {
    const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
    const fakeToken = "stored-jwt";
    const fakeUser = { id: 1, nome: "Ana", email: "ana@test.com", tipo: "paciente" as const };

    mockAsyncStorage.getItem
      .mockResolvedValueOnce(fakeToken)
      .mockResolvedValueOnce(JSON.stringify(fakeUser));

    const { result, unmount } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.token).toBe(fakeToken);
    expect(result.current.usuario).toEqual(fakeUser);
    unmount();
  });
});
