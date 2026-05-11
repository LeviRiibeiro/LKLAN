import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import Card from "../components/Card";
import { theme } from "../styles/theme";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

export default function MachineDetail() {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMachine = async () => {
    setLoading(true);
    setError(null);
    try {
      const [machineRes, sessionsRes] = await Promise.all([
        api.get(`/machines/${id}`),
        api.get(`/machines/${id}/sessions`),
      ]);
      setMachine(machineRes.data);
      setSessions(sessionsRes.data || []);
    } catch (err) {
      setError(err.message || "Erro ao buscar máquina");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachine();
  }, [id]);

  const endSession = async (sessionId) => {
    try {
      await api.post(`/machines/${id}/session/${sessionId}/end`, null, {
        params: { end_reason: "manual" },
      });
      fetchMachine();
    } catch (err) {
      alert("Falha ao encerrar sessão: " + (err.message || err));
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!machine) return <p>Nenhuma máquina encontrada.</p>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Detalhe da Máquina: {machine.name}</h2>
        <p>
          <strong>ID:</strong> {machine.id}
        </p>
        <p>
          <strong>IP:</strong> {machine.ip_address}
        </p>
        <p>
          <strong>Status:</strong> {machine.status}
        </p>
        <p>
          <strong>Versão do agente:</strong> {machine.agent_version || "-"}
        </p>
        <p>
          <strong>Última atividade:</strong> {machine.last_seen || "-"}
        </p>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Sessões da Máquina</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Aluno</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Início</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Fim</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Minutos</th>
                <th scope="col" style={{ textAlign: "left", padding: 8 }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const active = !session.ended_at;

                return (
                  <tr key={session.id}>
                    <td style={{ padding: 8 }}>{session.user_name}</td>
                    <td style={{ padding: 8 }}>{formatDate(session.started_at)}</td>
                    <td style={{ padding: 8 }}>{formatDate(session.ended_at)}</td>
                    <td style={{ padding: 8 }}>{session.minutes_used}</td>
                    <td style={{ padding: 8 }}>
                      {active ? (
                        <button
                          type="button"
                          onClick={() => endSession(session.id)}
                          style={{
                            background: theme.colors.danger,
                            color: "white",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                          }}
                        >
                          Encerrar
                        </button>
                      ) : (
                        <span>Finalizada</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 8 }}>
                    Nenhuma sessão encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
