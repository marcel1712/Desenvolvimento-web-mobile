import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useUserProfile } from "../../hooks/useUserProfile";

type Tab = "dados" | "historico" | "metas";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Perfil() {
  const [tab, setTab] = useState<Tab>("dados");
  const { profile, isLoading, error } = useUserProfile();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#19c10f" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro ao carregar perfil</Text>
      </View>
    );
  }

  const tipoLabel = profile.tipo === "paciente" ? "Paciente" : "Médico";
  const tipoEmoji = profile.tipo === "paciente" ? "🏃" : "🩺";

  const TABS: { key: Tab; label: string }[] = [
    { key: "dados", label: "Dados pessoais" },
    { key: "historico", label: "Histórico de saúde" },
    { key: "metas", label: "Metas" },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(profile.nome)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.nome}</Text>
          <View style={styles.tipoBadge}>
            <Text style={styles.tipoBadgeText}>
              {tipoEmoji} {tipoLabel}
            </Text>
          </View>
          <Text style={styles.email}>{profile.email}</Text>
        </View>
      </View>

      {/* Card com tabs */}
      <View style={styles.card}>
        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map(({ key, label }) => (
            <Pressable
              key={key}
              style={[styles.tab, tab === key && styles.tabActive]}
              onPress={() => setTab(key)}
            >
              <Text
                style={[styles.tabText, tab === key && styles.tabTextActive]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Conteúdo */}
        {tab === "dados" && (
          <View style={styles.tabContent}>
            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nome completo</Text>
                <Text style={styles.fieldValue}>{profile.nome}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Tipo de conta</Text>
                <Text style={styles.fieldValue}>{tipoLabel}</Text>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>E-mail</Text>
                <Text style={styles.fieldValue}>{profile.email}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Telefone</Text>
                <Text style={styles.fieldValue}>
                  {profile.telefone || "Não informado"}
                </Text>
              </View>
            </View>

            <View style={styles.fieldRow}>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Membro desde</Text>
                <Text style={styles.fieldValue}>
                  {new Date(profile.criadoEm).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>
        )}

        {tab === "historico" && (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyEmoji}>🏥</Text>
            <Text style={styles.emptyTitle}>Em breve</Text>
            <Text style={styles.emptySubtitle}>
              O histórico de saúde estará disponível em breve.
            </Text>
          </View>
        )}

        {tab === "metas" && (
          <View style={styles.emptyTab}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>Em breve</Text>
            <Text style={styles.emptySubtitle}>
              A seção de metas estará disponível em breve.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 24,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#64748b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 16,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#19c10f",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 22,
  },

  headerInfo: {
    flex: 1,
    gap: 4,
  },

  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  tipoBadge: {
    backgroundColor: "#f0fdf0",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },

  tipoBadgeText: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "600",
  },

  email: {
    color: "#64748b",
    fontSize: 13,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#64748b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
  },

  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  tabActive: {
    borderBottomColor: "#19c10f",
  },

  tabText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },

  tabTextActive: {
    color: "#19c10f",
    fontWeight: "700",
  },

  tabContent: {
    padding: 24,
    gap: 20,
  },

  fieldRow: {
    flexDirection: "row",
    gap: 16,
  },

  field: {
    flex: 1,
  },

  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  fieldValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "500",
  },

  emptyTab: {
    padding: 48,
    alignItems: "center",
  },

  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
  },

  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
});
