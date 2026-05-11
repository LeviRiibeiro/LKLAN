import { useEffect, useState } from "react";
import { api } from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { theme } from "../styles/theme";

export default function LabConfig() {
  const [scheduleStart, setScheduleStart] = useState("07:00");
  const [scheduleEnd, setScheduleEnd] = useState("17:00");
  const [backupPath, setBackupPath] = useState("C:\\LanManagerBackup");
  const [ntpServer, setNtpServer] = useState("pool.ntp.br");
  const [days, setDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await api.get("/lab-config/settings");
      setScheduleStart(response.data.start || "07:00");
      setScheduleEnd(response.data.end || "17:00");
      setBackupPath(response.data.backup_path || "C:\\LanManagerBackup");
      setNtpServer(response.data.ntp_server || "pool.ntp.br");
      setDays(response.data.days || ["Mon", "Tue", "Wed", "Thu", "Fri"]);
    } catch (requestError) {
      setMessage("Não foi possível carregar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const saveSettings = async () => {
    setMessage("");
    await api.put("/lab-config/settings", {
      start: scheduleStart,
      end: scheduleEnd,
      days,
      backup_path: backupPath,
      ntp_server: ntpServer,
    });
    setMessage("Configurações salvas com sucesso.");
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Configurações do Laboratório</h2>
        <p style={{ marginTop: 0, color: theme.colors.muted }}>
          Ajustes operacionais do laboratório, apresentados em um formulário visual simples.
        </p>
      </Card>

      <Card>
        {loading && <p role="status" aria-live="polite">Carregando configurações...</p>}
        {message && <p role="status" aria-live="polite" style={{ color: theme.colors.muted }}>{message}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <Input label="Início do turno" type="time" value={scheduleStart} onChange={(e) => setScheduleStart(e.target.value)} />
          <Input label="Fim do turno" type="time" value={scheduleEnd} onChange={(e) => setScheduleEnd(e.target.value)} />
          <Input label="Servidor NTP" value={ntpServer} onChange={(e) => setNtpServer(e.target.value)} />
          <Input label="Pasta de backup" value={backupPath} onChange={(e) => setBackupPath(e.target.value)} />
        </div>

        <div style={{ marginTop: 14 }}>
          <div style={{ color: theme.colors.muted, fontSize: 14, marginBottom: 8 }}>Dias ativos</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
              const active = days.includes(day);
              return (
                <Button
                  key={day}
                  variant={active ? "primary" : "secondary"}
                  style={{ padding: "8px 12px", minHeight: 38 }}
                  onClick={() =>
                    setDays((current) =>
                      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
                    )
                  }
                >
                  {day}
                </Button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <Button onClick={saveSettings}>Salvar configurações</Button>
          <Button variant="secondary">Restaurar padrão</Button>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ color: theme.colors.muted, fontSize: 13 }}>Janela de operação</div>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{scheduleStart} - {scheduleEnd}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: theme.colors.muted, fontSize: 13 }}>Backup</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{backupPath}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: theme.colors.muted, fontSize: 13 }}>Sincronização</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{ntpServer}</div>
        </Card>
      </div>
    </div>
  );
}
