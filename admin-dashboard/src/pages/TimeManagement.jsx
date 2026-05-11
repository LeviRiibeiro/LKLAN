import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useTheme } from "../hooks/useTheme";

function TimeManagement() {
  const theme = useTheme();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    enabled: false,
    start: "07:00",
    end: "17:00",
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8001/time/schedule");
      setSchedule(response.data);
      setFormData({
        enabled: response.data.enabled === true || response.data.enabled === "true",
        start: response.data.start || "07:00",
        end: response.data.end || "17:00",
        monday: response.data.monday !== false && response.data.monday !== "false",
        tuesday: response.data.tuesday !== false && response.data.tuesday !== "false",
        wednesday: response.data.wednesday !== false && response.data.wednesday !== "false",
        thursday: response.data.thursday !== false && response.data.thursday !== "false",
        friday: response.data.friday !== false && response.data.friday !== "false",
        saturday: response.data.saturday === true || response.data.saturday === "true",
        sunday: response.data.sunday === true || response.data.sunday === "true",
      });
    } catch (error) {
      console.error("Erro ao carregar horários:", error);
      setMessage({ type: "error", text: "Erro ao carregar configuração" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.post("http://127.0.0.1:8001/time/schedule", formData);
      setMessage({
        type: "success",
        text: "✓ Horários atualizados com sucesso!",
      });
      setTimeout(() => fetchSchedule(), 500);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Erro ao salvar horários",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <p style={{ color: theme.muted }}>Carregando...</p>
      </div>
    );
  }

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels = {
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ color: theme.accent }}>⏰ Controle de Horário de Acesso</h1>

      {message && (
        <Card
          style={{
            backgroundColor:
              message.type === "error"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(34, 197, 94, 0.1)",
            borderLeft: `4px solid ${
              message.type === "error" ? "#ef4444" : "#22c55e"
            }`,
            marginBottom: "20px",
            padding: "12px 16px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: message.type === "error" ? "#ef4444" : "#22c55e",
            }}
          >
            {message.text}
          </p>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card style={{ marginBottom: "20px" }}>
          <h2 style={{ color: theme.accent, marginTop: 0 }}>⚙️ Configurações Gerais</h2>

          <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData({ ...formData, enabled: e.target.checked })
              }
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span style={{ color: theme.text }}>
              🔒 Ativar Controle de Horário
            </span>
          </label>

          {formData.enabled && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div>
                  <label style={{ color: theme.muted, fontSize: "12px", display: "block", marginBottom: "5px" }}>
                    Horário de Abertura
                  </label>
                  <input
                    type="time"
                    value={formData.start}
                    onChange={(e) =>
                      setFormData({ ...formData, start: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      backgroundColor: theme.bg,
                      border: `1px solid ${theme.muted}`,
                      color: theme.text,
                      borderRadius: "4px",
                      fontFamily: "monospace",
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: theme.muted, fontSize: "12px", display: "block", marginBottom: "5px" }}>
                    Horário de Fechamento
                  </label>
                  <input
                    type="time"
                    value={formData.end}
                    onChange={(e) =>
                      setFormData({ ...formData, end: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      backgroundColor: theme.bg,
                      border: `1px solid ${theme.muted}`,
                      color: theme.text,
                      borderRadius: "4px",
                      fontFamily: "monospace",
                    }}
                  />
                </div>
              </div>

              <p style={{ color: theme.muted, fontSize: "12px", marginTop: "10px", marginBottom: 0 }}>
                ℹ️ Alunos só poderão fazer login dentro deste intervalo. Professores e admins sempre poderão acessar.
              </p>
            </>
          )}
        </Card>

        <Card style={{ marginBottom: "20px" }}>
          <h2 style={{ color: theme.accent, marginTop: 0 }}>📅 Dias da Semana</h2>
          <p style={{ color: theme.muted, fontSize: "12px", marginBottom: "15px" }}>
            Selecione quais dias o laboratório está aberto
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
            {days.map((day) => (
              <label
                key={day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px",
                  backgroundColor: "rgba(34, 197, 94, 0.05)",
                  borderRadius: "4px",
                  cursor: "pointer",
                  border: formData[day] ? `1px solid ${theme.accent}` : `1px solid ${theme.muted}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={formData[day]}
                  onChange={(e) =>
                    setFormData({ ...formData, [day]: e.target.checked })
                  }
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ color: theme.text, flex: 1 }}>
                  {dayLabels[day]}
                </span>
              </label>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              backgroundColor: theme.accent,
              color: theme.bg,
              padding: "12px",
              fontSize: "16px",
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Salvando..." : "✓ Salvar Configuração"}
          </Button>

          <Button
            type="button"
            onClick={fetchSchedule}
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              color: theme.accent,
              border: `1px solid ${theme.accent}`,
              padding: "12px 20px",
            }}
          >
            🔄 Recarregar
          </Button>
        </div>
      </form>

      <Card style={{ marginTop: "30px", backgroundColor: "rgba(34, 197, 94, 0.05)", borderLeft: `4px solid ${theme.accent}` }}>
        <h3 style={{ color: theme.accent, margin: "0 0 10px 0" }}>ℹ️ Informações</h3>
        <ul style={{ color: theme.muted, margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
          <li>Quando ativado, alunos só poderão fazer login dentro dos horários configurados</li>
          <li>Professores e administradores não sofrem restrição de horário</li>
          <li>O controle é realizado no momento do login</li>
          <li>Horários em formato 24 horas (HH:MM)</li>
        </ul>
      </Card>
    </div>
  );
}

export default TimeManagement;
