import * as SecureStore from "expo-secure-store";
import { createContext, useEffect, useState } from "react";
import { Platform } from "react-native";

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") { localStorage.setItem(key, value); return; }
  return SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") { localStorage.removeItem(key); return; }
  return SecureStore.deleteItemAsync(key);
}

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
      const storedToken = await getItem("vitalgoal_token");
      const storedUser = await getItem("vitalgoal_usuario");

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
    await setItem("vitalgoal_token", newToken);
    await setItem("vitalgoal_usuario", JSON.stringify(newUsuario));

    setToken(newToken);
    setUsuario(newUsuario);
  }

  async function logout() {
    // Apagando os dados do cofre seguro
    await deleteItem("vitalgoal_token");
    await deleteItem("vitalgoal_usuario");

    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
