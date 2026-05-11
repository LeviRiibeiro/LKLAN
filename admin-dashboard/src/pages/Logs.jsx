import { useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { theme } from "../styles/theme";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8001";

const EVENT_TYPE_COLORS = {
  login: "#22c55e",
  logout: "#ef4444",
  block: "#f59e0b",
  config_change: "#3b82f6",
  agent_connect: "#10b981",
  agent_disconnect: "#ef4444",
  default: "#94a3b8",
};

function formatRelativeTime(isoDate) {
  const now = new Date();
  const date = new Date(isoDate);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "agora";
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  if (seconds < 2592000) return `há ${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString("pt-BR");
}

function getEventIcon(eventType) {
  const icons = {
    login: "🔓",
    logout: "🔒",
    block: "🚫",
    config_change: "⚙️",
    agent_connect: "🔌",
    agent_disconnect: "❌",
  };
  return icons[eventType] || "📝";
}

export default function Logs() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterSource, setFilterSource] = useState("all");
  const [dayRange, setDayRange] = useState(7);

  useEffect(() => {
    fetchEvents();
  }, [filterType, filterSource, dayRange]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", 100);
      params.append("days", dayRange);
      if (filterType !== "all") params.append("event_type", filterType);
      if (filterSource !== "all") params.append("source", filterSource);

      const response = await axios.get(`${API_BASE}/logs?${params.toString()}`);
      setEvents(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao buscar eventos:", err);
      setError("Falha ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!confirm("Deletar este evento?")) return;
    try {
      await axios.delete(`${API_BASE}/logs/${eventId}`);
      setEvents(events.filter((e) => e.id !== eventId));
    } catch (err) {
      console.error("Erro ao deletar evento:", err);
      alert("Falha ao deletar evento");
    }
  };

  const eventTypesInData = [...new Set(events.map((e) => e.event_type))];
  const sourcesInData = [...new Set(events.map((e) => e.source))];

  const todayCount = events.filter((e) => {
    const eventDate = new Date(e.created_at).toDateString();
    return eventDate === new Date().toDateString();
  }).length;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Logs e Relatórios</h2>
        <p style={{ marginTop: 0, color: theme.colors.muted }}>
          Linha do tempo de ações administrativas, conexões de agentes e alterações de configuração.
        </p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        <Card style={{ padding: 16 }}>
          <div style={{ color: theme.colors.muted, fontSize: 13 }}>Eventos hoje</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: theme.colors.accent }}>{todayCount}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: theme.colors.muted, fontSize: 13 }}>Total ({dayRange}d)</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: theme.colors.accent }}>{events.length}</div>
        </Card>
        <Card style={{ padding: 16 }}>
          <div style={{ color: theme.colors.muted, fontSize: 13 }}>Fontes</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: theme.colors.accent }}>{sourcesInData.length}</div>
        </Card>
      </div>

      <Card>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Filtros</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div>
            <label style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4, display: "block" }}>
              Tipo de evento
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.accent}40`,
                borderRadius: 6,
                fontFamily: theme.fonts.mono,
                fontSize: 12,
              }}
            >
              <option value="all">Todos</option>
              {eventTypesInData.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4, display: "block" }}>
              Fonte
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.accent}40`,
                borderRadius: 6,
                fontFamily: theme.fonts.mono,
                fontSize: 12,
              }}
            >
              <option value="all">Todas</option>
              {sourcesInData.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: theme.colors.muted, fontSize: 12, marginBottom: 4, display: "block" }}>
              Período (dias)
            </label>
            <select
              value={dayRange}
              onChange={(e) => setDayRange(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "8px",
                background: theme.colors.background,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.accent}40`,
                borderRadius: 6,
                fontFamily: theme.fonts.mono,
                fontSize: 12,
              }}
            >
              <option value={1}>1 dia</option>
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>
          Linha do tempo
          {loading && <span style={{ fontSize: 12, color: theme.colors.muted, marginLeft: 8 }}>carregando...</span>}
        </h3>

        {error && (
          <div
            style={{
              padding: 12,
              background: "#ef4444" + "20",
              color: "#fca5a5",
              borderRadius: 6,
              marginBottom: 12,
              borderLeft: `3px solid #ef4444`,
            }}
          >
            {error}
          </div>
        )}

        {events.length === 0 && !loading && (
          <div style={{ textAlign: "center", color: theme.colors.muted, padding: "40px 20px" }}>
            <p>Nenhum evento encontrado</p>
          </div>
        )}

        <div style={{ display: "grid", gap: 8 }}>
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                gap: 12,
                padding: 12,
                borderRadius: 8,
                background: `rgba(34, 197, 94, 0.05)`,
                border: `1px solid ${theme.colors.accent}30`,
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: 20, minWidth: 24 }}>{getEventIcon(event.event_type)}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.default,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {event.event_type}
                  </span>
                  <span style={{ color: theme.colors.muted, fontSize: 11 }}>({event.source})</span>
                </div>

                <p style={{ margin: 0, color: theme.colors.text, fontSize: 13, lineHeight: 1.4 }}>
                  {event.description}
                </p>

                {(event.machine_id || event.user_id) && (
                  <div style={{ fontSize: 11, color: theme.colors.muted, marginTop: 4 }}>
                    {event.machine_id && <span>📍 Machine #{event.machine_id} </span>}
                    {event.user_id && <span>👤 User #{event.user_id}</span>}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: theme.colors.muted, fontSize: 12, whiteSpace: "nowrap" }}>
                  {formatRelativeTime(event.created_at)}
                </span>
                <Button
                  variant="danger"
                  onClick={() => deleteEvent(event.id)}
                  style={{ padding: "4px 8px", fontSize: 11 }}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
