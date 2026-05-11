import { theme } from "../styles/theme";

export default function Button({ children, variant = "primary", style, ...props }) {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${theme.colors.accent}, #16a34a)`,
      color: theme.colors.textStrong,
      boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.16) inset, 0 14px 28px rgba(0, 0, 0, 0.35)",
    },
    secondary: {
      background: "rgba(34, 197, 94, 0.08)",
      color: theme.colors.text,
      boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.12) inset",
    },
    danger: {
      background: theme.colors.danger,
      color: theme.colors.textStrong,
      boxShadow: "0 0 0 1px rgba(248, 113, 113, 0.18) inset",
    },
  };

  return (
    <button
      type="button"
      style={{
        border: "none",
        borderRadius: 14,
        padding: "12px 16px",
        fontWeight: 700,
        cursor: "pointer",
        transition: "transform 120ms ease, opacity 120ms ease, box-shadow 120ms ease",
        minHeight: 44,
        ...variants[variant],
        ...(style || {}),
      }}
      onMouseDown={(event) => {
        event.currentTarget.style.transform = "scale(0.98)";
      }}
      onMouseUp={(event) => {
        event.currentTarget.style.transform = "scale(1)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "scale(1)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}
