import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useConsultas } from "../../hooks/useConsultas";
import { useModal } from "../../hooks/useModal";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Concluído: { bg: "#dcfce7", text: "#15803d" },
    Concluida: { bg: "#dcfce7", text: "#15803d" },
    Pendente: { bg: "#fef3c7", text: "#b45309" },
    Agendado: { bg: "#dbeafe", text: "#1d4ed8" },
    Cancelado: { bg: "#fee2e2", text: "#b91c1c" },
    Aprovado: { bg: "#dcfce7", text: "#15803d" },
  };
  const style = map[status] ?? { bg: "#f1f5f9", text: "#475569" };
  return (
    <View style={[badge.pill, { backgroundColor: style.bg }]}>
      <Text style={[badge.text, { color: style.text }]}>{status}</Text>
    </View>
  );
}

const badge = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default function Consultas() {
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { setOpenModal } = useModal();
  const { consultas, isLoading, error } = useConsultas();

  const consultasFiltradas = consultas.filter((consulta) => {
    const q = searchText.toLowerCase();
    return (
      consulta.paciente.nome.toLowerCase().includes(q) ||
      consulta.status.toLowerCase().includes(q) ||
      consulta.tipo.toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#19c10f" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erro ao carregar consultas</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Próximas consultas</Text>

      {/* Barra de ações */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="Buscar por nome, tipo ou status..."
          placeholderTextColor="#94a3b8"
          style={[styles.search, searchFocused && styles.searchFocused]}
          value={searchText}
          onChangeText={setSearchText}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />

        <Pressable
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
          onPress={() => setOpenModal(true)}
        >
          <Text style={styles.buttonText}>＋ Agendar</Text>
        </Pressable>
      </View>

      {/* Lista */}
      {consultas.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>Nenhuma consulta agendada</Text>
          <Text style={styles.emptySubtitle}>
            Clique em "＋ Agendar" para criar sua primeira consulta.
          </Text>
        </View>
      ) : consultasFiltradas.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Nenhum resultado</Text>
          <Text style={styles.emptySubtitle}>Tente outro termo de busca.</Text>
        </View>
      ) : (
        consultasFiltradas.map((consulta) => (
          <View key={consulta.id} style={styles.card}>
            {/* Header do card */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{consulta.paciente.nome}</Text>
              <StatusBadge status={consulta.status} />
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Data / Horário</Text>
                <Text style={styles.infoValue}>
                  {new Date(consulta.dataHora).toLocaleDateString("pt-BR")} •{" "}
                  {new Date(consulta.dataHora).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Tipo</Text>
                <Text style={styles.infoValue}>{consulta.tipo}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Pagamento</Text>
                <StatusBadge status={consulta.statusPagamento} />
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Pressable
                style={({ pressed }) => [
                  styles.docBtn,
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Text style={styles.docBtnText}>📄 Ver documentos</Text>
              </Pressable>

              {consulta.tipo === "teleconsulta" && (
                <Pressable
                  style={({ pressed }) => [
                    styles.meetBtn,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.meetBtnText}>🎥 Entrar via meet</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f8fafc",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
  },

  topBar: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    alignItems: "center",
  },

  search: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    color: "#0f172a",
  },

  searchFocused: {
    borderColor: "#19c10f",
  },

  button: {
    backgroundColor: "#19c10f",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: "#19c10f",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#64748b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
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

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#64748b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  cardName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#0f172a",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },

  infoItem: {
    flex: 1,
    minWidth: 120,
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },

  cardFooter: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 14,
  },

  docBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },

  docBtnText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },

  meetBtn: {
    backgroundColor: "#19c10f",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    shadowColor: "#19c10f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  meetBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
});
