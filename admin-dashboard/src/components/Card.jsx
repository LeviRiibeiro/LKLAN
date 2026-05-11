import React from "react";
import { theme } from "../styles/theme";

export default function Card({ children, style }) {
  const base = {
    background: theme.colors.panel,
    color: theme.colors.text,
    borderRadius: theme.radius,
    padding: "16px",
    boxShadow: "0 14px 40px rgba(0,0,0,0.42)",
    border: `1px solid ${theme.colors.border}`,
    backdropFilter: "blur(10px)",
  };

  return (
    <div style={{ ...base, ...(style || {}) }}>
      {children}
    </div>
  );
}
