import { YELLOW_L, YELLOW } from "../../constants/colors";

export default function Label({ children }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: YELLOW_L, border: "1px solid #FDE68A", color: "#92400E",
      fontWeight: 700, fontSize: 11, letterSpacing: "0.1em",
      padding: "0.35rem 0.9rem", borderRadius: 100, marginBottom: "1rem",
    }}>
      <div style={{ width: 5, height: 5, background: YELLOW, borderRadius: "50%" }} />
      {children}
    </div>
  );
}