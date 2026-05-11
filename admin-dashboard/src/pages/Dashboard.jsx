import { useEffect, useMemo, useState } from "react";

import { api } from "../services/api";
import useStore from "../store/useStore";
import Card from "../components/Card";
import { theme } from "../styles/theme";

const statusConfig = {
  online: { label: "Online", bg: "rgba(34, 197, 94, 0.18)", fg: "#bbf7d0" },
  offline: { label: "Offline", bg: "rgba(127, 29, 29, 0.24)", fg: "#fecaca" },
  blocked: { label: "Bloqueada", bg: "rgba(132, 204, 22, 0.16)", fg: "#d9f99d" },
  maintenance: { label: "Manutencao", bg: "rgba(34, 197, 94, 0.1)", fg: "#d1fae5" },
};

function formatSeen(value) {
  if (!value) return "Sem atividade";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem atividade";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const machines = useStore((state) => state.machines);
  const setMachines = useStore((state) => state.setMachines);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMachines = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/machines");
      setMachines(response.data);
    } catch (requestError) {
      setError("Nao foi possivel carregar as maquinas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMachines();

    const interval = setInterval(() => {
      void loadMachines();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return machines.reduce(
      (accumulator, machine) => {
        accumulator.total += 1;
        accumulator[machine.status] = (accumulator[machine.status] || 0) + 1;
        return accumulator;
      },
      { total: 0, online: 0, offline: 0, blocked: 0, maintenance: 0 },
    );
  }, [machines]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 32px)",
        background:
          "radial-gradient(circle at top left, rgba(34, 197, 94, 0.14), transparent 30%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.08), transparent 24%), linear-gradient(180deg, #030712 0%, #07110b 100%)",
        color: "#e5eefc",
        padding: "clamp(14px, 2vw, 24px)",
      }}
    >
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          borderRadius: 24,
          background: "rgba(4, 10, 8, 0.84)",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "clamp(18px, 2vw, 28px)", borderBottom: "1px solid rgba(148, 163, 184, 0.14)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, color: "#91a4c7", textTransform: "uppercase", letterSpacing: 2, fontSize: 12 }}>
                Sprint 2
              </p>
              <h1 style={{ margin: "8px 0 10px", fontSize: "clamp(1.8rem, 3.2vw, 2.6rem)", lineHeight: 1.1 }}>
                Dashboard das Maquinas
              </h1>
              <p style={{ margin: 0, maxWidth: 760, color: theme.colors.muted, fontSize: "clamp(0.98rem, 1.2vw, 1rem)" }}>
                Visao operacional em tempo real das 14 estações do laboratorio. Status, atividade recente e
                consolidado rapido para tomada de decisao.
              </p>
            </div>

            <button
              type="button"
              onClick={loadMachines}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.accent}, #16a34a)`,
                color: theme.colors.textStrong,
                border: "none",
                borderRadius: 14,
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.16) inset, 0 14px 24px rgba(0, 0, 0, 0.35)",
                minWidth: 160,
              }}
            >
              Atualizar agora
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginTop: 24 }}>
            {[
              { label: "Total", value: stats.total },
              { label: "Online", value: stats.online },
              { label: "Offline", value: stats.offline },
              { label: "Bloqueadas", value: stats.blocked },
              { label: "Manutencao", value: stats.maintenance },
            ].map((item) => (
              <Card key={item.label} style={{ padding: 16 }}>
                <div style={{ color: theme.colors.muted, fontSize: 13 }}>{item.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6, color: theme.colors.textStrong }}>{item.value}</div>
              </Card>
            ))}
          </div>
        </div>

        <div style={{ padding: "clamp(18px, 2vw, 28px)" }}>
          {loading ? (
            <div role="status" aria-live="polite" style={{ color: "#bac9e6" }}>
              Carregando máquinas...
            </div>
          ) : error ? (
            <div role="alert" style={{ color: "#ffb4b4" }}>
              {error}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {machines.map((machine) => {
                const visual = statusConfig[machine.status] || statusConfig.offline;

                return (
                  <Card key={machine.id} style={{ padding: 18, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 20 }}>{machine.name}</h3>
                        <p style={{ margin: "6px 0 0", color: theme.colors.muted, fontSize: 13 }}>{machine.ip_address}</p>
                      </div>
                      <span
                        style={{
                          background: visual.bg,
                          color: visual.fg,
                          borderRadius: 999,
                          padding: "6px 10px",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {visual.label}
                      </span>
                    </div>

                    <div style={{ marginTop: 18, color: theme.colors.text, fontSize: 14, lineHeight: 1.7 }}>
                      <div>Versao do agente: {machine.agent_version || "---"}</div>
                      <div>Ultima atividade: {formatSeen(machine.last_seen)}</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
