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
import { useProtocolos } from "../../hooks/useProtocolos";

export default function Protocolos() {
  const { protocolos, isLoading, error } = useProtocolos();
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
        <Text style={styles.errorText}>Erro ao carregar protocolos</Text>
      </View>
    );
  }

  if (protocolos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>Nenhum protocolo encontrado</Text>
        <Text style={styles.emptySubtitle}>
          Protocolos criados pelo seu médico aparecerão aqui.
        </Text>
      </View>
    );
  }

  const filtrados = search
    ? protocolos.filter(
        (p) =>
          p.titulo.toLowerCase().includes(search.toLowerCase()) ||
          p.medico.nome.toLowerCase().includes(search.toLowerCase()),
      )
    : protocolos;

  const protocoloSelecionado = protocolos[selected];

  const renderExercicios = () => {
    if (!protocoloSelecionado.conteudoExercicios) return null;

    let exercicios = protocoloSelecionado.conteudoExercicios;
    if (typeof exercicios === "string") {
      try {
        exercicios = JSON.parse(exercicios);
      } catch {
        return <Text style={styles.plainText}>{exercicios}</Text>;
      }
    }

    if (!Array.isArray(exercicios) || exercicios.length === 0) return null;

    return (
      <>
        <Text style={styles.section}>💪 Exercícios</Text>
        {exercicios.map((ex, idx) => (
          <View key={idx} style={styles.contentItem}>
            <Text style={styles.contentTitle}>{ex.nome}</Text>
            {ex.series && (
              <Text style={styles.contentText}>Séries: {ex.series}</Text>
            )}
            {ex.duracao && (
              <Text style={styles.contentText}>Duração: {ex.duracao}</Text>
            )}
            {ex.frequencia && (
              <Text style={styles.contentText}>
                Frequência: {ex.frequencia}
              </Text>
            )}
            {ex.carga && (
              <Text style={styles.contentText}>Carga: {ex.carga}</Text>
            )}
          </View>
        ))}
      </>
    );
  };

  const renderDieta = () => {
    if (!protocoloSelecionado.conteudoDieta) return null;

    let dieta = protocoloSelecionado.conteudoDieta;
    if (typeof dieta === "string") {
      try {
        dieta = JSON.parse(dieta);
      } catch {
        return <Text style={styles.plainText}>{dieta}</Text>;
      }
    }

    if (!Array.isArray(dieta) || dieta.length === 0) return null;

    return (
      <>
        <Text style={styles.section}>🥗 Dieta</Text>
        {dieta.map((item, idx) => (
          <View key={idx} style={styles.contentItem}>
            <Text style={styles.contentTitle}>
              {item.refeicao || "Refeição"}
            </Text>
            {item.descricao && (
              <Text style={styles.contentText}>{item.descricao}</Text>
            )}
          </View>
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* LISTA LATERAL */}
      <View style={styles.left}>
        <Text style={styles.title}>Meus protocolos</Text>

        <TextInput
          placeholder="Pesquisar..."
          value={search}
          onChangeText={setSearch}
          style={[styles.search, searchFocused && styles.searchFocused]}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholderTextColor="#94a3b8"
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {filtrados.map((item, index) => {
            const realIndex = protocolos.indexOf(item);
            const isSelected = selected === realIndex;
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.card,
                  isSelected && styles.selectedCard,
                  !isSelected && pressed && { opacity: 0.8 },
                ]}
                onPress={() => setSelected(realIndex)}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    isSelected && styles.selectedCardTitle,
                  ]}
                >
                  {item.titulo}
                </Text>
                <Text style={styles.cardMeta}>
                  {new Date(item.criadoEm).toLocaleDateString("pt-BR")}
                </Text>
                <Text style={styles.cardMeta}>Dr(a). {item.medico.nome}</Text>
                <Text style={styles.cardMeta}>v{item.versao}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* DIVISOR */}
      <View style={styles.divider} />

      {/* DETALHE */}
      <View style={styles.right}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>
              {protocoloSelecionado.titulo}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>
                  👨‍⚕️ {protocoloSelecionado.medico.nome}
                </Text>
              </View>
              {protocoloSelecionado.tipo && (
                <View
                  style={[styles.metaBadge, { backgroundColor: "#f0fdf0" }]}
                >
                  <Text style={[styles.metaBadgeText, { color: "#15803d" }]}>
                    {protocoloSelecionado.tipo}
                  </Text>
                </View>
              )}
            </View>

            {renderExercicios()}
            {renderDieta()}

            {protocoloSelecionado.caloriasTotal && (
              <View style={styles.caloriesBox}>
                <Text style={styles.caloriesText}>
                  🔥 Total de calorias: {protocoloSelecionado.caloriasTotal}{" "}
                  kcal
                </Text>
              </View>
            )}

            <View style={styles.footerMeta}>
              <Text style={styles.footerMetaText}>
                Criado em{" "}
                {new Date(protocoloSelecionado.criadoEm).toLocaleDateString(
                  "pt-BR",
                )}
              </Text>
              <Text style={styles.footerMetaText}>
                Versão {protocoloSelecionado.versao}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    padding: 24,
    gap: 0,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 8,
  },

  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: 260,
  },

  left: {
    width: 280,
    paddingRight: 16,
  },

  right: {
    flex: 1,
    paddingLeft: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
  },

  search: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 11,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
    color: "#0f172a",
  },

  searchFocused: {
    borderColor: "#19c10f",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#64748b",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },

  selectedCard: {
    borderLeftColor: "#19c10f",
    backgroundColor: "#f0fdf0",
  },

  cardTitle: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 14,
    color: "#0f172a",
  },

  selectedCardTitle: {
    color: "#15803d",
  },

  cardMeta: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },

  divider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },

  detailCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#64748b",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  detailTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },

  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  metaBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },

  metaBadgeText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },

  section: {
    marginTop: 20,
    marginBottom: 12,
    fontWeight: "700",
    fontSize: 15,
    color: "#0f172a",
  },

  contentItem: {
    marginBottom: 10,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#19c10f",
  },

  contentTitle: {
    fontWeight: "600",
    fontSize: 13,
    color: "#0f172a",
    marginBottom: 4,
  },

  contentText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  plainText: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
  },

  caloriesBox: {
    marginTop: 20,
    backgroundColor: "#f0fdf0",
    padding: 14,
    borderRadius: 10,
  },

  caloriesText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#15803d",
  },

  footerMeta: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerMetaText: {
    fontSize: 12,
    color: "#94a3b8",
  },

  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
  },
});
