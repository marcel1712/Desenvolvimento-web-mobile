import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRegister } from "../hooks/auth/useRegister";

type ForcaInfo = { nivel: 0 | 1 | 2 | 3; label: string; cor: string };

function calcularForca(senha: string): ForcaInfo {
  if (senha.length === 0) return { nivel: 0, label: "", cor: "#e2e8f0" };
  const criterios = [
    senha.length >= 8,
    /[A-Z]/.test(senha),
    /[0-9]/.test(senha),
    /[^A-Za-z0-9]/.test(senha),
  ];
  const pontos = criterios.filter(Boolean).length;
  if (pontos <= 1) return { nivel: 1, label: "Fraca", cor: "#ef4444" };
  if (pontos <= 3) return { nivel: 2, label: "Média", cor: "#f59e0b" };
  return { nivel: 3, label: "Forte", cor: "#19c10f" };
}

export default function Register() {
  const [tipo, setTipo] = useState<"paciente" | "medico">("paciente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const { handleRegister, isLoading, error } = useRegister();

  const forca = calcularForca(senha);

  const requisitos = [
    { label: "Ao menos 8 caracteres", ok: senha.length >= 8 },
    { label: "Uma letra maiúscula", ok: /[A-Z]/.test(senha) },
    { label: "Um número", ok: /[0-9]/.test(senha) },
    { label: "Um caractere especial", ok: /[^A-Za-z0-9]/.test(senha) },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoIconText}>VG</Text>
        </View>
        <Text style={styles.logoText}>VitalGoal</Text>
      </View>

      <Text style={styles.title}>Primeiro passo 🚀</Text>
      <Text style={styles.subtitle}>
        Crie sua conta para agendar consultas.
      </Text>

      {/* Tipo selector */}
      <View style={styles.tipoContainer}>
        <Pressable
          style={[styles.tipoBtn, tipo === "paciente" && styles.tipoBtnActive]}
          onPress={() => setTipo("paciente")}
        >
          <Text
            style={[
              styles.tipoBtnText,
              tipo === "paciente" && styles.tipoBtnTextActive,
            ]}
          >
            🏃 Paciente
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tipoBtn, tipo === "medico" && styles.tipoBtnActive]}
          onPress={() => setTipo("medico")}
        >
          <Text
            style={[
              styles.tipoBtnText,
              tipo === "medico" && styles.tipoBtnTextActive,
            ]}
          >
            🩺 Médico
          </Text>
        </Pressable>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            tipo === "paciente" ? { width: "50%" } : { width: "100%" },
          ]}
        />
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Criar conta</Text>

        <Text style={styles.label}>Nome completo</Text>
        <TextInput
          placeholder="Seu nome completo"
          value={nome}
          onChangeText={setNome}
          style={[styles.input, nomeFocused && styles.inputFocused]}
          onFocus={() => setNomeFocused(true)}
          onBlur={() => setNomeFocused(false)}
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, emailFocused && styles.inputFocused]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#94a3b8"
        />

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="••••••••"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!senhaVisivel}
            style={[
              styles.input,
              styles.inputWithToggle,
              senhaFocused && styles.inputFocused,
            ]}
            onFocus={() => setSenhaFocused(true)}
            onBlur={() => setSenhaFocused(false)}
            placeholderTextColor="#94a3b8"
          />
          <Pressable
            style={styles.eyeBtn}
            onPress={() => setSenhaVisivel((v) => !v)}
          >
            <Text style={styles.eyeText}>
              {senhaVisivel ? "Ocultar" : "Mostrar"}
            </Text>
          </Pressable>
        </View>

        {senha.length > 0 && (
          <View style={styles.forcaContainer}>
            <View style={styles.forcaBarRow}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.forcaSegmento,
                    {
                      backgroundColor:
                        forca.nivel >= i ? forca.cor : "#e2e8f0",
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.forcaLabel, { color: forca.cor }]}>
              {forca.label}
            </Text>

            <View style={styles.requisitosContainer}>
              {requisitos.map((r) => (
                <Text
                  key={r.label}
                  style={[
                    styles.requisito,
                    r.ok ? styles.requisitoCumprido : styles.requisitoFaltando,
                  ]}
                >
                  {r.ok ? "✓" : "○"} {r.label}
                </Text>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.terms}>
          Ao criar conta, você concorda com os{" "}
          <Text style={styles.termsLink}>Termos e Condições</Text>
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.85 },
            isLoading && styles.buttonDisabled,
          ]}
          onPress={() => handleRegister({ nome, email, senha, tipo })}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.linkText}>
            Já tem uma conta? <Text style={styles.linkBold}>Fazer login</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 52,
    left: 24,
    gap: 8,
  },

  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#19c10f",
    alignItems: "center",
    justifyContent: "center",
  },

  logoIconText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 20,
    textAlign: "center",
  },

  tipoContainer: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
    gap: 4,
    width: "100%",
    maxWidth: 420,
  },

  tipoBtn: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  tipoBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  tipoBtnText: {
    color: "#64748b",
    fontWeight: "600",
    fontSize: 14,
  },

  tipoBtnTextActive: {
    color: "#0f172a",
  },

  progressBar: {
    width: "60%",
    maxWidth: 200,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 99,
    marginBottom: 20,
    overflow: "hidden",
  },

  progress: {
    height: 4,
    backgroundColor: "#19c10f",
    borderRadius: 99,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 20,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 14,
  },

  input: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: "#0f172a",
  },

  inputFocused: {
    borderColor: "#19c10f",
    backgroundColor: "#fff",
  },

  inputWrapper: {
    position: "relative",
  },

  inputWithToggle: {
    paddingRight: 80,
  },

  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },

  eyeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },

  forcaContainer: {
    marginTop: 10,
  },

  forcaBarRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 4,
  },

  forcaSegmento: {
    flex: 1,
    height: 4,
    borderRadius: 99,
  },

  forcaLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },

  requisitosContainer: {
    gap: 3,
  },

  requisito: {
    fontSize: 12,
  },

  requisitoCumprido: {
    color: "#19c10f",
    fontWeight: "500",
  },

  requisitoFaltando: {
    color: "#94a3b8",
  },

  terms: {
    marginTop: 14,
    fontSize: 12,
    color: "#64748b",
  },

  termsLink: {
    color: "#19c10f",
    fontWeight: "600",
  },

  errorBox: {
    marginTop: 12,
    backgroundColor: "#fef2f2",
    borderLeftWidth: 3,
    borderLeftColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
  },

  errorText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "500",
  },

  button: {
    backgroundColor: "#19c10f",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 18,
    shadowColor: "#19c10f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },

  linkRow: {
    marginTop: 18,
    alignItems: "center",
  },

  linkText: {
    fontSize: 14,
    color: "#64748b",
  },

  linkBold: {
    color: "#19c10f",
    fontWeight: "700",
  },
});
