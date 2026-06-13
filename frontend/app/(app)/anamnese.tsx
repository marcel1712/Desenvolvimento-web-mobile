import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../../hooks/auth/useAuth";
import { useAnamneses, usePacienteAnamnese } from "../../hooks/useAnamneses";
import type { AnamneseMedico } from "../../hooks/useAnamneses";
import { useToast } from "../../hooks/useToast";

// ─── Medico view ────────────────────────────────────────────────────────────

function MedicoAnamnese() {
  const { anamneses, isLoading, error } = useAnamneses();
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selected, setSelected] = useState<AnamneseMedico | null>(null);

  const filtered = anamneses.filter((a) =>
    a.pacienteNome?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#19c10f" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro ao carregar anamneses</Text>
      </View>
    );
  }

  if (selected) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backBtn} onPress={() => setSelected(null)}>
          <Text style={styles.backBtnText}>← Voltar</Text>
        </Pressable>

        <Text style={styles.title}>{selected.pacienteNome}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados básicos</Text>
          <View style={styles.row}>
            <InfoItem label="Idade" value={selected.idade ? `${selected.idade} anos` : null} />
            <InfoItem label="Peso" value={selected.peso ? `${selected.peso} kg` : null} />
            <InfoItem label="Altura" value={selected.altura ? `${selected.altura} cm` : null} />
            <InfoItem label="IMC" value={selected.bmi ?? null} />
          </View>
        </View>

        {(selected.condicoesSaude?.length || selected.alergias) ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Histórico de saúde</Text>
            {selected.condicoesSaude?.length ? (
              <>
                <Text style={styles.label}>Condições</Text>
                <View style={styles.tagRow}>
                  {selected.condicoesSaude.map((c) => (
                    <View key={c} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>
                  ))}
                </View>
              </>
            ) : null}
            {selected.alergias ? (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Alergias</Text>
                <Text style={styles.value}>{selected.alergias}</Text>
              </>
            ) : null}
          </View>
        ) : null}

        {(selected.nivelAtividade || selected.tipoAlimentacao?.length || selected.habitos?.length || selected.horasSono) ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Estilo de vida</Text>
            {selected.horasSono ? (
              <InfoItem label="Horas de sono" value={`${selected.horasSono}h`} />
            ) : null}
            {selected.nivelAtividade ? (
              <InfoItem label="Atividade física" value={selected.nivelAtividade} />
            ) : null}
            {selected.tipoAlimentacao?.length ? (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Alimentação</Text>
                <View style={styles.tagRow}>
                  {selected.tipoAlimentacao.map((t) => (
                    <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
                  ))}
                </View>
              </>
            ) : null}
            {selected.habitos?.length ? (
              <>
                <Text style={[styles.label, { marginTop: 12 }]}>Hábitos</Text>
                <View style={styles.tagRow}>
                  {selected.habitos.map((h) => (
                    <View key={h} style={styles.tag}><Text style={styles.tagText}>{h}</Text></View>
                  ))}
                </View>
              </>
            ) : null}
          </View>
        ) : null}

        {selected.objetivo ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Objetivo</Text>
            <Text style={styles.value}>{selected.objetivo}</Text>
          </View>
        ) : null}

        <Text style={styles.footerMeta}>
          Atualizado em {new Date(selected.atualizadoEm).toLocaleDateString("pt-BR")}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anamneses</Text>

      <TextInput
        placeholder="Pesquisar paciente..."
        value={search}
        onChangeText={setSearch}
        style={[styles.searchInput, searchFocused && styles.searchFocused]}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        placeholderTextColor="#94a3b8"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <Text style={styles.emptyText}>
            {anamneses.length === 0
              ? "Nenhum paciente preencheu a anamnese ainda."
              : "Nenhum paciente encontrado."}
          </Text>
        )}

        {filtered.map((a) => (
          <Pressable
            key={a.id}
            style={({ pressed }) => [styles.card, styles.patientCard, pressed && { opacity: 0.8 }]}
            onPress={() => setSelected(a)}
          >
            <Text style={styles.patientName}>{a.pacienteNome}</Text>
            <View style={styles.summaryRow}>
              {a.idade ? <Text style={styles.summaryItem}>{a.idade} anos</Text> : null}
              {a.peso ? <Text style={styles.summaryItem}>{a.peso} kg</Text> : null}
              {a.altura ? <Text style={styles.summaryItem}>{a.altura} cm</Text> : null}
              {a.bmi ? <Text style={styles.summaryItem}>IMC {a.bmi}</Text> : null}
            </View>
            {a.objetivo ? (
              <Text style={styles.summaryObjective} numberOfLines={2}>{a.objetivo}</Text>
            ) : null}
            <Text style={styles.summaryDate}>
              {new Date(a.atualizadoEm).toLocaleDateString("pt-BR")}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function InfoItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

// ─── Patient view (existing form) ───────────────────────────────────────────

const HISTORICO_OPCOES = [
  "Hipertensão",
  "Diabetes",
  "Doença cardíaca",
  "Colesterol alto",
  "Problemas ortopédicos",
];

const ATIVIDADE_OPCOES = ["Sedentário", "Leve", "Moderado", "Intenso"];
const ALIMENTACAO_OPCOES = ["Vegetariana", "Vegana", "Low carb", "Omnívora"];
const HABITOS_OPCOES = [
  "Não fumo",
  "Fumo socialmente",
  "Fumante",
  "Não bebo",
  "Bebo socialmente",
];

const DISPLAY_TO_NIVEL: Record<string, "sedentario" | "leve" | "moderado" | "intenso"> = {
  "Sedentário": "sedentario",
  "Leve": "leve",
  "Moderado": "moderado",
  "Intenso": "intenso",
};

const NIVEL_TO_DISPLAY: Record<string, string> = {
  sedentario: "Sedentário",
  leve: "Leve",
  moderado: "Moderado",
  intenso: "Intenso",
};

function CheckGroup({
  opcoes,
  selected,
  onToggle,
}: {
  opcoes: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  return (
    <View style={check.grid}>
      {opcoes.map((item) => {
        const ativo = selected.includes(item);
        return (
          <Pressable
            key={item}
            style={({ pressed }) => [
              check.item,
              ativo && check.itemActive,
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => onToggle(item)}
          >
            <Text style={[check.icon, ativo && check.iconActive]}>
              {ativo ? "☑" : "☐"}
            </Text>
            <Text style={[check.label, ativo && check.labelActive]}>
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const check = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  itemActive: { borderColor: "#19c10f", backgroundColor: "#f0fdf0" },
  icon: { fontSize: 15, color: "#94a3b8" },
  iconActive: { color: "#19c10f" },
  label: { fontSize: 13, color: "#475569", fontWeight: "500" },
  labelActive: { color: "#15803d", fontWeight: "600" },
});

function PacienteAnamnese() {
  const { anamnese, isLoading, isSaving, salvar } = usePacienteAnamnese();
  const { showToast } = useToast();

  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [idadeFocused, setIdadeFocused] = useState(false);
  const [pesoFocused, setPesoFocused] = useState(false);
  const [alturaFocused, setAlturaFocused] = useState(false);
  const [objetivo, setObjetivo] = useState("");
  const [outro, setOutro] = useState("");
  const [alergias, setAlergias] = useState("");
  const [sono, setSono] = useState("");

  const [historico, setHistorico] = useState<string[]>([]);
  const [atividade, setAtividade] = useState<string[]>([]);
  const [alimentacao, setAlimentacao] = useState<string[]>([]);
  const [habitos, setHabitos] = useState<string[]>([]);

  useEffect(() => {
    if (!anamnese) return;
    setIdade(anamnese.idade != null ? String(anamnese.idade) : "");
    setPeso(anamnese.peso ?? "");
    setAltura(anamnese.altura ?? "");
    setObjetivo(anamnese.objetivo ?? "");
    setAlergias(anamnese.alergias ?? "");
    setSono(anamnese.horasSono ?? "");
    const conhecidas = anamnese.condicoesSaude?.filter((c) => HISTORICO_OPCOES.includes(c)) ?? [];
    const extra = anamnese.condicoesSaude?.filter((c) => !HISTORICO_OPCOES.includes(c)) ?? [];
    setHistorico(conhecidas);
    setOutro(extra.join(", "));
    if (anamnese.nivelAtividade) {
      const display = NIVEL_TO_DISPLAY[anamnese.nivelAtividade];
      setAtividade(display ? [display] : []);
    }
    setAlimentacao(anamnese.tipoAlimentacao ?? []);
    setHabitos(anamnese.habitos ?? []);
  }, [anamnese]);

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (item: string) =>
      setter((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
      );
  }

  const bmi =
    peso && altura
      ? (parseFloat(peso) / Math.pow(parseFloat(altura) / 100, 2)).toFixed(1)
      : "";

  async function handleSubmit() {
    const condicoesSaude = [
      ...historico,
      ...(outro.trim() ? [outro.trim()] : []),
    ];
    const nivelAtividade = atividade[0] ? (DISPLAY_TO_NIVEL[atividade[0]] ?? null) : null;
    const horasSono = sono.replace(/[^0-9.]/g, "") || null;
    const bmiCalc =
      peso && altura
        ? (parseFloat(peso) / Math.pow(parseFloat(altura) / 100, 2)).toFixed(2)
        : null;

    try {
      await salvar({
        idade: idade ? parseInt(idade, 10) : null,
        peso: peso || null,
        altura: altura || null,
        bmi: bmiCalc,
        condicoesSaude: condicoesSaude.length ? condicoesSaude : null,
        alergias: alergias || null,
        horasSono,
        nivelAtividade,
        tipoAlimentacao: alimentacao.length ? alimentacao : null,
        habitos: habitos.length ? habitos : null,
        objetivo: objetivo || null,
      });
      showToast("success", "Anamnese salva com sucesso!");
    } catch {
      showToast("error", "Erro ao salvar anamnese. Tente novamente.");
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#19c10f" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Anamnese</Text>
      <Text style={styles.subtitle}>
        Preencha os dados para que o médico te conheça melhor.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dados básicos</Text>
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Idade</Text>
            <TextInput
              style={[styles.input, idadeFocused && styles.inputFocused]}
              value={idade}
              onChangeText={setIdade}
              onFocus={() => setIdadeFocused(true)}
              onBlur={() => setIdadeFocused(false)}
              placeholder="Ex: 28"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={[styles.input, pesoFocused && styles.inputFocused]}
              value={peso}
              onChangeText={setPeso}
              onFocus={() => setPesoFocused(true)}
              onBlur={() => setPesoFocused(false)}
              placeholder="Ex: 75"
              placeholderTextColor="#94a3b8"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput
              style={[styles.input, alturaFocused && styles.inputFocused]}
              value={altura}
              onChangeText={setAltura}
              onFocus={() => setAlturaFocused(true)}
              onBlur={() => setAlturaFocused(false)}
              placeholder="Ex: 175"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>IMC</Text>
            <View style={[styles.input, styles.inputReadonly]}>
              <Text style={bmi ? styles.bmiValue : styles.bmiPlaceholder}>
                {bmi || "Cálculo automático"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Histórico de saúde</Text>
        <Text style={styles.label}>Condições pré-existentes</Text>
        <CheckGroup opcoes={HISTORICO_OPCOES} selected={historico} onToggle={toggle(setHistorico)} />
        <Text style={[styles.label, { marginTop: 16 }]}>Outro (especificar)</Text>
        <TextInput
          style={styles.inputLarge}
          value={outro}
          onChangeText={setOutro}
          placeholder="Descreva outras condições..."
          placeholderTextColor="#94a3b8"
          multiline
        />
        <Text style={[styles.label, { marginTop: 16 }]}>Alergias</Text>
        <TextInput
          style={styles.inputLarge}
          value={alergias}
          onChangeText={setAlergias}
          placeholder="Ex: Camarão, Amendoim..."
          placeholderTextColor="#94a3b8"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Estilo de vida</Text>
        <Text style={styles.label}>Média de horas de sono</Text>
        <TextInput
          style={styles.input}
          value={sono}
          onChangeText={setSono}
          placeholder="Ex: 8"
          placeholderTextColor="#94a3b8"
          keyboardType="decimal-pad"
        />
        <Text style={[styles.label, { marginTop: 16 }]}>Nível de atividade física</Text>
        <CheckGroup opcoes={ATIVIDADE_OPCOES} selected={atividade} onToggle={toggle(setAtividade)} />
        <Text style={[styles.label, { marginTop: 16 }]}>Alimentação</Text>
        <CheckGroup opcoes={ALIMENTACAO_OPCOES} selected={alimentacao} onToggle={toggle(setAlimentacao)} />
        <Text style={[styles.label, { marginTop: 16 }]}>Hábitos</Text>
        <CheckGroup opcoes={HABITOS_OPCOES} selected={habitos} onToggle={toggle(setHabitos)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Seus objetivos</Text>
        <TextInput
          style={styles.inputLarge}
          value={objetivo}
          onChangeText={setObjetivo}
          placeholder="Descreva seu objetivo com a consulta..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={4}
        />
      </View>

      <Pressable
        style={({ pressed }) => [styles.button, (pressed || isSaving) && { opacity: 0.85 }]}
        onPress={handleSubmit}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>
            {anamnese ? "Atualizar Anamnese" : "Enviar Anamnese"}
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function Anamnese() {
  const { usuario } = useAuth();

  if (usuario?.tipo === "medico") {
    return <MedicoAnamnese />;
  }

  return <PacienteAnamnese />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 24,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 11,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 14,
    color: "#0f172a",
  },

  searchFocused: { borderColor: "#19c10f" },

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

  patientCard: {
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },

  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 6,
  },

  summaryItem: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },

  summaryObjective: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },

  summaryDate: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  inputGroup: {
    flex: 1,
  },

  infoItem: {
    flex: 1,
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },

  value: {
    fontSize: 14,
    color: "#0f172a",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },

  tag: {
    backgroundColor: "#f0fdf0",
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  tagText: {
    fontSize: 12,
    color: "#15803d",
    fontWeight: "500",
  },

  footerMeta: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 32,
  },

  errorText: {
    fontSize: 14,
    color: "#ef4444",
  },

  backBtn: {
    paddingVertical: 8,
    marginBottom: 12,
  },

  backBtnText: {
    fontSize: 14,
    color: "#19c10f",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    color: "#0f172a",
  },

  inputFocused: { borderColor: "#19c10f", backgroundColor: "#fff" },

  inputReadonly: { justifyContent: "center" },

  bmiValue: { fontSize: 14, color: "#0f172a", fontWeight: "600" },

  bmiPlaceholder: { fontSize: 13, color: "#94a3b8" },

  inputLarge: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    color: "#0f172a",
    minHeight: 80,
    textAlignVertical: "top",
  },

  button: {
    backgroundColor: "#19c10f",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#19c10f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16, letterSpacing: 0.3 },
});
