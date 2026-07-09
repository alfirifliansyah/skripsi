import { useState } from "react";
import { BLUE, WHITE, DARK, MUTED, YELLOW } from "../../constants/colors";
import { authAPI } from "../../services/api";
import ModalShell from "./ModalShell";
import IllustrationPanel from "./IllustrationPanel";


export default function RegisterModal({ onClose, onSwitch, onSuccess }) {
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [company,   setCompany]   = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [agreed,    setAgreed]    = useState(false);
  const [focused,   setFocused]   = useState({});
  const [loading,   setLoading]   = useState(false);
  const [err,       setErr]       = useState("");

  const canSubmit = firstName && lastName && email && phone && company && password && confirm && agreed && password === confirm && !loading;

  const fStyle = (key) => ({
    width:"100%", padding:".65rem .9rem",
    border:`1.5px solid ${focused[key]?BLUE:"#D1D9EF"}`, borderRadius:10, fontSize:14,
    color:DARK, fontFamily:"inherit", outline:"none",
    background:focused[key]?"#FAFBFF":WHITE, transition:"border-color .2s,background .2s",
    boxShadow:focused[key]?"0 0 0 3px rgba(27,79,216,0.1)":"none",
  });

  const handleRegister = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    try {
      const user = await authAPI.register({ firstName, lastName, email, phone, company, password, confirm });
      onSuccess(user);
    } catch (e) {
      setErr(e.message || "Registrasi gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <IllustrationPanel bg="linear-gradient(145deg,#FEFCE8,#FEF3C7)" accent={BLUE}/>
      <div style={{ padding:"2rem 2.5rem", display:"flex", flexDirection:"column", justifyContent:"center", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:".5rem", marginBottom:"1.25rem" }}>
          <div style={{ width:30, height:30, background:BLUE, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:WHITE }}>IMA</div>
          <span style={{ fontWeight:700, fontSize:13, color:DARK }}>IMA Creative<span style={{ color:BLUE }}>.</span></span>
        </div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:DARK, marginBottom:".3rem", letterSpacing:"-.02em" }}>Buat Akun Baru</h2>
        <p style={{ fontSize:13, color:MUTED, marginBottom:"1.2rem" }}>Daftar dan nikmati layanan multimedia profesional kami.</p>

        {err && (
          <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:".75rem 1rem", marginBottom:"1rem", fontSize:13, color:"#DC2626" }}>
            ⚠️ {err}
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 .75rem", marginBottom:"1rem" }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:DARK, marginBottom:".3rem" }}>Nama Depan</label>
            <input value={firstName} onChange={e=>{setFirstName(e.target.value);setErr("");}} placeholder="John" style={fStyle("fn")} onFocus={()=>setFocused(f=>({...f,fn:true}))} onBlur={()=>setFocused(f=>({...f,fn:false}))}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:DARK, marginBottom:".3rem" }}>Nama Belakang</label>
            <input value={lastName} onChange={e=>{setLastName(e.target.value);setErr("");}} placeholder="Doe" style={fStyle("ln")} onFocus={()=>setFocused(f=>({...f,ln:true}))} onBlur={()=>setFocused(f=>({...f,ln:false}))}/>
          </div>
        </div>

        {[["Email","email",email,setEmail,"nama@email.com","em","✉️"],["Nomor Telepon","tel",phone,setPhone,"+62 812 xxxx xxxx","ph","📞"],["Perusahaan / Instansi","text",company,setCompany,"PT / CV / Instansi / Universitas","co","🏢"]].map(([lbl,type,val,setter,ph,key,icon])=>(
          <div key={key} style={{ marginBottom:".9rem" }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:DARK, marginBottom:".3rem" }}>{lbl} <span style={{ color:"#EF4444" }}>*</span></label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none" }}>{icon}</span>
              <input type={type} value={val} onChange={e=>{setter(e.target.value);setErr("");}} placeholder={ph} style={{...fStyle(key), paddingLeft:"2.4rem"}}
                onFocus={()=>setFocused(f=>({...f,[key]:true}))} onBlur={()=>setFocused(f=>({...f,[key]:false}))}/>
            </div>
          </div>
        ))}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 .75rem", marginBottom:".9rem" }}>
          {[["Password","pw",password,setPassword,"Min. 6 karakter"],["Konfirmasi","cf",confirm,setConfirm,"Ulangi password"]].map(([lbl,key,val,setter,ph])=>(
            <div key={key}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:DARK, marginBottom:".3rem" }}>{lbl}</label>
              <input type="password" value={val} onChange={e=>{setter(e.target.value);setErr("");}} placeholder={ph} style={fStyle(key)}
                onFocus={()=>setFocused(f=>({...f,[key]:true}))} onBlur={()=>setFocused(f=>({...f,[key]:false}))}/>
            </div>
          ))}
        </div>
        {password && confirm && password !== confirm && (
          <p style={{ fontSize:12, color:"#DC2626", marginBottom:".5rem", marginTop:"-.5rem" }}>⚠️ Password tidak cocok</p>
        )}

        <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:"1rem" }}>
          <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ accentColor:BLUE, marginTop:3, flexShrink:0 }}/>
          <span style={{ fontSize:12, color:MUTED, lineHeight:1.6 }}>Saya menyetujui <span style={{ color:BLUE, fontWeight:600 }}>Syarat & Ketentuan</span> serta <span style={{ color:BLUE, fontWeight:600 }}>Kebijakan Privasi</span>.</span>
        </div>

        <button disabled={!canSubmit} onClick={handleRegister}
          style={{ width:"100%", padding:".8rem", background:canSubmit?YELLOW:"#D1D9EF", color:canSubmit?DARK:MUTED, border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:canSubmit?"pointer":"not-allowed", fontFamily:"inherit", marginBottom:".75rem", boxShadow:canSubmit?"0 4px 16px rgba(250,204,21,.35)":"none", transition:"opacity .2s" }}
          onMouseOver={e=>{if(canSubmit)e.target.style.opacity=.88;}} onMouseOut={e=>e.target.style.opacity=1}>
          {loading ? "Mendaftar..." : "Daftar Sekarang"}
        </button>
        
        <p style={{ textAlign:"center", fontSize:13, color:MUTED, marginTop:"1rem" }}>
          Sudah punya akun?{" "}
          <button onClick={onSwitch} style={{ background:"none", border:"none", color:BLUE, fontWeight:700, cursor:"pointer", fontFamily:"inherit", fontSize:13 }}>Masuk di sini</button>
        </p>
      </div>
    </ModalShell>
  );
}