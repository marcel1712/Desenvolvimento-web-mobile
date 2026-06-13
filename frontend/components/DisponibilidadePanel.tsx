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
  View,
} from "react-native";
import { useDisponibilidade } from "@/hooks/useDisponibilidade";
import { VGTheme } from "@/constants/theme";

type DiaSemana =
  | "domingo"
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado";

const DIAS_SEMANA: DiaSemana[] = [
  "domingo",
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
];

const DIA_LABELS: Record<DiaSemana, string> = {
  domingo: "Domingo",
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
};

const DIA_ABREV: Record<DiaSemana, string> = {
  domingo: "Dom",
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type DisponibilidadePanelProps = {
  visible: boolean;
  onClose: () => void;
};

export function DisponibilidadePanel({ visible, onClose }: DisponibilidadePanelProps) {
  const { slots, isLoading, error, addSlot, removeSlot } = useDisponibilidade();
  const [selectedDays, setSelectedDays] = useState<DiaSemana[]>([]);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [hourDraft, setHourDraft] = useState<string | null>(null);
  const [minuteDraft, setMinuteDraft] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const allDaysSelected = selectedDays.length === DIAS_SEMANA.length;

  const toggleDay = (dia: DiaSemana) => {
    setSelectedDays((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const toggleAllDays = () => {
    setSelectedDays(allDaysSelected ? [] : [...DIAS_SEMANA]);
  };

  const adjustHour = (delta: number) => {
    setHourDraft(null);
    setHour((prev) => (prev + delta + 24) % 24);
  };

  const adjustMinute = (delta: number) => {
    setMinuteDraft(null);
    setMinute((prev) => (prev + delta + 60) % 60);
  };

  const handleHourFocus = () => setHourDraft(String(hour).padStart(2, "0"));
  const handleHourChange = (text: string) => setHourDraft(text.replace(/[^0-9]/g, ""));
  const handleHourBlur = () => {
    if (hourDraft !== null) {
      const val = parseInt(hourDraft, 10);
      setHour(isNaN(val) ? 0 : clamp(val, 0, 23));
      setHourDraft(null);
    }
  };

  const handleMinuteFocus = () => setMinuteDraft(String(minute).padStart(2, "0"));
  const handleMinuteChange = (text: string) => setMinuteDraft(text.replace(/[^0-9]/g, ""));
  const handleMinuteBlur = () => {
    if (minuteDraft !== null) {
      const val = parseInt(minuteDraft, 10);
      setMinute(isNaN(val) ? 0 : clamp(val, 0, 59));
      setMinuteDraft(null);
    }
  };

  const slotsByDay = DIAS_SEMANA.reduce<Record<DiaSemana, typeof slots>>(
    (acc, dia) => {
      acc[dia] = slots
        .filter((s) => s.diaSemana === dia)
        .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
      return acc;
    },
    {
      domingo: [],
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: [],
      sabado: [],
    }
  );

  const handleAddSlot = async () => {
    if (selectedDays.length === 0) {
      setFormError("Selecione pelo menos um dia da semana");
      return;
    }

    const horarioInicio = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

    setFormError(null);
    setIsSaving(true);
    for (const dia of selectedDays) {
      const alreadyExists = slotsByDay[dia].some((s) => s.horarioInicio === horarioInicio);
      if (alreadyExists) continue;
      await addSlot({ diaSemana: dia, horarioInicio });
    }
    setIsSaving(false);
  };

  const handleRemoveSlot = async (id: number) => {
    await removeSlot(id);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Minha Disponibilidade</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {(error || formError) ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{formError ?? error}</Text>
            </View>
          ) : null}

          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>Adicionar horário</Text>

            <Text style={styles.fieldLabel}>Dias da semana</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity
                style={[styles.dayChip, allDaysSelected && styles.dayChipSelected]}
                onPress={toggleAllDays}
              >
                <Text style={[styles.dayChipText, allDaysSelected && styles.dayChipTextSelected]}>
                  Todos
                </Text>
              </TouchableOpacity>
              {DIAS_SEMANA.map((dia) => {
                const isSelected = selectedDays.includes(dia);
                return (
                  <TouchableOpacity
                    key={dia}
                    style={[styles.dayChip, isSelected && styles.dayChipSelected]}
                    onPress={() => toggleDay(dia)}
                  >
                    <Text style={[styles.dayChipText, isSelected && styles.dayChipTextSelected]}>
                      {DIA_ABREV[dia]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Horário</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustHour(-1)} activeOpacity={0.6}>
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.timeInput}
                  value={hourDraft ?? String(hour).padStart(2, "0")}
                  onFocus={handleHourFocus}
                  onChangeText={handleHourChange}
                  onBlur={handleHourBlur}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustHour(1)} activeOpacity={0.6}>
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              <View style={styles.timeField}>
                <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustMinute(-5)} activeOpacity={0.6}>
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.timeInput}
                  value={minuteDraft ?? String(minute).padStart(2, "0")}
                  onFocus={handleMinuteFocus}
                  onChangeText={handleMinuteChange}
                  onBlur={handleMinuteBlur}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <TouchableOpacity style={styles.stepperBtn} onPress={() => adjustMinute(5)} activeOpacity={0.6}>
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.timeHint}>
              Use os botões para ajustar (hora ±1, minutos ±5) ou digite o horário exato.
            </Text>

            <Pressable
              style={[styles.addButton, (isSaving || selectedDays.length === 0) && styles.buttonDisabled]}
              onPress={handleAddSlot}
              disabled={isSaving || selectedDays.length === 0}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={VGTheme.colors.surface} />
              ) : (
                <Text style={styles.addButtonText}>
                  + Adicionar
                  {selectedDays.length > 0
                    ? ` (${selectedDays.length} dia${selectedDays.length > 1 ? "s" : ""})`
                    : ""}
                </Text>
              )}
            </Pressable>
          </View>

          <ScrollView style={styles.slotsList} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={VGTheme.colors.primary}
                style={styles.loader}
              />
            ) : (
              DIAS_SEMANA.map((dia) => {
                const daySlots = slotsByDay[dia];
                if (daySlots.length === 0) return null;
                return (
                  <View key={dia} style={styles.daySection}>
                    <Text style={styles.dayLabel}>{DIA_LABELS[dia]}</Text>
                    {daySlots.map((slot) => (
                      <View key={slot.id} style={styles.slotRow}>
                        <Text style={styles.slotTime}>{slot.horarioInicio}</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveSlot(slot.id)}
                        >
                          <Text style={styles.removeButtonText}>Remover</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                );
              })
            )}

            {!isLoading && slots.length === 0 && (
              <Text style={styles.emptyText}>
                Nenhum horário cadastrado. Adicione seus horários disponíveis acima.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  panel: {
    backgroundColor: VGTheme.colors.surface,
    borderTopLeftRadius: VGTheme.radius.xl,
    borderTopRightRadius: VGTheme.radius.xl,
    padding: 24,
    maxHeight: "85%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: VGTheme.colors.textPrimary,
  },

  closeButton: {
    padding: 4,
  },

  closeButtonText: {
    fontSize: 18,
    color: VGTheme.colors.textTertiary,
    fontWeight: "700",
  },

  errorContainer: {
    backgroundColor: VGTheme.colors.errorBg,
    borderRadius: VGTheme.radius.sm,
    padding: 12,
    marginBottom: 12,
  },

  errorText: {
    color: VGTheme.colors.error,
    fontSize: 13,
  },

  formSection: {
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: VGTheme.colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: VGTheme.colors.textTertiary,
    marginBottom: 8,
  },

  pickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },

  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: VGTheme.radius.full,
    backgroundColor: VGTheme.colors.inputBg,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  dayChipSelected: {
    backgroundColor: VGTheme.colors.primaryLight,
    borderColor: VGTheme.colors.primary,
  },

  dayChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: VGTheme.colors.textSecondary,
  },

  dayChipTextSelected: {
    color: VGTheme.colors.successText,
    fontWeight: "700",
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },

  timeField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: VGTheme.colors.inputBg,
    borderRadius: VGTheme.radius.sm,
    overflow: "hidden",
  },

  stepperBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  stepperBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: VGTheme.colors.primary,
  },

  timeInput: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: VGTheme.colors.textPrimary,
    paddingVertical: 10,
  },

  timeSeparator: {
    fontSize: 18,
    fontWeight: "700",
    color: VGTheme.colors.textSecondary,
  },

  timeHint: {
    fontSize: 11,
    color: VGTheme.colors.textTertiary,
    marginBottom: 12,
  },

  addButton: {
    backgroundColor: VGTheme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: VGTheme.radius.sm,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  addButtonText: {
    color: VGTheme.colors.surface,
    fontWeight: "700",
    fontSize: 14,
  },

  slotsList: {
    flex: 1,
  },

  loader: {
    marginTop: 24,
  },

  daySection: {
    marginBottom: 16,
  },

  dayLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: VGTheme.colors.textPrimary,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  slotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: VGTheme.colors.inputBg,
    borderRadius: VGTheme.radius.sm,
    marginBottom: 6,
  },

  slotTime: {
    fontSize: 15,
    fontWeight: "600",
    color: VGTheme.colors.textPrimary,
  },

  removeButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: VGTheme.radius.sm,
    backgroundColor: VGTheme.colors.dangerBg,
  },

  removeButtonText: {
    color: VGTheme.colors.dangerText,
    fontSize: 12,
    fontWeight: "600",
  },

  emptyText: {
    textAlign: "center",
    color: VGTheme.colors.textTertiary,
    marginTop: 32,
    fontSize: 14,
    lineHeight: 20,
  },
});
