import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";

export type Usuario = {
  id: number;
  nome: string;
  email: string;
  tipo: "paciente" | "medico";
};

type AuthContextType = {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, usuario: Usuario) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      // Lendo os dados de forma segura do hardware do dispositivo
      const storedToken = await SecureStore.getItemAsync("@vitalgoal:token");
      const storedUser = await SecureStore.getItemAsync("@vitalgoal:usuario");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUsuario(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }
    loadStoredAuth();
  }, []);

  async function login(newToken: string, newUsuario: Usuario) {
    // Salvando os dados de forma segura criptografada
    await SecureStore.setItemAsync("@vitalgoal:token", newToken);
    await SecureStore.setItemAsync(
      "@vitalgoal:usuario",
      JSON.stringify(newUsuario),
    );

    setToken(newToken);
    setUsuario(newUsuario);
  }

  async function logout() {
    // Apagando os dados do cofre seguro
    await SecureStore.deleteItemAsync("@vitalgoal:token");
    await SecureStore.deleteItemAsync("@vitalgoal:usuario");

    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
