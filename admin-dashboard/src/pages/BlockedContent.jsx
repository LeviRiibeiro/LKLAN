import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import Button from "../components/Button";
import Card from "../components/Card";
import Input from "../components/Input";
import { theme } from "../styles/theme";

function SectionTitle({ title, description }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ margin: "6px 0 0", color: theme.colors.muted }}>{description}</p>
    </div>
  );
}

export default function BlockedContent() {
  const [siteValue, setSiteValue] = useState("");
  const [appValue, setAppValue] = useState("");
  const [blockedSites, setBlockedSites] = useState([]);
  const [blockedApps, setBlockedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [sitesRes, appsRes] = await Promise.all([
        api.get("/blocked-sites"),
        api.get("/blocked-apps"),
      ]);
      setBlockedSites(sitesRes.data || []);
      setBlockedApps(appsRes.data || []);
    } catch (requestError) {
      setError("Nao foi possivel carregar os bloqueios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const siteCount = useMemo(() => blockedSites.length, [blockedSites]);
  const appCount = useMemo(() => blockedApps.length, [blockedApps]);

  const addSite = async () => {
    const value = siteValue.trim();
    if (!value) return;
    await api.post("/blocked-sites", { value });
    setSiteValue("");
    await loadData();
  };

  const addApp = async () => {
    const value = appValue.trim();
    if (!value) return;
    await api.post("/blocked-apps", { value });
    setAppValue("");
    await loadData();
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle
          title="Apps e Sites Bloqueados"
          description="Painel visual para manter a política de navegação e processos do laboratório."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
          <Card style={{ padding: 14 }}>
            <div style={{ color: theme.colors.muted, fontSize: 13 }}>Sites bloqueados</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{siteCount}</div>
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ color: theme.colors.muted, fontSize: 13 }}>Apps bloqueados</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{appCount}</div>
          </Card>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <Card>
          <SectionTitle
            title="Sites"
            description="Adicione domínios bloqueados pela extensão Chrome."
          />
          <div style={{ display: "grid", gap: 12 }}>
            <Input
              label="Novo domínio"
              name="blocked-site"
              value={siteValue}
              onChange={(event) => setSiteValue(event.target.value)}
              placeholder="ex: example.com"
              helperText="Digite apenas o domínio principal."
            />
            <Button onClick={addSite}>Adicionar site</Button>
          </div>
          {loading && <p role="status" aria-live="polite">Carregando sites...</p>}
          {error && <p role="alert" style={{ color: "#ffb4b4" }}>{error}</p>}
          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            {blockedSites.map((site) => (
              <div
                key={site}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(148, 163, 184, 0.08)",
                }}
              >
                <span>{site}</span>
                <Button
                  variant="secondary"
                  style={{ padding: "8px 12px", minHeight: 36 }}
                  onClick={async () => {
                    await api.delete(`/blocked-sites/${encodeURIComponent(site)}`);
                    await loadData();
                  }}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle
            title="Apps"
            description="Bloqueio por nome do processo para evitar bypass pelo navegador."
          />
          <div style={{ display: "grid", gap: 12 }}>
            <Input
              label="Novo executável"
              name="blocked-app"
              value={appValue}
              onChange={(event) => setAppValue(event.target.value)}
              placeholder="ex: opera.exe"
              helperText="Use o nome exato do processo."
            />
            <Button onClick={addApp}>Adicionar app</Button>
          </div>
          {loading && <p role="status" aria-live="polite">Carregando apps...</p>}
          {error && <p role="alert" style={{ color: "#ffb4b4" }}>{error}</p>}
          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            {blockedApps.map((app) => (
              <div
                key={app}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(148, 163, 184, 0.08)",
                }}
              >
                <span>{app}</span>
                <Button
                  variant="secondary"
                  style={{ padding: "8px 12px", minHeight: 36 }}
                  onClick={async () => {
                    await api.delete(`/blocked-apps/${encodeURIComponent(app)}`);
                    await loadData();
                  }}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
