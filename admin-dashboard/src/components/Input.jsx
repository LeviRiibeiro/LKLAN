import { theme } from "../styles/theme";

export default function Input({ label, helperText, style, ...props }) {
  const inputId = props.id || props.name;

  return (
    <label style={{ display: "grid", gap: 6, color: theme.colors.text, ...(style || {}) }}>
      {label && <span style={{ fontSize: 14, color: theme.colors.muted }}>{label}</span>}
      <input
        id={inputId}
        style={{
          minHeight: 44,
          borderRadius: 12,
          border: `1px solid ${theme.colors.border}`,
          background: "rgba(4, 10, 8, 0.92)",
          color: theme.colors.text,
          padding: "10px 12px",
          outline: "none",
          boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.08) inset",
        }}
        {...props}
      />
      {helperText && <span style={{ fontSize: 12, color: theme.colors.muted }}>{helperText}</span>}
    </label>
  );
}
