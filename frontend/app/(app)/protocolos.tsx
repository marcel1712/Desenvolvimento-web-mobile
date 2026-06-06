import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useProtocolos } from "../../hooks/useProtocolos";
import { useAuth } from "../../hooks/auth/useAuth";

export default function Protocolos() {
  const { protocolos, isLoading, error, createProtocolo } = useProtocolos();
  const { usuario } = useAuth();
  const [selected, setSelected] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const { width } = useWindowDimensions();

  const isMobile = width < 700;
  const isMedico = usuario?.tipo === "medico";

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

  if (isMedico) {
    return (
      <MedicoView
        protocolos={protocolos}
        search={search}
        setSearch={setSearch}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        createProtocolo={createProtocolo}
      />
    );
  }

  // Paciente view
  if (protocolos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>Nenhum protocolo encontrado</Text>
        <Text style={styles.emptySubtitle}>
          Protocolos criados pelo seu médico aparecerão aqui.
        </Text>
      </View>
    );
  }

  const sorted = [...protocolos].sort(
    (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
  );

  const filtrados = search
    ? sorted.filter(
        (p) =>
          p.titulo.toLowerCase().includes(search.toLowerCase()) ||
          p.medico.nome.toLowerCase().includes(search.toLowerCase()),
      )
    : sorted;

  const protocoloSelecionado = sorted[selected];

  const renderExercicios = () => {
    if (!protocoloSelecionado.conteudoExercicios) return null;
    let exercicios = protocoloSelecionado.conteudoExercicios;
    if (typeof exercicios === "string") {
      try { exercicios = JSON.parse(exercicios); } catch {
        return <Text style={styles.plainText}>{exercicios}</Text>;
      }
    }
    if (!Array.isArray(exercicios) || exercicios.length === 0) return null;
    return (
      <>
        <Text style={styles.section}>Exercícios</Text>
        {exercicios.map((ex, idx) => (
          <View key={idx} style={styles.contentItem}>
            <Text style={styles.contentTitle}>{ex.nome}</Text>
            {ex.series && <Text style={styles.contentText}>Séries: {ex.series}</Text>}
            {ex.duracao && <Text style={styles.contentText}>Duração: {ex.duracao}</Text>}
            {ex.frequencia && <Text style={styles.contentText}>Frequência: {ex.frequencia}</Text>}
            {ex.carga && <Text style={styles.contentText}>Carga: {ex.carga}</Text>}
          </View>
        ))}
      </>
    );
  };

  const renderDieta = () => {
    if (!protocoloSelecionado.conteudoDieta) return null;
    let dieta = protocoloSelecionado.conteudoDieta;
    if (typeof dieta === "string") {
      try { dieta = JSON.parse(dieta); } catch {
        return <Text style={styles.plainText}>{dieta}</Text>;
      }
    }
    if (!Array.isArray(dieta) || dieta.length === 0) return null;
    return (
      <>
        <Text style={styles.section}>Dieta</Text>
        {dieta.map((item, idx) => (
          <View key={idx} style={styles.contentItem}>
            <Text style={styles.contentTitle}>{item.refeicao || "Refeição"}</Text>
            {item.descricao && <Text style={styles.contentText}>{item.descricao}</Text>}
          </View>
        ))}
      </>
    );
  };

  const listPanel = (
    <View style={[styles.left, isMobile && styles.leftFull]}>
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
        {filtrados.map((item) => {
          const realIndex = sorted.indexOf(item);
          const isSelected = selected === realIndex;
          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.card,
                isSelected && !isMobile && styles.selectedCard,
                !isSelected && pressed && { opacity: 0.8 },
              ]}
              onPress={() => {
                setSelected(realIndex);
                if (isMobile) setShowDetail(true);
              }}
            >
              <Text style={[styles.cardTitle, isSelected && !isMobile && styles.selectedCardTitle]}>
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
  );

  const detailPanel = (
    <View style={[styles.right, isMobile && styles.rightFull]}>
      {isMobile && (
        <Pressable style={styles.backBtn} onPress={() => setShowDetail(false)}>
          <Text style={styles.backBtnText}>← Voltar</Text>
        </Pressable>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>{protocoloSelecionado.titulo}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {protocoloSelecionado.medico.nome}
              </Text>
            </View>
            {protocoloSelecionado.tipo && (
              <View style={[styles.metaBadge, { backgroundColor: "#f0fdf0" }]}>
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
                Total de calorias: {protocoloSelecionado.caloriasTotal} kcal
              </Text>
            </View>
          )}

          <View style={styles.footerMeta}>
            <Text style={styles.footerMetaText}>
              Criado em{" "}
              {new Date(protocoloSelecionado.criadoEm).toLocaleDateString("pt-BR")}
            </Text>
            <Text style={styles.footerMetaText}>
              Versão {protocoloSelecionado.versao}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );

  if (isMobile) {
    return (
      <View style={styles.containerMobile}>
        {showDetail ? detailPanel : listPanel}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {listPanel}
      <View style={styles.divider} />
      {detailPanel}
    </View>
  );
}

type Paciente = { id: number; nome: string };

type ExercicioForm = { nome: string; series: string; duracao: string; frequencia: string; carga: string };
type DietaForm = { refeicao: string; descricao: string };

type MedicoViewProps = {
  protocolos: ReturnType<typeof useProtocolos>["protocolos"];
  search: string;
  setSearch: (v: string) => void;
  searchFocused: boolean;
  setSearchFocused: (v: boolean) => void;
  createProtocolo: ReturnType<typeof useProtocolos>["createProtocolo"];
};

function MedicoView({
  protocolos,
  search,
  setSearch,
  searchFocused,
  setSearchFocused,
  createProtocolo,
}: MedicoViewProps) {
  const { token } = useAuth();
  const [step, setStep] = useState<"closed" | "pacientes" | "form">("closed");
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [pacienteSearch, setPacienteSearch] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("");
  const [calorias, setCalorias] = useState("");
  const [exercicios, setExercicios] = useState<ExercicioForm[]>([]);
  const [dieta, setDieta] = useState<DietaForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const grouped = protocolos.reduce<Record<number, { nome: string; items: typeof protocolos }>>(
    (acc, p) => {
      if (!p.paciente) return acc;
      const pid = p.paciente.id;
      if (!acc[pid]) acc[pid] = { nome: p.paciente.nome, items: [] };
      acc[pid].items.push(p);
      return acc;
    },
    {}
  );

  const filteredGroups = Object.entries(grouped).filter(([, g]) =>
    g.nome.toLowerCase().includes(search.toLowerCase())
  );

  const openPacientes = async () => {
    setStep("pacientes");
    setPacienteSearch("");
    setSelectedPaciente(null);
    setLoadingPacientes(true);
    try {
      const { apiFetch } = await import("../../lib/api");
      const data = await apiFetch<Paciente[]>("/api/consultas/pacientes", { token: token! });
      setPacientes(data);
    } catch {
      setPacientes([]);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const selectPaciente = (p: Paciente) => {
    setSelectedPaciente(p);
    setTitulo("");
    setTipo("");
    setCalorias("");
    setExercicios([]);
    setDieta([]);
    setFormError(null);
    setStep("form");
  };

  const close = () => {
    setStep("closed");
    setSelectedPaciente(null);
    setFormError(null);
  };

  const updateExercicio = (idx: number, field: keyof ExercicioForm, val: string) => {
    setExercicios((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e)));
  };

  const updateDieta = (idx: number, field: keyof DietaForm, val: string) => {
    setDieta((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d)));
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      setFormError("Título é obrigatório");
      return;
    }
    setSaving(true);
    try {
      await createProtocolo({
        pacienteId: selectedPaciente!.id,
        titulo: titulo.trim(),
        tipo: tipo.trim() || undefined,
        caloriasTotal: calorias ? parseInt(calorias, 10) : undefined,
        conteudoExercicios: exercicios.filter((e) => e.nome.trim()).map((e) => ({
          nome: e.nome.trim(),
          series: e.series.trim() || undefined,
          duracao: e.duracao.trim() || undefined,
          frequencia: e.frequencia.trim() || undefined,
          carga: e.carga.trim() || undefined,
        })),
        conteudoDieta: dieta.filter((d) => d.refeicao.trim()).map((d) => ({
          refeicao: d.refeicao.trim(),
          descricao: d.descricao.trim() || undefined,
        })),
      });
      close();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredPacientes = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(pacienteSearch.toLowerCase())
  );

  return (
    <View style={styles.containerMobile}>
      <View style={styles.leftFull}>
        <Text style={styles.title}>Protocolos por paciente</Text>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="Pesquisar paciente..."
            value={search}
            onChangeText={setSearch}
            style={[styles.search, styles.searchFlex, searchFocused && styles.searchFocused]}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity style={styles.addProtocolBtn} onPress={openPacientes}>
            <Text style={styles.addProtocolBtnText}>+ Protocolo</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredGroups.length === 0 && (
            <Text style={styles.emptySubtitle}>Nenhum paciente com protocolo.</Text>
          )}
          {filteredGroups.map(([pidStr, group]) => (
            <View key={pidStr} style={styles.patientGroup}>
              <View style={styles.patientHeader}>
                <Text style={styles.patientName}>{group.nome}</Text>
              </View>
              {group.items.map((p) => (
                <View key={p.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{p.titulo}</Text>
                  {p.tipo && <Text style={styles.cardMeta}>{p.tipo}</Text>}
                  <Text style={styles.cardMeta}>
                    {new Date(p.criadoEm).toLocaleDateString("pt-BR")} · v{p.versao}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Step 1: Select patient */}
      <Modal visible={step === "pacientes"} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Selecionar paciente</Text>

            <TextInput
              style={[styles.modalInput, { marginBottom: 12 }]}
              value={pacienteSearch}
              onChangeText={setPacienteSearch}
              placeholder="Buscar paciente..."
              placeholderTextColor="#94a3b8"
            />

            {loadingPacientes ? (
              <ActivityIndicator size="small" color="#19c10f" style={{ marginVertical: 16 }} />
            ) : filteredPacientes.length === 0 ? (
              <Text style={styles.emptySubtitle}>Nenhum paciente encontrado.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                {filteredPacientes.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.pacienteRow}
                    onPress={() => selectPaciente(p)}
                  >
                    <Text style={styles.pacienteRowText}>{p.nome}</Text>
                    <Text style={styles.pacienteRowArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={close}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Step 2: Create protocol form (full-screen) */}
      <Modal visible={step === "form"} animationType="slide" onRequestClose={() => setStep("pacientes")}>
        <View style={styles.formScreen}>
          <View style={styles.formHeader}>
            <TouchableOpacity style={styles.backLink} onPress={() => setStep("pacientes")}>
              <Text style={styles.backLinkText}>← Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.formScreenTitle}>Novo protocolo para {selectedPaciente?.nome}</Text>

            {formError && <Text style={styles.errorText}>{formError}</Text>}

            {/* Informações básicas */}
            <Text style={styles.formSectionTitle}>Informações</Text>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.modalInput}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Protocolo de emagrecimento"
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.inputLabel}>Tipo</Text>
              <TextInput
                style={styles.modalInput}
                value={tipo}
                onChangeText={setTipo}
                placeholder="Ex: dieta, fisioterapia, nutrição..."
                placeholderTextColor="#94a3b8"
              />
              <Text style={styles.inputLabel}>Calorias totais (kcal)</Text>
              <TextInput
                style={[styles.modalInput, { marginBottom: 0 }]}
                value={calorias}
                onChangeText={setCalorias}
                placeholder="Ex: 2000"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>

            {/* Exercícios */}
            <View style={styles.formSectionHeader}>
              <Text style={styles.formSectionTitle}>Exercícios</Text>
              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => setExercicios((prev) => [...prev, { nome: "", series: "", duracao: "", frequencia: "", carga: "" }])}
              >
                <Text style={styles.addItemBtnText}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>

            {exercicios.length === 0 && (
              <Text style={styles.emptySubtitle}>Nenhum exercício adicionado.</Text>
            )}

            {exercicios.map((ex, idx) => (
              <View key={idx} style={[styles.formCard, styles.itemCard]}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemCardIndex}>Exercício {idx + 1}</Text>
                  <TouchableOpacity onPress={() => setExercicios((prev) => prev.filter((_, i) => i !== idx))}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Nome *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={ex.nome}
                  onChangeText={(v) => updateExercicio(idx, "nome", v)}
                  placeholder="Ex: Caminhada"
                  placeholderTextColor="#94a3b8"
                />
                <View style={styles.twoCol}>
                  <View style={styles.colHalf}>
                    <Text style={styles.inputLabel}>Séries</Text>
                    <TextInput
                      style={[styles.modalInput, { marginBottom: 0 }]}
                      value={ex.series}
                      onChangeText={(v) => updateExercicio(idx, "series", v)}
                      placeholder="Ex: 3x12"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View style={styles.colHalf}>
                    <Text style={styles.inputLabel}>Duração</Text>
                    <TextInput
                      style={[styles.modalInput, { marginBottom: 0 }]}
                      value={ex.duracao}
                      onChangeText={(v) => updateExercicio(idx, "duracao", v)}
                      placeholder="Ex: 30min"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>
                <View style={[styles.twoCol, { marginTop: 8 }]}>
                  <View style={styles.colHalf}>
                    <Text style={styles.inputLabel}>Frequência</Text>
                    <TextInput
                      style={[styles.modalInput, { marginBottom: 0 }]}
                      value={ex.frequencia}
                      onChangeText={(v) => updateExercicio(idx, "frequencia", v)}
                      placeholder="Ex: 5x/semana"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  <View style={styles.colHalf}>
                    <Text style={styles.inputLabel}>Carga</Text>
                    <TextInput
                      style={[styles.modalInput, { marginBottom: 0 }]}
                      value={ex.carga}
                      onChangeText={(v) => updateExercicio(idx, "carga", v)}
                      placeholder="Ex: 10kg"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>
              </View>
            ))}

            {/* Dieta */}
            <View style={styles.formSectionHeader}>
              <Text style={styles.formSectionTitle}>Dieta</Text>
              <TouchableOpacity
                style={styles.addItemBtn}
                onPress={() => setDieta((prev) => [...prev, { refeicao: "", descricao: "" }])}
              >
                <Text style={styles.addItemBtnText}>+ Adicionar</Text>
              </TouchableOpacity>
            </View>

            {dieta.length === 0 && (
              <Text style={styles.emptySubtitle}>Nenhuma refeição adicionada.</Text>
            )}

            {dieta.map((item, idx) => (
              <View key={idx} style={[styles.formCard, styles.itemCard]}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemCardIndex}>Refeição {idx + 1}</Text>
                  <TouchableOpacity onPress={() => setDieta((prev) => prev.filter((_, i) => i !== idx))}>
                    <Text style={styles.removeText}>Remover</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Refeição *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={item.refeicao}
                  onChangeText={(v) => updateDieta(idx, "refeicao", v)}
                  placeholder="Ex: Almoço"
                  placeholderTextColor="#94a3b8"
                />
                <Text style={styles.inputLabel}>Descrição</Text>
                <TextInput
                  style={[styles.modalInput, styles.textArea, { marginBottom: 0 }]}
                  value={item.descricao}
                  onChangeText={(v) => updateDieta(idx, "descricao", v)}
                  placeholder="Ex: Frango grelhado com salada"
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    padding: 24,
  },

  containerMobile: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    gap: 8,
  },

  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#374151" },
  emptySubtitle: { fontSize: 13, color: "#94a3b8", textAlign: "center", maxWidth: 260, marginTop: 4 },

  left: {
    width: 280,
    paddingRight: 16,
  },

  leftFull: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  right: {
    flex: 1,
    paddingLeft: 16,
  },

  rightFull: {
    flex: 1,
    paddingLeft: 0,
    padding: 16,
  },

  backBtn: {
    paddingVertical: 10,
    marginBottom: 8,
  },

  backBtnText: {
    fontSize: 14,
    color: "#19c10f",
    fontWeight: "600",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
  },

  searchRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
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

  searchFlex: {
    flex: 1,
    marginBottom: 0,
  },

  searchFocused: { borderColor: "#19c10f" },

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

  cardTitle: { fontWeight: "600", marginBottom: 6, fontSize: 14, color: "#0f172a" },
  selectedCardTitle: { color: "#15803d" },
  cardMeta: { fontSize: 12, color: "#64748b", marginBottom: 2 },

  divider: { width: 1, backgroundColor: "#e2e8f0" },

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

  detailTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 12 },

  metaRow: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },

  metaBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },

  metaBadgeText: { fontSize: 13, color: "#475569", fontWeight: "500" },

  section: { marginTop: 20, marginBottom: 12, fontWeight: "700", fontSize: 15, color: "#0f172a" },

  contentItem: {
    marginBottom: 10,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#19c10f",
  },

  contentTitle: { fontWeight: "600", fontSize: 13, color: "#0f172a", marginBottom: 4 },
  contentText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  plainText: { fontSize: 13, color: "#374151", marginTop: 4 },

  caloriesBox: { marginTop: 20, backgroundColor: "#f0fdf0", padding: 14, borderRadius: 10 },
  caloriesText: { fontWeight: "700", fontSize: 14, color: "#15803d" },

  footerMeta: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  footerMetaText: { fontSize: 12, color: "#94a3b8" },
  errorText: { color: "#ef4444", fontSize: 13, marginBottom: 10 },

  // Medico-specific
  patientGroup: {
    marginBottom: 20,
  },

  patientHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },

  addProtocolBtn: {
    backgroundColor: "#19c10f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  addProtocolBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  pacienteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  pacienteRowText: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },

  pacienteRowArrow: {
    fontSize: 20,
    color: "#94a3b8",
  },

  backLink: {
    marginBottom: 12,
  },

  backLinkText: {
    fontSize: 14,
    color: "#19c10f",
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 480,
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  modalInput: {
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },

  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },

  cancelBtnText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },

  saveBtn: {
    backgroundColor: "#19c10f",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },

  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  // Full-screen form
  formScreen: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  formScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  formScreenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
  },

  formSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 4,
  },

  formSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
    marginTop: 16,
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#64748b",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  itemCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#19c10f",
  },

  itemCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  itemCardIndex: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },

  removeText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
  },

  addItemBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#19c10f",
  },

  addItemBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#19c10f",
  },

  twoCol: {
    flexDirection: "row",
    gap: 10,
  },

  colHalf: {
    flex: 1,
  },

  textArea: {
    minHeight: 72,
    textAlignVertical: "top",
  },
});
