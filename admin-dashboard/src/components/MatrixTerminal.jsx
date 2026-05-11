import { useMemo } from "react";
import { theme } from "../styles/theme";

const charset = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

function pickChar(index) {
  return charset[index % charset.length];
}

export default function MatrixTerminal() {
  const columns = useMemo(
    () =>
      Array.from({ length: 18 }, (_, columnIndex) =>
        Array.from({ length: 10 }, (_, rowIndex) => ({
          char: pickChar(columnIndex * 7 + rowIndex * 11),
          delay: `${(columnIndex + rowIndex) * 120}ms`,
          duration: `${2600 + columnIndex * 60}ms`,
          opacity: 0.45 + ((rowIndex + columnIndex) % 4) * 0.12,
        })),
      ),
    [],
  );

  return (
    <div
      aria-hidden="true"
      style={{
        width: "min(100%, 640px)",
        height: 150,
        borderRadius: 18,
        padding: 14,
        background:
          "linear-gradient(180deg, rgba(2, 6, 23, 0.88), rgba(4, 12, 8, 0.96)), radial-gradient(circle at top left, rgba(34, 197, 94, 0.16), transparent 45%)",
        border: `1px solid ${theme.colors.border}`,
        boxShadow: "0 0 0 1px rgba(34, 197, 94, 0.08) inset, 0 18px 34px rgba(0, 0, 0, 0.42)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <style>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-20%); opacity: 0.15; }
          15% { opacity: 1; }
          85% { opacity: 0.95; }
          100% { transform: translateY(24%); opacity: 0.12; }
        }

        @keyframes matrix-glow {
          0%, 100% { text-shadow: 0 0 4px rgba(134, 239, 172, 0.35); }
          50% { text-shadow: 0 0 10px rgba(134, 239, 172, 0.65); }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ color: theme.colors.accentBright, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
          Matrix Terminal
        </div>
        <div style={{ color: theme.colors.muted, fontSize: 12 }}>online</div>
      </div>

      <div
        style={{
          height: 104,
          display: "grid",
          gridTemplateColumns: "repeat(18, 1fr)",
          gap: 4,
          alignItems: "stretch",
        }}
      >
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {column.map((item, itemIndex) => (
              <span
                key={`${columnIndex}-${itemIndex}`}
                style={{
                  color: itemIndex === 0 ? theme.colors.textStrong : theme.colors.accentBright,
                  opacity: item.opacity,
                  fontFamily: "'Consolas', 'Courier New', monospace",
                  fontSize: 14,
                  lineHeight: 1,
                  animation: `matrix-fall ${item.duration} linear infinite`,
                  animationDelay: item.delay,
                  animationDirection: columnIndex % 2 === 0 ? "normal" : "reverse",
                  animationFillMode: "both",
                  animationIterationCount: "infinite",
                  animationTimingFunction: "linear",
                  display: "block",
                  textAlign: "center",
                  transform: `translateY(${(itemIndex % 3) * 1}px)`,
                  animationName: "matrix-fall, matrix-glow",
                  animationDuration: `${item.duration}, 1800ms`,
                }}
              >
                {item.char}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
