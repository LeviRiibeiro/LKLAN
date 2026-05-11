import { Link, useLocation } from "react-router-dom";
import { theme } from "../styles/theme";
import MatrixTerminal from "./MatrixTerminal";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Usuários" },
  { to: "/machines/1", label: "Máquina" },
  { to: "/blocked-content", label: "Bloqueios" },
  { to: "/lab-config", label: "Configurações" },
  { to: "/logs", label: "Logs" },
  { to: "/backups", label: "Backups" },
  { to: "/import", label: "Importar" },
  { to: "/time-management", label: "Horários" },
  { to: "/turmas", label: "Turmas" },
  { to: "/agent-update", label: "Agente" },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: "Segoe UI, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(34, 197, 94, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.035) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.8), transparent 92%)",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at top, rgba(34, 197, 94, 0.14), transparent 28%), radial-gradient(circle at right, rgba(34, 197, 94, 0.08), transparent 22%)",
        }}
      />
      <a
        href="#conteudo"
        style={{
          position: "absolute",
          left: -9999,
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        Pular para o conteúdo principal
      </a>

      <header
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "20px 20px 8px",
        }}
      >
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ minWidth: 280, flex: "1 1 520px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.6rem, 2vw, 2.3rem)",
                fontFamily: theme.fonts.display,
                color: theme.colors.textStrong,
                letterSpacing: 0.2,
                textShadow: "0 0 10px rgba(34, 197, 94, 0.12)",
              }}
            >
              LAN Manager Escolar
            </h1>
            <nav
              aria-label="Navegação principal"
              style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14, paddingBottom: 8 }}
            >
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    color: location.pathname === item.to ? theme.colors.accentBright : theme.colors.muted,
                    textDecoration: "none",
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: `1px solid ${location.pathname === item.to ? theme.colors.border : "transparent"}`,
                    background: location.pathname === item.to ? theme.colors.accentSoft : "transparent",
                    boxShadow: location.pathname === item.to ? "0 0 0 1px rgba(34, 197, 94, 0.12) inset" : "none",
                    transition: "all 140ms ease",
                    fontFamily: theme.fonts.display,
                    letterSpacing: 0.2,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div style={{ flex: "0 1 640px", marginTop: 2 }}>
            <MatrixTerminal />
          </div>
        </div>
      </header>

      <main id="conteudo" style={{ maxWidth: 1400, margin: "0 auto", padding: "0 20px 24px" }}>
        {children}
      </main>
    </div>
  );
}
