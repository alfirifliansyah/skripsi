import { useInView } from "../../hooks/useInView";

export default function Anim({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .65s ease ${delay}s, transform .65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}