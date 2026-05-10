import { useState, useEffect } from "react";
import { BLUE, BLUE_L, BG, WHITE, DARK, MUTED } from "../constants/colors";
import { ALL_PROJECTS, BUMN_CLIENTS } from "../constants/data";
import Navbar from "../components/layout/Navbar";
import Anim from "../components/ui/Anim";
import Label from "../components/ui/Label";

export default function PortfolioPage({
  portofolio = [],
  onBack, onGoJasa, onGoPemesanan, onLogin, onRegister, user, onGoProfile, onLogout,
}) {
  const [filter,   setFilter]   = useState("Semua");
  const [active,   setActive]   = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Pakai data dari API kalau ada, fallback ke ALL_PROJECTS lama
  const items = portofolio.length > 0
    ? portofolio.map(p => ({
        id:        p.id_portofolio || p.id,
        title:     p.judul || p.label,
        client:    p.klien || "—",
        year:      p.tanggal_proyek ? new Date(p.tanggal_proyek).getFullYear() : "",
        desc:      p.deskripsi || "",
        emoji:     p.icon || "🎬",
        gradient:  p.img_bg || p.imgBg || "linear-gradient(135deg,#1B4FD8,#23d5ab)",
        tag:       p.tag || p.kategori || "PROJECT",
        kategori:  p.kategori || "Umum",
        span:      "normal",
      }))
    : ALL_PROJECTS;

  // Generate filter tags dari kategori unik
  const uniqueCats = [...new Set(items.map(i => i.kategori || i.tag))].filter(Boolean);
  const tags = ["Semua", ...uniqueCats];
  const shown = filter === "Semua" ? items : items.filter(p => (p.kategori || p.tag) === filter);

  const handleNav = (link) => {
    if (link === "Beranda")   { onBack();        return; }
    if (link === "Jasa")      { onGoJasa();      return; }
    if (link === "Pemesanan") { onGoPemesanan(); return; }
  };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, minHeight:"100vh" }}>
      <Navbar activeNav="Portofolio" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>

      {/* Project detail modal */}
      {active && (
        <div onClick={()=>setActive(null)} style={{ position:"fixed", inset:0, zIndex:999, background:"rgba(15,27,61,.6)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem", animation:"fadeIn .2s ease" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:WHITE, borderRadius:20, overflow:"hidden", width:"min(620px,96vw)", boxShadow:"0 32px 80px rgba(15,27,61,.25)", animation:"slideUp .28s ease" }}>
            <div style={{ height:200, background:active.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:72, position:"relative" }}>
              {active.emoji}
              <span style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,.25)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.4)", color:WHITE, fontSize:11, fontWeight:700, padding:".3rem .8rem", borderRadius:100 }}>{active.tag}</span>
              <button onClick={()=>setActive(null)} style={{ position:"absolute", top:14, left:16, background:"rgba(255,255,255,.2)", border:"none", color:WHITE, width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>←</button>
            </div>
            <div style={{ padding:"2rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".75rem" }}>
                <h3 style={{ fontWeight:800, fontSize:"1.25rem", color:DARK }}>{active.title}</h3>
                {active.year && <span style={{ fontSize:12, color:MUTED, fontWeight:500 }}>{active.year}</span>}
              </div>
              {active.client && active.client !== "—" && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:BLUE_L, color:BLUE, fontSize:12, fontWeight:600, padding:".3rem .8rem", borderRadius:100, marginBottom:"1rem" }}>
                  👤 Klien: {active.client}
                </div>
              )}
              <p style={{ color:MUTED, lineHeight:1.85, marginBottom:"1.5rem" }}>{active.desc || "Deskripsi proyek belum diisi."}</p>
              <button onClick={()=>setActive(null)} style={{ width:"100%", padding:".85rem", background:BLUE, color:WHITE, border:"none", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth:1920, margin:"0 auto", padding:"7rem 3rem 5rem" }}>
        <Anim>
          <button onClick={onBack} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"none", border:"none", color:MUTED, fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:"inherit", marginBottom:"2rem", padding:0, transition:"color .2s" }}
            onMouseOver={e=>e.currentTarget.style.color=BLUE} onMouseOut={e=>e.currentTarget.style.color=MUTED}>
            ← Kembali ke Beranda
          </button>
          <Label>KARYA KAMI</Label>
          <h1 style={{ fontSize:"clamp(2rem,4vw,3rem)", fontWeight:800, color:DARK, letterSpacing:"-.02em", marginBottom:".75rem" }}>
            Project <span style={{ color:BLUE }}>Kami.</span>
          </h1>
          <p style={{ fontSize:16, color:MUTED, lineHeight:1.85, maxWidth:540, marginBottom:"2.5rem" }}>
            Kami telah menangani {items.length} proyek multimedia untuk perusahaan-perusahaan terkemuka di seluruh Indonesia.
          </p>
        </Anim>

        {/* Filter chips */}
        {tags.length > 1 && (
          <Anim delay={0.05}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"3rem" }}>
              {tags.map(t => (
                <button key={t} onClick={()=>setFilter(t)} style={{ background:filter===t?BLUE:WHITE, color:filter===t?WHITE:DARK, border:`1.5px solid ${filter===t?BLUE:"#D1D9EF"}`, padding:".45rem 1.1rem", borderRadius:100, fontSize:13, fontWeight:filter===t?700:500, cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}>{t}</button>
              ))}
            </div>
          </Anim>
        )}

        {/* Grid */}
        {shown.length === 0 ? (
          <div style={{ textAlign:"center", padding:"5rem", background:WHITE, borderRadius:18, border:"1.5px solid #E5EAF5" }}>
            <div style={{ fontSize:48, marginBottom:"1rem" }}>🖼️</div>
            <p style={{ fontSize:14, color:MUTED }}>Belum ada portofolio dengan filter "{filter}"</p>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:"1.25rem" }}>
            {shown.map((item, i) => (
              <Anim key={item.id || i} delay={i*0.05}>
                <div onClick={()=>setActive(item)} style={{ borderRadius:16, overflow:"hidden", cursor:"pointer", background:item.gradient, position:"relative", height:240, display:"flex", flexDirection:"column", justifyContent:"flex-end", transition:"transform .28s, box-shadow .28s" }}
                  onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-5px) scale(1.01)"; e.currentTarget.style.boxShadow="0 20px 48px rgba(27,79,216,.2)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0) scale(1)"; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-55%)", fontSize:72, opacity:.22, pointerEvents:"none", userSelect:"none" }}>{item.emoji}</div>
                  <span style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,.2)", backdropFilter:"blur(8px)", color:WHITE, fontSize:10, fontWeight:700, padding:".25rem .7rem", borderRadius:100, border:"1px solid rgba(255,255,255,.3)" }}>{item.tag}</span>
                  <div style={{ background:"linear-gradient(to top,rgba(0,0,0,.75) 0%,transparent 100%)", padding:"1.5rem 1.75rem" }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.65)", marginBottom:4 }}>{item.client}{item.year ? ` · ${item.year}` : ""}</div>
                    <div style={{ fontWeight:700, fontSize:16, color:WHITE, marginBottom:4 }}>{item.title}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,.7)", display:"flex", alignItems:"center", gap:5 }}>Lihat detail <span>→</span></div>
                  </div>
                </div>
              </Anim>
            ))}
          </div>
        )}

        {/* Klien & BUMN */}
        <Anim delay={0.1}>
          <div style={{ marginTop:"6rem" }}>
            <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
              <Label>KLIEN KAMI</Label>
              <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:700, color:DARK }}>Dipercaya Perusahaan <span style={{ color:BLUE }}>Terkemuka</span></h2>
              <p style={{ color:MUTED, marginTop:".6rem", fontSize:15 }}>Kami bangga melayani korporasi besar di Indonesia, termasuk perusahaan BUMN dan multinasional.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.25rem" }}>
              {BUMN_CLIENTS.map(client => (
                <div key={client.name} style={{ background:WHITE, border:"1.5px solid #E5EAF5", borderRadius:14, padding:"1.25rem 1rem", display:"flex", alignItems:"center", gap:".9rem", transition:"border-color .25s,transform .25s,box-shadow .25s", cursor:"default" }}
                  onMouseOver={e=>{ e.currentTarget.style.borderColor=client.color; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.08)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.borderColor="#E5EAF5"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ width:44, height:44, borderRadius:10, flexShrink:0, background:client.bg, border:`2px solid ${client.color}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontWeight:900, fontSize:11, color:client.color, letterSpacing:"-.5px" }}>{client.abbr}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:DARK }}>{client.name}</div>
                    <div style={{ fontSize:11, color:MUTED }}>{client.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:WHITE, border:"1.5px solid #E5EAF5", borderRadius:14, padding:"1.25rem 2rem", display:"flex", alignItems:"center", justifyContent:"center", gap:"3rem", flexWrap:"wrap" }}>
              {[["🏅","Vendor Resmi BUMN"],["✅","Terverifikasi Kemenperin"],["🔒","ISO 9001:2015"],["⭐","4.9/5 Rating Klien"]].map(([ic,tx])=>(
                <div key={tx} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>{ic}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:DARK }}>{tx}</span>
                </div>
              ))}
            </div>
          </div>
        </Anim>
      </div>

      <div style={{ borderTop:"1px solid #E5EAF5", padding:"1.5rem 3rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:MUTED }}>© 2024 PT. IMA Creative Production</span>
        <button onClick={onBack} style={{ background:"none", border:"none", color:BLUE, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>← Kembali ke Beranda</button>
      </div>
    </div>
  );
}
