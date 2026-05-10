import { useEffect } from "react";
import { WHITE } from "../../constants/colors";

export default function ModalShell({ onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(15,27,61,.55)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"fadeIn .2s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:WHITE, borderRadius:20, overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1fr", width:"min(900px,96vw)", minHeight:520, boxShadow:"0 32px 80px rgba(15,27,61,.25)", animation:"slideUp .28s ease" }}>
        {children}
      </div>
    </div>
  );
}