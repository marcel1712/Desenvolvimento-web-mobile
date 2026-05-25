import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Sidebar from "../../components/sidebar";
import { useAuth } from "../../hooks/auth/useAuth";
import { useAgendarConsulta } from "../../hooks/useAgendarConsulta";
import { useMedicos } from "../../hooks/useMedicos";
import { useModal } from "../../hooks/useModal";

export default function AppLayout() {
  const { token, isLoading } = useAuth();
  const { openModal, setOpenModal } = useModal();
  const { medicos, isLoading: loadingMedicos } = useMedicos();
  const { agendar, isLoading: agendando } = useAgendarConsulta();

  // modal
  const [openSidebar, setOpenSidebar] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "presencial" | "teleconsulta"
  >("presencial");

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#19c10f" />
      </View>
    );
  }

  // if (!token) {
  //   return <Redirect href="/login" />;
  // }

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const selectedDoctor = medicos.find((m) => m.id === selectedDoctorId);

  const handleAgendar = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedTime) {
      alert("Selecione médico, data e horário");
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const dataHora = new Date(selectedDate);
    dataHora.setHours(hours, minutes, 0, 0);

    try {
      await agendar({
        medicoId: selectedDoctorId,
        dataHora: dataHora.toISOString(),
        tipo: selectedType,
      });

      setOpenModal(false);
      setStep(1);
      setSelectedDoctorId(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedType("presencial");
      alert("Consulta agendada com sucesso!");
    } catch (error) {
      alert("Erro ao agendar consulta");
    }
  };

  const closeModal = () => {
    setOpenModal(false);
    setStep(1);
    setSelectedDoctorId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedType("presencial");
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {openSidebar && <Sidebar />}

      <View style={styles.content}>
        {/* Toggle */}
        <TouchableOpacity
          onPress={() => setOpenSidebar(!openSidebar)}
          style={styles.toggle}
        >
          <Text>☰</Text>
        </TouchableOpacity>

        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* 🔥 MODAL GLOBAL */}
      <Modal visible={openModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* STEP 1 - Selecionar Médico */}
            {step === 1 && (
              <>
                <Text style={styles.title}>Nova Consulta</Text>

                {loadingMedicos ? (
                  <ActivityIndicator
                    size="large"
                    color="#19c10f"
                    style={{ marginTop: 20 }}
                  />
                ) : medicos.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum médico disponível</Text>
                ) : (
                  <View style={styles.grid}>
                    {medicos.map((medico) => (
                      <TouchableOpacity
                        key={medico.id}
                        style={[
                          styles.card,
                          selectedDoctorId === medico.id && styles.selectedCard,
                        ]}
                        onPress={() => setSelectedDoctorId(medico.id)}
                      >
                        <Text>{medico.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={styles.actions}>
                  <TouchableOpacity onPress={closeModal}>
                    <Text>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setStep(2)}
                    disabled={!selectedDoctorId}
                  >
                    <Text style={styles.buttonText}>Continuar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* STEP 2 - Selecionar Data, Hora e Tipo */}
            {step === 2 && (
              <>
                <Text style={styles.title}>{selectedDoctor?.nome}</Text>

                <Text style={{ marginTop: 10, fontWeight: "600" }}>
                  Selecione a data
                </Text>

                <View style={styles.datesContainer}>
                  {getNextDays().map((date, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.dateButton,
                        selectedDate?.toDateString() === date.toDateString() &&
                          styles.selectedDateButton,
                      ]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text
                        style={[
                          styles.dateButtonText,
                          selectedDate?.toDateString() ===
                            date.toDateString() &&
                            styles.selectedDateButtonText,
                        ]}
                      >
                        {date.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={{ marginTop: 20, fontWeight: "600" }}>
                  Horários disponíveis
                </Text>

                <View style={styles.times}>
                  {["08:00", "10:00", "14:00", "16:00", "18:00"].map(
                    (time, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.timeButton,
                          selectedTime === time && styles.selectedTimeButton,
                        ]}
                        onPress={() => setSelectedTime(time)}
                      >
                        <Text
                          style={[
                            styles.timeButtonText,
                            selectedTime === time &&
                              styles.selectedTimeButtonText,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
                </View>

                <Text style={{ marginTop: 20, fontWeight: "600" }}>
                  Tipo de Consulta
                </Text>

                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      selectedType === "presencial" &&
                        styles.selectedTypeButton,
                    ]}
                    onPress={() => setSelectedType("presencial")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === "presencial" &&
                          styles.selectedTypeButtonText,
                      ]}
                    >
                      Presencial
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      selectedType === "teleconsulta" &&
                        styles.selectedTypeButton,
                    ]}
                    onPress={() => setSelectedType("teleconsulta")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        selectedType === "teleconsulta" &&
                          styles.selectedTypeButtonText,
                      ]}
                    >
                      Teleconsulta
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => setStep(1)}>
                    <Text>Voltar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, agendando && styles.buttonDisabled]}
                    onPress={handleAgendar}
                    disabled={agendando || !selectedDate || !selectedTime}
                  >
                    {agendando ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Agendar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },

  content: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },

  toggle: {
    padding: 10,
  },

  /* MODAL */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    maxHeight: "90%",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },

  card: {
    width: "45%",
    padding: 15,
    backgroundColor: "#eee",
    borderRadius: 10,
  },

  selectedCard: {
    backgroundColor: "#d4f7d4",
  },

  datesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    maxHeight: 120,
  },

  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#eee",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  selectedDateButton: {
    backgroundColor: "#19c10f",
    borderColor: "#19c10f",
  },

  dateButtonText: {
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
  },

  selectedDateButtonText: {
    color: "#fff",
  },

  times: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 15,
  },

  timeButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  selectedTimeButton: {
    backgroundColor: "#19c10f",
    borderColor: "#19c10f",
  },

  timeButtonText: {
    color: "#333",
    fontWeight: "500",
  },

  selectedTimeButtonText: {
    color: "#fff",
  },

  typeContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  selectedTypeButton: {
    backgroundColor: "#19c10f",
    borderColor: "#19c10f",
  },

  typeButtonText: {
    color: "#333",
    fontWeight: "500",
  },

  selectedTypeButtonText: {
    color: "#fff",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  button: {
    backgroundColor: "#19c10f",
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },
});
