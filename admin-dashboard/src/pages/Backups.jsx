import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";
import { useTheme } from "../hooks/useTheme";

function Backups() {
  const theme = useTheme();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8001/backups/info");
      setBackups(response.data.backups || []);
    } catch (error) {
      console.error("Erro ao carregar backups:", error);
      setMessage({ type: "error", text: "Erro ao carregar backups" });
    } finally {
      setLoading(false);
    }
  };

  const createBackupManually = async () => {
    try {
      setCreating(true);
      await axios.post("http://127.0.0.1:8001/backups/manual");
      setMessage({
        type: "success",
        text: "Backup criado com sucesso!",
      });
      setTimeout(() => fetchBackups(), 1000);
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      setMessage({ type: "error", text: "Erro ao criar backup" });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchBackups();
    const interval = setInterval(fetchBackups, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ color: theme.accent }}>💾 Gerenciador de Backups</h1>
        <Button
          onClick={createBackupManually}
          disabled={creating}
          style={{
            backgroundColor: theme.accent,
            color: theme.bg,
            padding: "10px 20px",
            cursor: creating ? "not-allowed" : "pointer",
            opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? "Criando..." : "➕ Criar Backup Agora"}
        </Button>
      </div>

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
          <p style={{ margin: 0, color: message.type === "error" ? "#ef4444" : "#22c55e" }}>
            {message.text}
          </p>
        </Card>
      )}

      <Card style={{ marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: theme.muted, fontSize: "14px", margin: "0 0 5px 0" }}>
              Total de Backups
            </p>
            <p style={{ fontSize: "28px", color: theme.accent, margin: 0 }}>
              {backups.length}
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: theme.muted, fontSize: "14px", margin: "0 0 5px 0" }}>
              Espaço Total
            </p>
            <p style={{ fontSize: "28px", color: theme.accent, margin: 0 }}>
              {(backups.reduce((sum, b) => sum + b.size_mb, 0) || 0).toFixed(1)} MB
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: theme.muted, fontSize: "14px", margin: "0 0 5px 0" }}>
              Backup Mais Recente
            </p>
            <p style={{ fontSize: "14px", color: theme.text, margin: 0 }}>
              {backups.length > 0
                ? new Date(backups[0].created_at).toLocaleString("pt-BR")
                : "Nenhum backup"}
            </p>
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2 style={{ color: theme.accent, marginBottom: "10px" }}>Histórico de Backups</h2>
        {loading ? (
          <p style={{ color: theme.muted }}>Carregando...</p>
        ) : backups.length === 0 ? (
          <p style={{ color: theme.muted }}>Nenhum backup encontrado</p>
        ) : (
          backups.map((backup, idx) => (
            <Card
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 5px 0",
                    color: theme.text,
                    fontWeight: 500,
                  }}
                >
                  {backup.filename}
                </p>
                <p style={{ margin: 0, color: theme.muted, fontSize: "12px" }}>
                  {new Date(backup.created_at).toLocaleString("pt-BR")} • {backup.size_mb} MB
                </p>
              </div>
              <Button
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  color: theme.accent,
                  padding: "6px 12px",
                  fontSize: "12px",
                  cursor: "default",
                }}
              >
                ✓ Salvo
              </Button>
            </Card>
          ))
        )}
      </div>

      <Card
        style={{
          marginTop: "30px",
          padding: "16px",
          backgroundColor: "rgba(34, 197, 94, 0.05)",
          borderLeft: `4px solid ${theme.accent}`,
        }}
      >
        <h3 style={{ color: theme.accent, margin: "0 0 10px 0" }}>ℹ️ Informações</h3>
        <ul style={{ color: theme.muted, margin: 0, paddingLeft: "20px", fontSize: "14px" }}>
          <li>Backups automáticos: Diariamente às 00:00 UTC + a cada 6 horas</li>
          <li>Retenção: Apenas os últimos 7 backups são mantidos</li>
          <li>Localização: Pasta <code style={{ color: theme.accent }}>/backups</code></li>
          <li>Você pode criar backups manuais a qualquer momento</li>
        </ul>
      </Card>
    </div>
  );
}

export default Backups;
