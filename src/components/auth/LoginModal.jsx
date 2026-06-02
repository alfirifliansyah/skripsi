import { useState } from "react";
import { BLUE, BLUE_L, WHITE, DARK, MUTED, YELLOW } from "../../constants/colors";
import { authAPI } from "../../services/api";
import ModalShell from "./ModalShell";
import IllustrationPanel from "./IllustrationPanel";
import GoogleBtn from "./GoogleBtn";

export default function LoginModal({ onClose, onSwitch, onSuccess, onForgotPassword }) {
  const [email,    setEmail]   = useState("");
  const [password, setPassword]= useState("");
  const [focused,  setFocused] = useState({});
  const [loading,  setLoading] = useState(false);
  const [err,      setErr]     = useState("");

  const canSubmit = email && password && !loading;

  const fStyle = (key) => ({
    width:"100%", padding:".65rem .9rem .65rem 2.5rem",
    border:`1.5px solid ${focused[key]?BLUE:"#D1D9EF"}`, borderRadius:10, fontSize:14,
    color:DARK, fontFamily:"inherit", outline:"none",
    background:focused[key]?"#FAFBFF":WHITE, transition:"border-color .2s,background .2s",
    boxShadow:focused[key]?"0 0 0 3px rgba(27,79,216,0.1)":"none",
  });

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    try {
      const user = await authAPI.login({ email, password });
      onSuccess(user);
    } catch (e) {
      setErr(e.message || "Email atau password salah");
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
        <h2 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".4rem", letterSpacing:"-.02em" }}>Selamat Datang!</h2>
        <p style={{ fontSize:14, color:MUTED, marginBottom:"1.8rem" }}>Masuk untuk mengakses layanan IMA Creative Production.</p>

        {err && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:".75rem 1rem", marginBottom:"1rem", fontSize:13, color:"#DC2626" }}>
            ⚠️ {err}
          </div>
        )}

        {[["Email","email",email,setEmail,"nama@email.com","em","✉️"],["Password","password",password,setPassword,"Masukkan password","pw","🔒"]].map(([lbl,type,val,setter,ph,key,icon])=>(
          <div key={key} style={{ marginBottom:"1rem" }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:DARK, marginBottom:".4rem" }}>{lbl}</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>{icon}</span>
              <input type={type} value={val} onChange={e=>{setter(e.target.value);setErr("");}} placeholder={ph} style={fStyle(key)}
                onFocus={()=>setFocused(f=>({...f,[key]:true}))} onBlur={()=>setFocused(f=>({...f,[key]:false}))}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            </div>
          </div>
        ))}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.4rem" }}>
          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:MUTED, cursor:"pointer" }}>
            <input type="checkbox" style={{ accentColor:BLUE }}/> Ingat saya
          </label>
          <button onClick={onForgotPassword} style={{ background:"none", border:"none", color:BLUE, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Lupa password?</button>
        </div>

        <button onClick={handleLogin} disabled={!canSubmit}
          style={{ width:"100%", padding:".8rem", background:canSubmit?BLUE:"#D1D9EF", color:canSubmit?WHITE:MUTED, border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:canSubmit?"pointer":"not-allowed", fontFamily:"inherit", marginBottom:".9rem", boxShadow:canSubmit?"0 4px 16px rgba(27,79,216,.3)":"none", transition:"opacity .2s" }}
          onMouseOver={e=>{if(canSubmit)e.target.style.opacity=.88;}} onMouseOut={e=>e.target.style.opacity=1}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <GoogleBtn label="Masuk dengan Google"/>
        <p style={{ textAlign:"center", fontSize:13, color:MUTED, marginTop:"1.5rem" }}>
          Belum punya akun?{" "}
          <button onClick={onSwitch} style={{ background:"none", border:"none", color:BLUE, fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>Daftar gratis!</button>
        </p>
      </div>
      <IllustrationPanel bg="linear-gradient(145deg,#EEF2FF,#DBEAFE)" accent={YELLOW}/>
    </ModalShell>
  );
}