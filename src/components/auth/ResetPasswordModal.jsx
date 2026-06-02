import { useState, useEffect } from "react";
import { BLUE, BLUE_L, WHITE, DARK, MUTED, YELLOW } from "../../constants/colors";
import { authAPI } from "../../services/api";
import ModalShell from "./ModalShell";
import IllustrationPanel from "./IllustrationPanel";

/**
 * ResetPasswordModal — modal kedua dari flow lupa password.
 *
 * Muncul OTOMATIS saat user buka URL dengan query parameter:
 *   http://localhost:5173/reset-password?token=xxx&email=user@example.com
 *
 * Props:
 *   token, email   : dari URL query (di-pass oleh App.jsx)
 *   onClose        : tutup modal (& clear URL params)
 *   onSuccess      : password berhasil direset, redirect ke login
 */
export default function ResetPasswordModal({ token, email, onClose, onSuccess }) {
  const [password,    setPassword]    = useState("");
  const [confirmPwd,  setConfirmPwd]  = useState("");
  const [focused,     setFocused]     = useState({});
  const [loading,     setLoading]     = useState(false);
  const [err,         setErr]         = useState("");
  const [showPwd,     setShowPwd]     = useState(false);

  // Validasi token & email saat mount
  useEffect(() => {
    if (!token || !email) {
      setErr("Link tidak valid. Pastikan kamu membuka link dari email.");
    }
  }, [token, email]);

  // Indikator kekuatan password
  const pwdStrength = (() => {
    if (password.length < 6) return { label: "Terlalu pendek", color: "#DC2626", pct: 20 };
    if (password.length < 8) return { label: "Lemah",          color: "#F59E0B", pct: 40 };
    if (password.length < 10) return { label: "Cukup",          color: "#F59E0B", pct: 60 };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { label: "Baik", color: "#10B981", pct: 80 };
    }
    return { label: "Kuat", color: "#059669", pct: 100 };
  })();

  const passwordsMatch = password && confirmPwd && password === confirmPwd;
  const canSubmit = password.length >= 6 && passwordsMatch && !loading && token && email;

  const fStyle = (key) => ({
    width:"100%", padding:".65rem .9rem .65rem 2.5rem",
    border:`1.5px solid ${focused[key]?BLUE:"#D1D9EF"}`, borderRadius:10, fontSize:14,
    color:DARK, fontFamily:"inherit", outline:"none",
    background:focused[key]?"#FAFBFF":WHITE, transition:"border-color .2s,background .2s",
    boxShadow:focused[key]?"0 0 0 3px rgba(27,79,216,0.1)":"none",
  });

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    try {
      await authAPI.resetPassword({ email, token, password, password_confirmation: confirmPwd });
      onSuccess(); // notify App.jsx to clear URL & show login
    } catch (e) {
      setErr(e.message || "Gagal reset password. Mungkin link sudah kadaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  // Kalau token/email tidak ada, tampil halaman error saja
  if (!token || !email) {
    return (
      <ModalShell onClose={onClose}>
        <div style={{ padding:"3rem 2.5rem", display:"flex", flexDirection:"column", justifyContent:"center", textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"#FEF2F2", margin:"0 auto 1.5rem", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>
            ⚠️
          </div>
          <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:DARK, marginBottom:".5rem" }}>
            Link Tidak Valid
          </h2>
          <p style={{ fontSize:14, color:MUTED, marginBottom:"1.5rem", lineHeight:1.7 }}>
            Link reset password tidak lengkap atau sudah kadaluwarsa.<br/>
            Silakan minta link baru.
          </p>
          <button onClick={onClose} style={{ padding:".8rem", background:BLUE, color:WHITE, border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>
            Tutup
          </button>
        </div>
        <IllustrationPanel bg="linear-gradient(145deg,#FEE2E2,#FECACA)" accent="#DC2626"/>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div style={{ padding:"3rem 2.5rem", display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:"2rem" }}>
          <div style={{ width:30, height:30, background:BLUE, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:WHITE }}>IMA</div>
          <span style={{ fontWeight:700, fontSize:13, color:DARK }}>IMA Creative<span style={{ color:BLUE }}>.</span></span>
        </div>

        <h2 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".4rem", letterSpacing:"-.02em" }}>
          Buat Password Baru
        </h2>
        <p style={{ fontSize:14, color:MUTED, marginBottom:"1.5rem", lineHeight:1.7 }}>
          Reset password untuk akun:<br/>
          <strong style={{ color:DARK }}>{email}</strong>
        </p>

        {err && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:".75rem 1rem", marginBottom:"1rem", fontSize:13, color:"#DC2626" }}>
            ⚠️ {err}
          </div>
        )}

        {/* Password Baru */}
        <div style={{ marginBottom:"1rem" }}>
          <label style={{ display:"block", fontSize:13, fontWeight:600, color:DARK, marginBottom:".4rem" }}>
            Password Baru
          </label>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>🔒</span>
            <input
              type={showPwd?"text":"password"}
              value={password}
              onChange={e=>{ setPassword(e.target.value); setErr(""); }}
              placeholder="Minimal 6 karakter"
              autoFocus
              style={{ ...fStyle("pw"), paddingRight:"2.5rem" }}
              onFocus={()=>setFocused(f=>({...f,pw:true}))}
              onBlur={()=>setFocused(f=>({...f,pw:false}))}
            />
            <button
              type="button"
              onClick={()=>setShowPwd(s=>!s)}
              style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, padding:4 }}
            >
              {showPwd ? "🙈" : "👁️"}
            </button>
          </div>
          {password && (
            <div style={{ marginTop:6 }}>
              <div style={{ height:4, background:"#E5EAF5", borderRadius:2, overflow:"hidden" }}>
                <div style={{
                  height:"100%", width:`${pwdStrength.pct}%`, background:pwdStrength.color,
                  transition:"width .2s, background .2s",
                }}/>
              </div>
              <p style={{ fontSize:11, color:pwdStrength.color, marginTop:4, fontWeight:600 }}>
                Kekuatan password: {pwdStrength.label}
              </p>
            </div>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div style={{ marginBottom:"1.4rem" }}>
          <label style={{ display:"block", fontSize:13, fontWeight:600, color:DARK, marginBottom:".4rem" }}>
            Konfirmasi Password Baru
          </label>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>🔒</span>
            <input
              type={showPwd?"text":"password"}
              value={confirmPwd}
              onChange={e=>{ setConfirmPwd(e.target.value); setErr(""); }}
              placeholder="Ulangi password baru"
              style={fStyle("cf")}
              onFocus={()=>setFocused(f=>({...f,cf:true}))}
              onBlur={()=>setFocused(f=>({...f,cf:false}))}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            />
          </div>
          {confirmPwd && !passwordsMatch && (
            <p style={{ fontSize:11, color:"#DC2626", marginTop:4, fontWeight:600 }}>
              ✗ Password tidak cocok
            </p>
          )}
          {passwordsMatch && (
            <p style={{ fontSize:11, color:"#059669", marginTop:4, fontWeight:600 }}>
              ✓ Password cocok
            </p>
          )}
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
            boxShadow:canSubmit?"0 4px 16px rgba(27,79,216,.3)":"none",
            transition:"opacity .2s",
          }}
          onMouseOver={e=>{if(canSubmit)e.target.style.opacity=.88;}}
          onMouseOut={e=>e.target.style.opacity=1}
        >
          {loading ? "Memproses..." : "✓ Reset Password"}
        </button>

        <p style={{ textAlign:"center", fontSize:13, color:MUTED, marginTop:"1.5rem" }}>
          Batalkan reset?{" "}
          <button onClick={onClose} style={{ background:"none", border:"none", color:BLUE, fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>
            Kembali ke Beranda
          </button>
        </p>
      </div>
      <IllustrationPanel bg="linear-gradient(145deg,#DCFCE7,#BBF7D0)" accent="#059669"/>
    </ModalShell>
  );
}