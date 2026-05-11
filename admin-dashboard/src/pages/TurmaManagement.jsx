import React, { useState, useEffect } from "react";
import axios from "axios";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { useTheme } from "../hooks/useTheme";

function TurmaManagement() {
  const theme = useTheme();
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    minutes: 0,
    reason: "",
  });

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8001/users/turmas/list");
      setTurmas(response.data.turmas || []);
      if (response.data.turmas.length > 0 && !selectedTurma) {
        setSelectedTurma(response.data.turmas[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
      setMessage({ type: "error", text: "Erro ao carregar turmas" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersFromTurma = async (turma) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8001/users/turma/${turma}`);
      setUsers(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setUsers([]);
    }
  };

  const handleTurmaSelect = (turma) => {
    setSelectedTurma(turma);
    fetchUsersFromTurma(turma);
  };

  const handleAddTime = async () => {
    if (!selectedTurma || formData.minutes === 0) {
      setMessage({ type: "error", text: "Selecione turma e insira minutos" });
      return;
    }

    try {
      setOperationLoading(true);
      const response = await axios.post(
        `http://127.0.0.1:8001/users/turma/${selectedTurma}/add-time`,
        { minutes: parseInt(formData.minutes), reason: formData.reason }
      );

      setMessage({
        type: "success",
        text: `✓ ${response.data.students_updated} alunos receberam ${formData.minutes} minutos`,
      });
      setFormData({ minutes: 0, reason: "" });
      fetchUsersFromTurma(selectedTurma);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Erro" });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSuspendTurma = async () => {
    if (!selectedTurma) {
      setMessage({ type: "error", text: "Selecione uma turma" });
      return;
    }

    if (!window.confirm(`Deseja suspender TODA a turma ${selectedTurma}?`)) {
      return;
    }

    try {
      setOperationLoading(true);
      const response = await axios.post(
        `http://127.0.0.1:8001/users/turma/${selectedTurma}/suspend`,
        { minutes: 1440, reason: formData.reason || "Suspensão administrativa" }
      );

      setMessage({
        type: "success",
        text: `✓ ${response.data.students_suspended} alunos suspensos até ${response.data.suspended_until}`,
      });
      setFormData({ minutes: 0, reason: "" });
      fetchUsersFromTurma(selectedTurma);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Erro" });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUnsuspendTurma = async () => {
    if (!selectedTurma) {
      setMessage({ type: "error", text: "Selecione uma turma" });
      return;
    }

    if (!window.confirm(`Levantar suspensão de TODA a turma ${selectedTurma}?`)) {
      return;
    }

    try {
      setOperationLoading(true);
      const response = await axios.post(
        `http://127.0.0.1:8001/users/turma/${selectedTurma}/unsuspend`
      );

      setMessage({
        type: "success",
        text: `✓ ${response.data.students_unsuspended} alunos desbloqueados`,
      });
      fetchUsersFromTurma(selectedTurma);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.detail || "Erro" });
    } finally {
      setOperationLoading(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  useEffect(() => {
    if (selectedTurma) {
      fetchUsersFromTurma(selectedTurma);
    }
  }, [selectedTurma]);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <p style={{ color: theme.muted }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: theme.accent }}>👥 Gestão por Turmas</h1>

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

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: "20px" }}>
        {/* Sidebar - Lista de turmas */}
        <div>
          <h2 style={{ color: theme.accent, marginTop: 0, fontSize: "16px" }}>Turmas</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {turmas.length === 0 ? (
              <p style={{ color: theme.muted, fontSize: "12px" }}>Nenhuma turma encontrada</p>
            ) : (
              turmas.map((turma) => (
                <Button
                  key={turma}
                  onClick={() => handleTurmaSelect(turma)}
                  style={{
                    backgroundColor:
                      selectedTurma === turma ? theme.accent : "rgba(34, 197, 94, 0.1)",
                    color: selectedTurma === turma ? theme.bg : theme.text,
                    border: `1px solid ${theme.accent}`,
                    padding: "10px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  {turma}
                </Button>
              ))
            )}
          </div>
        </div>

        {/* Main content */}
        <div>
          {selectedTurma ? (
            <>
              <Card style={{ marginBottom: "20px" }}>
                <h2 style={{ color: theme.accent, marginTop: 0 }}>
                  Turma: <span style={{ fontSize: "20px" }}>{selectedTurma}</span>
                </h2>
                <p style={{ color: theme.muted, margin: 0 }}>
                  Total de alunos: <strong style={{ color: theme.accent }}>{users.length}</strong>
                </p>
              </Card>

              <Card style={{ marginBottom: "20px" }}>
                <h3 style={{ color: theme.accent, marginTop: 0 }}>⏱️ Adicionar Tempo de Acesso</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div>
                    <label style={{ color: theme.muted, fontSize: "12px", display: "block", marginBottom: "5px" }}>
                      Minutos
                    </label>
                    <input
                      type="number"
                      value={formData.minutes}
                      onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: theme.bg,
                        border: `1px solid ${theme.muted}`,
                        color: theme.text,
                        borderRadius: "4px",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: theme.muted, fontSize: "12px", display: "block", marginBottom: "5px" }}>
                      Motivo (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Atividade especial"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: theme.bg,
                        border: `1px solid ${theme.muted}`,
                        color: theme.text,
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddTime}
                  disabled={operationLoading}
                  style={{
                    width: "100%",
                    backgroundColor: theme.accent,
                    color: theme.bg,
                    padding: "10px",
                    cursor: operationLoading ? "not-allowed" : "pointer",
                    opacity: operationLoading ? 0.6 : 1,
                  }}
                >
                  {operationLoading ? "Processando..." : "✓ Adicionar Tempo"}
                </Button>
              </Card>

              <Card style={{ marginBottom: "20px" }}>
                <h3 style={{ color: theme.accent, marginTop: 0 }}>🔒 Ações Administrativas</h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <Button
                    onClick={handleSuspendTurma}
                    disabled={operationLoading}
                    style={{
                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                      color: "#ef4444",
                      border: "1px solid #ef4444",
                      padding: "10px",
                      cursor: operationLoading ? "not-allowed" : "pointer",
                      opacity: operationLoading ? 0.6 : 1,
                    }}
                  >
                    ⛔ Suspender Turma
                  </Button>

                  <Button
                    onClick={handleUnsuspendTurma}
                    disabled={operationLoading}
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.2)",
                      color: "#22c55e",
                      border: "1px solid #22c55e",
                      padding: "10px",
                      cursor: operationLoading ? "not-allowed" : "pointer",
                      opacity: operationLoading ? 0.6 : 1,
                    }}
                  >
                    ✓ Liberar Turma
                  </Button>
                </div>
              </Card>

              <Card>
                <h3 style={{ color: theme.accent, marginTop: 0 }}>📋 Alunos da Turma</h3>

                <div
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    backgroundColor: "rgba(3, 7, 18, 0.5)",
                    border: `1px solid ${theme.muted}`,
                    borderRadius: "4px",
                    padding: "0",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                    }}
                  >
                    <thead style={{ position: "sticky", top: 0, backgroundColor: theme.bg }}>
                      <tr style={{ borderBottom: `1px solid ${theme.muted}` }}>
                        <th style={{ textAlign: "left", color: theme.accent, padding: "8px" }}>Nome</th>
                        <th style={{ textAlign: "left", color: theme.accent, padding: "8px" }}>Usuário</th>
                        <th style={{ textAlign: "center", color: theme.accent, padding: "8px" }}>Tempo (min)</th>
                        <th style={{ textAlign: "center", color: theme.accent, padding: "8px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: `1px solid ${theme.muted}`,
                            backgroundColor: idx % 2 === 0 ? "rgba(34, 197, 94, 0.03)" : "transparent",
                          }}
                        >
                          <td style={{ color: theme.text, padding: "8px" }}>{user.full_name || user.name}</td>
                          <td style={{ color: theme.muted, padding: "8px", fontFamily: "monospace" }}>{user.username}</td>
                          <td style={{ textAlign: "center", color: theme.accent, padding: "8px" }}>
                            {user.time_balance}
                          </td>
                          <td style={{ textAlign: "center", padding: "8px" }}>
                            {user.is_suspended ? (
                              <span style={{ color: "#ef4444" }}>🔒 Suspenso</span>
                            ) : (
                              <span style={{ color: "#22c55e" }}>✓ Ativo</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card>
              <p style={{ color: theme.muted, textAlign: "center" }}>Selecione uma turma</p>
            </Card>
          )}
        </div>
      </div>

      <Card
        style={{
          marginTop: "30px",
          backgroundColor: "rgba(34, 197, 94, 0.05)",
          borderLeft: `4px solid ${theme.accent}`,
        }}
      >
        <h3 style={{ color: theme.accent, margin: "0 0 10px 0" }}>ℹ️ Informações</h3>
        <ul style={{ color: theme.muted, margin: 0, paddingLeft: "20px", fontSize: "12px" }}>
          <li>Adicionar tempo: todos os alunos da turma recebem o tempo especificado</li>
          <li>Suspender turma: todos os alunos perdem acesso imediatamente</li>
          <li>Liberar turma: reativa todos os alunos suspensos da turma</li>
          <li>Operações afetam apenas alunos (role=student)</li>
        </ul>
      </Card>
    </div>
  );
}

export default TurmaManagement;
