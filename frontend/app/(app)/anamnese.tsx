import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
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
  itemActive: {
    borderColor: "#19c10f",
    backgroundColor: "#f0fdf0",
  },
  icon: {
    fontSize: 15,
    color: "#94a3b8",
  },
  iconActive: {
    color: "#19c10f",
  },
  label: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  labelActive: {
    color: "#15803d",
    fontWeight: "600",
  },
});

export default function Anamnese() {
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Anamnese</Text>
      <Text style={styles.subtitle}>
        Preencha os dados para que o médico te conheça melhor.
      </Text>

      {/* DADOS BÁSICOS */}
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

      {/* HISTÓRICO DE SAÚDE */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Histórico de saúde</Text>
        <Text style={styles.label}>Condições pré-existentes</Text>
        <CheckGroup
          opcoes={HISTORICO_OPCOES}
          selected={historico}
          onToggle={toggle(setHistorico)}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>
          Outro (especificar)
        </Text>
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

      {/* ESTILO DE VIDA */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Estilo de vida</Text>

        <Text style={styles.label}>Média de horas de sono</Text>
        <TextInput
          style={styles.input}
          value={sono}
          onChangeText={setSono}
          placeholder="Ex: 8h"
          placeholderTextColor="#94a3b8"
        />

        <Text style={[styles.label, { marginTop: 16 }]}>
          Nível de atividade física
        </Text>
        <CheckGroup
          opcoes={ATIVIDADE_OPCOES}
          selected={atividade}
          onToggle={toggle(setAtividade)}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Alimentação</Text>
        <CheckGroup
          opcoes={ALIMENTACAO_OPCOES}
          selected={alimentacao}
          onToggle={toggle(setAlimentacao)}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>Hábitos</Text>
        <CheckGroup
          opcoes={HABITOS_OPCOES}
          selected={habitos}
          onToggle={toggle(setHabitos)}
        />
      </View>

      {/* OBJETIVO */}
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

      {/* UPLOAD */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Arquivos</Text>
        <Pressable
          style={({ pressed }) => [
            styles.uploadBox,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text style={styles.uploadEmoji}>☁️</Text>
          <Text style={styles.uploadText}>
            Clique para adicionar ou arraste arquivos
          </Text>
          <Text style={styles.uploadSubtext}>PDF, JPG, PNG até 10MB</Text>
        </Pressable>
      </View>

      {/* BOTÃO */}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.buttonText}>Enviar Anamnese</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 24,
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

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
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

  inputFocused: {
    borderColor: "#19c10f",
    backgroundColor: "#fff",
  },

  inputReadonly: {
    justifyContent: "center",
  },

  bmiValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: "600",
  },

  bmiPlaceholder: {
    fontSize: 13,
    color: "#94a3b8",
  },

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

  uploadBox: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },

  uploadEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },

  uploadText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
    textAlign: "center",
  },

  uploadSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
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

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
