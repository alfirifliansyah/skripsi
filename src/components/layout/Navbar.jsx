import { BLUE, BLUE_L, BLUE_M, WHITE, DARK, MUTED } from "../../constants/colors";
import { NAV_LINKS } from "../../constants/data";

export default function Navbar({ activeNav, onNav, onLogin, onRegister, scrolled, user, onGoProfile, onLogout }) {
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:68, padding:"0 3rem", background:scrolled?"rgba(255,255,255,.93)":WHITE, backdropFilter:scrolled?"blur(16px)":"none", borderBottom:"1px solid #E5EAF5", boxShadow:scrolled?"0 2px 20px rgba(27,79,216,.07)":"none", transition:"all .35s", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <button onClick={()=>onNav("Beranda")} style={{ display:"flex", alignItems:"center", gap:".7rem", background:"none", border:"none", cursor:"pointer" }}>
        <div style={{ width:38, height:38, background:BLUE, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:WHITE }}>IMA</div>
        <span style={{ fontWeight:700, fontSize:15, color:DARK, fontFamily:"inherit" }}>IMA Creative<span style={{ color:BLUE }}>.</span></span>
      </button>
      <div style={{ display:"flex", gap:"2rem", alignItems:"center" }}>
        {NAV_LINKS.map(link => (
          <button key={link} onClick={()=>onNav(link)} style={{ background:"none", border:"none", cursor:"pointer", color:activeNav===link?BLUE:MUTED, fontWeight:activeNav===link?700:400, fontSize:14, padding:".25rem 0", borderBottom:`2px solid ${activeNav===link?BLUE:"transparent"}`, transition:"all .2s", fontFamily:"inherit" }}>{link}</button>
        ))}
        {user ? (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={onGoProfile} style={{ display:"flex", alignItems:"center", gap:9, background:BLUE_L, border:`1.5px solid ${BLUE}33`, borderRadius:10, padding:".45rem .9rem .45rem .55rem", cursor:"pointer", fontFamily:"inherit", transition:"background .2s" }}
              onMouseOver={e=>e.currentTarget.style.background="#DDE8FF"} onMouseOut={e=>e.currentTarget.style.background=BLUE_L}>
              <div style={{ width:30, height:30, borderRadius:"50%", background:BLUE, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:WHITE, flexShrink:0 }}>{user.avatar}</div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:12, fontWeight:700, color:DARK, lineHeight:1.2 }}>{user.name.split(" ")[0]}</div>
                <div style={{ fontSize:10, color:MUTED, lineHeight:1.2 }}>{user.company?.slice(0,18)}</div>
              </div>
            </button>
            <button onClick={onLogout} style={{ background:"none", border:"1.5px solid #E5EAF5", color:MUTED, padding:".45rem .75rem", borderRadius:8, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:600, transition:"all .2s" }}
              onMouseOver={e=>{e.currentTarget.style.borderColor="#EF4444";e.currentTarget.style.color="#EF4444";}} onMouseOut={e=>{e.currentTarget.style.borderColor="#E5EAF5";e.currentTarget.style.color=MUTED;}}>Keluar</button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onLogin} style={{ background:WHITE, border:`1.5px solid ${BLUE}`, color:BLUE, padding:".55rem 1.2rem", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"inherit", transition:"background .2s" }}
              onMouseOver={e=>e.target.style.background=BLUE_L} onMouseOut={e=>e.target.style.background=WHITE}>Masuk</button>
            <button onClick={onRegister} style={{ background:BLUE, border:"none", color:WHITE, padding:".55rem 1.2rem", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"inherit", transition:"background .2s" }}
              onMouseOver={e=>e.target.style.background=BLUE_M} onMouseOut={e=>e.target.style.background=BLUE}>Daftar</button>
          </div>
        )}
      </div>
    </nav>
  );
}