import { useState } from "react";
import { BLUE, BLUE_L, WHITE, DARK, MUTED, YELLOW } from "../../constants/colors";
import { authAPI } from "../../services/api";
import ModalShell from "./ModalShell";
import IllustrationPanel from "./IllustrationPanel";

/**
 * ForgotPasswordModal — modal pertama dari flow lupa password.
 *
 * Alur:
 *   1. User klik "Lupa password?" di LoginModal → modal ini muncul
 *   2. User input email → klik "Kirim Link Reset"
 *   3. Backend kirim email (lewat Mailtrap) berisi link reset
 *   4. Modal tampil success state → user diminta cek email
 *   5. User klik link di email → buka halaman dengan ?token=...&email=...
 *      → App.jsx mendeteksi URL & otomatis tampil ResetPasswordModal
 *
 * Props:
 *   onClose       : tutup modal & kembali ke layar utama
 *   onBackToLogin : tutup modal & buka LoginModal
 */
export default function ForgotPasswordModal({ onClose, onBackToLogin }) {
  const [email,   setEmail]   = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [sent,    setSent]    = useState(false);

  const canSubmit = email && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (e) {
      setErr(e.message || "Gagal mengirim email reset. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div style={{ padding:"3rem 2.5rem", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:"2rem" }}>
          <div style={{ width:30, height:30, background:BLUE, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:WHITE }}>IMA</div>
          <span style={{ fontWeight:700, fontSize:13, color:DARK }}>IMA Creative<span style={{ color:BLUE }}>.</span></span>
        </div>

        {!sent ? (
          <>
            <h2 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".4rem", letterSpacing:"-.02em" }}>Lupa Password?</h2>
            <p style={{ fontSize:14, color:MUTED, marginBottom:"1.8rem", lineHeight:1.7 }}>
              Tidak masalah! Masukkan email Anda dan kami akan mengirim link untuk reset password.
            </p>

            {err && (
              <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:".75rem 1rem", marginBottom:"1rem", fontSize:13, color:"#DC2626" }}>
                ⚠️ {err}
              </div>
            )}

            <div style={{ marginBottom:"1.4rem" }}>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:DARK, marginBottom:".4rem" }}>Email</label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErr(""); }}
                  placeholder="nama@email.com"
                  autoFocus
                  style={{
                    width:"100%", padding:".65rem .9rem .65rem 2.5rem",
                    border:`1.5px solid ${focused?BLUE:"#D1D9EF"}`, borderRadius:10, fontSize:14,
                    color:DARK, fontFamily:"inherit", outline:"none",
                    background:focused?"#FAFBFF":WHITE, transition:"border-color .2s,background .2s",
                    boxShadow:focused?"0 0 0 3px rgba(27,79,216,0.1)":"none",
                  }}
                  onFocus={()=>setFocused(true)}
                  onBlur={()=>setFocused(false)}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                width:"100%", padding:".8rem",
                background:canSubmit?BLUE:"#D1D9EF",
                color:canSubmit?WHITE:MUTED,
                border:"none", borderRadius:10, fontWeight:700, fontSize:15,
                cursor:canSubmit?"pointer":"not-allowed", fontFamily:"inherit",
                marginBottom:".9rem",
                boxShadow:canSubmit?"0 4px 16px rgba(27,79,216,.3)":"none",
                transition:"opacity .2s",
              }}
              onMouseOver={e=>{if(canSubmit)e.target.style.opacity=.88;}}
              onMouseOut={e=>e.target.style.opacity=1}
            >
              {loading ? "Mengirim..." : "🔐 Kirim Link Reset"}
            </button>

            <p style={{ textAlign:"center", fontSize:13, color:MUTED, marginTop:"1.5rem" }}>
              Ingat password Anda?{" "}
              <button onClick={onBackToLogin} style={{ background:"none", border:"none", color:BLUE, fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
                Kembali ke Masuk
              </button>
            </p>
          </>
        ) : (
          // ── State setelah email terkirim ──
          <div style={{ textAlign:"center" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:BLUE_L, margin:"0 auto 1.5rem", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>
              📬
            </div>
            <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:DARK, marginBottom:".5rem", letterSpacing:"-.02em" }}>
              Cek Email Anda
            </h2>
            <p style={{ fontSize:14, color:MUTED, marginBottom:"1.5rem", lineHeight:1.7 }}>
              Kami sudah mengirim link reset password ke<br/>
              <strong style={{ color:DARK }}>{email}</strong>
            </p>
            <div style={{ background:"#FEF3C7", border:"1.5px solid #FCD34D", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.5rem", textAlign:"left" }}>
              <p style={{ fontSize:13, color:"#92400E", lineHeight:1.7, margin:0 }}>
                💡 <strong>Tidak menerima email?</strong>
                <br/>• Cek folder spam/promosi
                <br/>• Pastikan email yang dimasukkan benar
                <br/>• Link akan kadaluwarsa dalam 60 menit
              </p>
            </div>
            <button
              onClick={onBackToLogin}
              style={{
                width:"100%", padding:".8rem",
                background:BLUE, color:WHITE,
                border:"none", borderRadius:10, fontWeight:700, fontSize:15,
                cursor:"pointer", fontFamily:"inherit",
              }}
            >
              Kembali ke Masuk
            </button>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              style={{
                width:"100%", padding:".7rem", marginTop:".75rem",
                background:WHITE, color:MUTED,
                border:"1.5px solid #D1D9EF", borderRadius:10, fontWeight:600, fontSize:13,
                cursor:"pointer", fontFamily:"inherit",
              }}
            >
              Kirim ulang ke email lain
            </button>
          </div>
        )}
      </div>
      <IllustrationPanel bg="linear-gradient(145deg,#FEF3C7,#FDE68A)" accent={YELLOW}/>
    </ModalShell>
  );
}