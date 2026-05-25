import { useState, useEffect } from "react";
import { BLUE, BLUE_L, BG, WHITE, DARK, MUTED, YELLOW, YELLOW_L } from "../constants/colors";
import { SERVICES_FALLBACK, VALUES, PORTFOLIO_PREVIEW } from "../constants/data";
import Navbar from "../components/layout/Navbar";
import Anim from "../components/ui/Anim";
import Label from "../components/ui/Label";

export default function HomePage({
  jasaList = [], jasaLoading = false,
  portofolio = [], pengaturan = {},
  onGoPortfolio, onGoJasa, onGoPemesanan,
  onLogin, onRegister, user, onGoProfile, onLogout,
}) {
  const [activeNav, setActiveNav] = useState("Beranda");
  const [scrolled,  setScrolled]  = useState(false);

  const t = (key, fallback) => pengaturan[key] || fallback;

  const handleNav = (link) => {
    setActiveNav(link);
    if (link === "Portofolio") { onGoPortfolio(); return; }
    if (link === "Jasa")       { onGoJasa();       return; }
    if (link === "Pemesanan")  { onGoPemesanan();  return; }
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const previewServices = jasaList.length >= 2
    ? jasaList.slice(0, 2)
    : SERVICES_FALLBACK.slice(0, 2).map((s, i) => ({
        id: `fb-${i}`,
        title: s.title,
        desc:  s.desc,
        emoji: s.icon,
        tag:   "Layanan",
        imgBg: i === 0
          ? "linear-gradient(135deg,#1a2a6c,#1B4FD8 60%,#23d5ab)"
          : "linear-gradient(135deg,#4c1d95,#7c3aed)",
      }));

  const totalServices = jasaList.length || SERVICES_FALLBACK.length;

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, overflowX:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=DM+Serif+Display:ital@1&display=swap" rel="stylesheet"/>
      <Navbar activeNav={activeNav} onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", paddingTop:68, position:"relative", overflow:"hidden" }}>
        <div className="deco-circle-lg" style={{ position:"absolute", top:"10%", right:"2%", width:440, height:440, borderRadius:"50%", background:BLUE_L, zIndex:0 }}/>
        <div className="deco-circle-sm" style={{ position:"absolute", bottom:"5%", left:"-4%", width:220, height:220, borderRadius:"50%", background:YELLOW_L, zIndex:0 }}/>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${BLUE},${YELLOW})` }}/>
        <div className="grid-2 section-hero" style={{ maxWidth:1920, margin:"0 auto", padding:"5rem 3rem", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center", width:"100%", position:"relative", zIndex:1 }}>
          <Anim>
            <Label>{t("hero_label", "PRODUCTION HOUSE TERPERCAYA")}</Label>
            <h1 className="hero-title" style={{ fontSize:"clamp(2.4rem,4.5vw,3.5rem)", fontWeight:700, lineHeight:1.15, marginBottom:"1.4rem", color:DARK, letterSpacing:"-.02em" }}>
              {t("hero_title", "Solusi Kreatif & Teknologi untuk Bisnis Anda")}
            </h1>
            <p className="hero-subtitle" style={{ fontSize:16, color:MUTED, lineHeight:1.85, marginBottom:"2.5rem", maxWidth:460 }}>
              {t("hero_subtitle", "PT. IMA Creative Production bergerak di bidang IT, Multimedia, dan Teknologi.")}
            </p>
            <div className="btn-group" style={{ display:"flex", gap:"1rem", flexWrap:"wrap", marginBottom:"2.5rem" }}>
              <button onClick={onGoPortfolio} style={{ background:BLUE, color:WHITE, border:"none", padding:".85rem 2rem", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"inherit", boxShadow:"0 4px 16px rgba(27,79,216,.28)", transition:"transform .2s,box-shadow .2s" }}
                onMouseOver={e=>{ e.target.style.transform="translateY(-2px)"; e.target.style.boxShadow="0 8px 24px rgba(27,79,216,.35)"; }}
                onMouseOut={e=>{ e.target.style.transform="translateY(0)"; e.target.style.boxShadow="0 4px 16px rgba(27,79,216,.28)"; }}>Lihat Portofolio →</button>
              {!user && (
                <button onClick={onRegister} style={{ background:WHITE, color:DARK, border:"1.5px solid #D1D9EF", padding:".85rem 2rem", borderRadius:10, cursor:"pointer", fontWeight:500, fontSize:15, fontFamily:"inherit", transition:"border-color .2s" }}
                  onMouseOver={e=>e.target.style.borderColor=BLUE} onMouseOut={e=>e.target.style.borderColor="#D1D9EF"}>Daftar Gratis</button>
              )}
              {user && (
                <button onClick={onGoJasa} style={{ background:WHITE, color:DARK, border:"1.5px solid #D1D9EF", padding:".85rem 2rem", borderRadius:10, cursor:"pointer", fontWeight:500, fontSize:15, fontFamily:"inherit", transition:"border-color .2s" }}
                  onMouseOver={e=>e.target.style.borderColor=BLUE} onMouseOut={e=>e.target.style.borderColor="#D1D9EF"}>Lihat Jasa</button>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
              <div style={{ display:"flex" }}>
                {["#3B82F6","#60A5FA","#93C5FD","#BFDBFE"].map((c,i)=>(
                  <div key={i} style={{ width:30, height:30, borderRadius:"50%", background:c, border:"2px solid white", marginLeft:i?-8:0 }}/>
                ))}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:DARK }}>{t("stat_klien","200+")} Klien Puas</div>
                <div style={{ fontSize:12, color:MUTED }}>di seluruh Indonesia</div>
              </div>
            </div>
          </Anim>

          <Anim delay={0.15}>
            <div className="card-pad" style={{ background:WHITE, borderRadius:20, padding:"2rem", boxShadow:"0 8px 40px rgba(27,79,216,.1)", border:"1px solid #E5EAF5" }}>
              <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                {[
                  {val:t("stat_klien","200+"),     label:"Klien Aktif",       bg:BLUE_L,   text:BLUE      },
                  {val:t("stat_proyek","500+"),    label:"Proyek Selesai",    bg:YELLOW_L, text:"#92400E" },
                  {val:t("stat_pengalaman","10+"), label:"Tahun Pengalaman",  bg:BLUE_L,   text:BLUE      },
                  {val:t("stat_kota","15+"),       label:"Kota di Indonesia", bg:YELLOW_L, text:"#92400E" },
                ].map(item=>(
                  <div key={item.label} style={{ background:item.bg, borderRadius:12, padding:"1.25rem" }}>
                    <div style={{ fontSize:28, fontWeight:800, color:item.text }}>{item.val}</div>
                    <div style={{ fontSize:12, color:item.text, opacity:.75, marginTop:2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:BG, borderRadius:12, padding:"1rem 1.25rem", display:"flex", alignItems:"center", gap:".9rem", border:"1px solid #E5EAF5" }}>
                <div style={{ width:40, height:40, background:BLUE_L, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📡</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:DARK }}>Live Streaming Active</div>
                  <div style={{ fontSize:11, color:MUTED }}>3 event berjalan saat ini</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:8, height:8, background:"#22C55E", borderRadius:"50%" }}/>
                  <span style={{ fontSize:11, color:"#16A34A", fontWeight:700 }}>LIVE</span>
                </div>
              </div>
            </div>
          </Anim>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="section-pad" style={{ background:BLUE, padding:"2.5rem 3rem" }}>
        <div className="grid-4" style={{ maxWidth:1920, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", textAlign:"center", gap:"1rem" }}>
          {[
            [t("stat_klien","200+"),    "Klien Puas"],
            [t("stat_proyek","500+"),   "Proyek Selesai"],
            [t("stat_pengalaman","10+"),"Tahun Berpengalaman"],
            ["24/7",                    "Support Tim"]
          ].map(([n,l])=>(
            <div key={l}>
              <div style={{ fontSize:32, fontWeight:800, color:WHITE }}>{n}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,.7)", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section-pad" style={{ padding:"7rem 3rem", background:WHITE }}>
        <div className="grid-2" style={{ maxWidth:1920, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>
          <Anim>
            <div style={{ position:"relative" }}>
              <div className="about-image" style={{ background:BLUE_L, borderRadius:24, padding:"3rem", display:"flex", alignItems:"center", justifyContent:"center", aspectRatio:"1", maxWidth:340, margin:"0 auto" }}>
                <div className="about-image-inner" style={{ width:150, height:150, background:BLUE, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:60 }}>🎬</div>
              </div>
              <div style={{ position:"absolute", top:16, right:-8, background:WHITE, border:"1.5px solid #E5EAF5", borderRadius:12, padding:".6rem 1.1rem", fontSize:13, fontWeight:600, color:DARK, boxShadow:"0 4px 16px rgba(0,0,0,.07)" }}>✦ IT & Multimedia</div>
              <div style={{ position:"absolute", bottom:20, left:-8, background:YELLOW, borderRadius:12, padding:".6rem 1.1rem", fontSize:13, fontWeight:700, color:"#1C1200" }}>Since 2014 🎉</div>
            </div>
          </Anim>
          <Anim delay={0.15}>
            <Label>TENTANG KAMI</Label>
            <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.5rem)", fontWeight:700, lineHeight:1.25, marginBottom:"1.25rem", color:DARK }}>{t("about_title", "Inovasi & Kreativitas Tanpa Batas")}</h2>
            <p style={{ color:MUTED, lineHeight:1.9, marginBottom:"1.25rem", fontSize:15 }}>{t("about_text_1", "PT. IMA Creative Production adalah perusahaan yang bergerak di bidang IT, Multimedia, dan Teknologi.")}</p>
            <p style={{ color:MUTED, lineHeight:1.9, marginBottom:"2rem", fontSize:15 }}>{t("about_text_2", "Dengan tujuan memberikan kontribusi sosial dan budaya yang berharga.")}</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["IT Solutions","Multimedia","Broadcasting"].map(tag=>(
                <span key={tag} style={{ background:BLUE_L, color:BLUE, padding:".4rem 1rem", borderRadius:100, fontSize:13, fontWeight:600 }}>{tag}</span>
              ))}
            </div>
          </Anim>
        </div>
      </section>

      {/* ── DIRECTOR MESSAGE ── */}
      <section className="section-pad" style={{ padding:"6rem 3rem", background:BG, borderTop:"1px solid #E5EAF5", borderBottom:"1px solid #E5EAF5" }}>
        <Anim>
          <div style={{ maxWidth:720, margin:"0 auto", textAlign:"center" }}>
            <Label>DIRECTOR MESSAGE</Label>
            <div style={{ width:48, height:48, borderRadius:"50%", background:YELLOW, margin:"0 auto 1.5rem", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>💬</div>
            <blockquote style={{ fontFamily:"'DM Serif Display',serif", fontStyle:"italic", fontSize:"clamp(1.05rem,2.5vw,1.7rem)", lineHeight:1.65, color:DARK, margin:"0 0 2rem" }}>
              "{t("director_quote", "Saya pikir aturan bisnis yang sederhana adalah, jika Anda melakukan hal-hal yang lebih mudah terlebih dahulu, maka Anda benar-benar dapat membuat kemajuan.")}"
            </blockquote>
            <div style={{ width:48, height:3, background:YELLOW, margin:"0 auto 1.25rem", borderRadius:2 }}/>
            <div style={{ fontSize:13, color:MUTED, letterSpacing:".05em" }}>— {t("director_name", "Direktur Utama, PT. IMA Creative Production")}</div>
          </div>
        </Anim>
      </section>

      {/* ── HOW WE WORK ── */}
      <section className="section-pad" style={{ padding:"7rem 3rem", background:WHITE }}>
        <div style={{ maxWidth:1920, margin:"0 auto" }}>
          <Anim>
            <div style={{ textAlign:"center", marginBottom:"3.5rem" }}>
              <Label>CARA KERJA KAMI</Label>
              <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.6rem)", fontWeight:700, color:DARK }}>How We <span style={{ color:BLUE }}>Work</span></h2>
            </div>
          </Anim>
          <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
            {VALUES.map((v,i)=>(
              <Anim key={v.title} delay={i*.1}>
                <div className="card-pad" style={{ background:i===1?BLUE:WHITE, border:`1.5px solid ${i===1?BLUE:"#E5EAF5"}`, borderRadius:18, padding:"2rem", transition:"transform .25s,box-shadow .25s", cursor:"default" }}
                  onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-6px)"; e.currentTarget.style.boxShadow=i===1?"0 12px 32px rgba(27,79,216,.3)":"0 8px 24px rgba(27,79,216,.1)"; }}
                  onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                  <div style={{ width:48, height:48, borderRadius:12, marginBottom:"1.25rem", background:i===1?"rgba(255,255,255,.15)":BLUE_L, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{v.icon}</div>
                  <h3 style={{ fontWeight:700, fontSize:16, marginBottom:".75rem", color:i===1?WHITE:DARK }}>{v.title}</h3>
                  <p style={{ fontSize:14, lineHeight:1.8, color:i===1?"rgba(255,255,255,.78)":MUTED }}>{v.desc}</p>
                  {i===1 && <div style={{ marginTop:"1.5rem", display:"inline-flex", alignItems:"center", gap:6, background:YELLOW, color:"#1C1200", fontWeight:700, fontSize:12, padding:".4rem .9rem", borderRadius:100 }}>★ Unggulan</div>}
                </div>
              </Anim>
            ))}
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO PREVIEW ── */}
      <section className="section-pad" style={{ padding:"7rem 3rem", background:BG }}>
        <div style={{ maxWidth:1920, margin:"0 auto" }}>
          <Anim>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"3rem", flexWrap:"wrap", gap:"1rem" }}>
              <div>
                <Label>KARYA KAMI</Label>
                <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.6rem)", fontWeight:700, color:DARK }}>Project <span style={{ color:BLUE }}>Kami.</span></h2>
                <p style={{ fontSize:14, color:MUTED, marginTop:".5rem" }}>Sebagian proyek terbaik yang pernah kami kerjakan.</p>
              </div>
              <button onClick={onGoPortfolio} style={{ background:WHITE, border:`1.5px solid ${BLUE}`, color:BLUE, padding:".65rem 1.4rem", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"inherit", transition:"background .2s,transform .2s", display:"flex", alignItems:"center", gap:6 }}
                onMouseOver={e=>{ e.currentTarget.style.background=BLUE_L; e.currentTarget.style.transform="translateY(-2px)"; }} onMouseOut={e=>{ e.currentTarget.style.background=WHITE; e.currentTarget.style.transform="translateY(0)"; }}>Lihat Semua Proyek →</button>
            </div>
          </Anim>
          <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"1.25rem" }}>
            {(() => {
              const previewItems = portofolio.filter(p => p.is_featured || p.isFeatured).slice(0, 4);
              const fallback = previewItems.length === 0 ? portofolio.slice(0, 4) : previewItems;
              if (fallback.length === 0) {
                return PORTFOLIO_PREVIEW.map((item,i)=>(
                  <Anim key={item.label} delay={i*.08}>
                    <div onClick={onGoPortfolio} style={{ background:item.alt?YELLOW_L:BLUE_L, border:`1.5px solid ${item.alt?"#FDE68A":"#C7D5F8"}`, borderRadius:16, padding:"1.75rem", aspectRatio:"16/9", display:"flex", flexDirection:"column", cursor:"pointer", transition:"transform .25s,box-shadow .25s" }}>
                      <div style={{ fontSize:36, marginBottom:"auto" }}>{item.icon}</div>
                      <div>
                        <span style={{ background:item.alt?YELLOW:BLUE, color:item.alt?"#1C1200":WHITE, fontSize:10, fontWeight:700, padding:".25rem .65rem", borderRadius:4, letterSpacing:".06em", display:"inline-block", marginBottom:6 }}>{item.tag}</span>
                        <div style={{ fontWeight:700, fontSize:15, color:DARK }}>{item.label}</div>
                        <div style={{ fontSize:12, color:MUTED, marginTop:3 }}>Klik untuk melihat detail →</div>
                      </div>
                    </div>
                  </Anim>
                ));
              }
              return fallback.map((item, i) => (
                <Anim key={item.id_portofolio || item.id || i} delay={i*.08}>
                  <div onClick={onGoPortfolio} style={{ background:item.img_bg || item.imgBg || BLUE_L, border:`1.5px solid #C7D5F8`, borderRadius:16, padding:"1.75rem", aspectRatio:"16/9", display:"flex", flexDirection:"column", cursor:"pointer", transition:"transform .25s,box-shadow .25s", color:WHITE, position:"relative", overflow:"hidden" }}
                    onMouseOver={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(27,79,216,.18)"; }}
                    onMouseOut={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.5) 100%)" }}/>
                    <div style={{ fontSize:42, marginBottom:"auto", position:"relative" }}>{item.icon || "🎬"}</div>
                    <div style={{ position:"relative" }}>
                      <span style={{ background: item.tag_color || item.tagColor || YELLOW, color: WHITE, fontSize:10, fontWeight:700, padding:".25rem .65rem", borderRadius:4, letterSpacing:".06em", display:"inline-block", marginBottom:6 }}>{item.tag || item.kategori}</span>
                      <div style={{ fontWeight:700, fontSize:16, color:WHITE }}>{item.judul || item.label}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,.85)", marginTop:3 }}>{item.klien || "Klik untuk melihat detail →"}</div>
                    </div>
                  </div>
                </Anim>
              ));
            })()}
          </div>
          <Anim delay={0.15}>
            <div style={{ marginTop:"2rem", textAlign:"center" }}>
              <button onClick={onGoPortfolio} style={{ background:"none", border:"none", color:MUTED, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6, transition:"color .2s" }}
                onMouseOver={e=>e.currentTarget.style.color=BLUE} onMouseOut={e=>e.currentTarget.style.color=MUTED}>+ 5 proyek lainnya tersedia di halaman portofolio</button>
            </div>
          </Anim>
        </div>
      </section>

      {/* ── SERVICES PREVIEW ── */}
      <section className="section-pad" style={{ padding:"7rem 3rem", background:WHITE }}>
        <div style={{ maxWidth:1920, margin:"0 auto" }}>
          <Anim>
            <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:"3rem", flexWrap:"wrap", gap:"1rem" }}>
              <div>
                <Label>APA YANG KAMI TAWARKAN</Label>
                <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.6rem)", fontWeight:700, color:DARK }}>Layanan <span style={{ color:BLUE }}>Kami</span></h2>
                <p style={{ fontSize:14, color:MUTED, marginTop:".5rem" }}>Solusi multimedia profesional untuk setiap kebutuhan Anda.</p>
              </div>
              <button onClick={onGoJasa} style={{ background:WHITE, border:`1.5px solid ${BLUE}`, color:BLUE, padding:".65rem 1.4rem", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"inherit", transition:"background .2s,transform .2s", display:"flex", alignItems:"center", gap:6 }}
                onMouseOver={e=>{ e.currentTarget.style.background=BLUE_L; e.currentTarget.style.transform="translateY(-2px)"; }} onMouseOut={e=>{ e.currentTarget.style.background=WHITE; e.currentTarget.style.transform="translateY(0)"; }}>Lihat Semua Jasa →</button>
            </div>
          </Anim>

          {jasaLoading && jasaList.length === 0 ? (
            <div style={{ textAlign:"center",padding:"3rem",color:MUTED }}>
              <div style={{ fontSize:32, animation:"spin 1s linear infinite", display:"inline-block", marginBottom:"1rem" }}>⏳</div>
              <p>Memuat layanan...</p>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
              {previewServices.map((svc, i) => (
                <Anim key={svc.id} delay={i*.1}>
                  <div onClick={onGoJasa} className="jasa-card" style={{ background:BG, border:"1.5px solid #E5EAF5", borderRadius:16, padding:"1.5rem", display:"flex", gap:"1.5rem", cursor:"pointer", alignItems:"center", transition:"border-color .25s,transform .25s,box-shadow .25s" }}
                    onMouseOver={e=>{ e.currentTarget.style.borderColor=BLUE; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(27,79,216,.1)"; }} onMouseOut={e=>{ e.currentTarget.style.borderColor="#E5EAF5"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                    <div className="jasa-card-image" style={{ width:140, height:96, borderRadius:12, flexShrink:0, background:svc.imgBg || "linear-gradient(135deg,#1B4FD8,#23d5ab)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>{svc.emoji || svc.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <span style={{ background:BLUE_L, color:BLUE, fontSize:11, fontWeight:700, padding:".2rem .65rem", borderRadius:100 }}>{svc.tag || "Layanan"}</span>
                      </div>
                      <h3 style={{ fontWeight:700, fontSize:17, marginBottom:".4rem", color:DARK }}>{svc.title}</h3>
                      <p style={{ fontSize:13, lineHeight:1.7, color:MUTED, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{svc.desc}</p>
                    </div>
                    <div className="jasa-card-arrow" style={{ flexShrink:0, color:BLUE, fontSize:20 }}>→</div>
                  </div>
                </Anim>
              ))}
            </div>
          )}

          {totalServices > 2 && (
            <Anim delay={0.15}>
              <div style={{ marginTop:"1.5rem", textAlign:"center" }}>
                <button onClick={onGoJasa} style={{ background:"none", border:"none", color:MUTED, fontSize:14, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:6, transition:"color .2s" }}
                  onMouseOver={e=>e.currentTarget.style.color=BLUE} onMouseOut={e=>e.currentTarget.style.color=MUTED}>+ {totalServices - 2} layanan lainnya tersedia →</button>
              </div>
            </Anim>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad" style={{ padding:"4rem 3rem 6rem" }}>
        <Anim>
          <div className="cta-box" style={{ maxWidth:1920, margin:"0 auto", background:BLUE, borderRadius:24, padding:"4.5rem 3rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:YELLOW, opacity:.15 }}/>
            <div style={{ position:"absolute", bottom:-30, left:-30, width:120, height:120, borderRadius:"50%", background:YELLOW, opacity:.1 }}/>
            <div style={{ position:"relative" }}>
              <div style={{ display:"inline-flex", background:"rgba(255,255,255,.12)", border:"1px solid rgba(255,255,255,.2)", borderRadius:100, padding:".35rem 1rem", fontSize:12, color:WHITE, fontWeight:600, letterSpacing:".08em", marginBottom:"1.25rem" }}>✦ MULAI HARI INI</div>
              <h2 style={{ fontSize:"clamp(1.5rem,3vw,2.6rem)", fontWeight:700, color:WHITE, marginBottom:"1rem" }}>Siap Memulai Proyek Bersama?</h2>
              <p style={{ color:"rgba(255,255,255,.75)", fontSize:16, maxWidth:480, margin:"0 auto 2.5rem" }}>Mari wujudkan ide kreatif Anda bersama tim profesional kami. Konsultasi pertama gratis!</p>
              <div className="btn-group" style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
                {!user ? (
                  <>
                    <button onClick={onRegister} style={{ background:YELLOW, color:"#1C1200", border:"none", padding:".9rem 2.2rem", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"opacity .2s" }}
                      onMouseOver={e=>e.target.style.opacity=.88} onMouseOut={e=>e.target.style.opacity=1}>Daftar & Mulai Sekarang</button>
                    <button onClick={onLogin} style={{ background:"transparent", color:WHITE, border:"1.5px solid rgba(255,255,255,.4)", padding:".9rem 2.2rem", borderRadius:10, fontWeight:500, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"border-color .2s" }}
                      onMouseOver={e=>e.target.style.borderColor="rgba(255,255,255,.8)"} onMouseOut={e=>e.target.style.borderColor="rgba(255,255,255,.4)"}>Sudah punya akun? Masuk</button>
                  </>
                ) : (
                  <button onClick={onGoJasa} style={{ background:YELLOW, color:"#1C1200", border:"none", padding:".9rem 2.2rem", borderRadius:10, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"opacity .2s" }}
                    onMouseOver={e=>e.target.style.opacity=.88} onMouseOut={e=>e.target.style.opacity=1}>Pesan Sekarang →</button>
                )}
              </div>
            </div>
          </div>
        </Anim>
      </section>

      {/* ── FOOTER ── */}
      <footer className="section-pad" style={{ background:DARK, color:WHITE, padding:"4rem 3rem 2rem" }}>
        <div style={{ maxWidth:1920, margin:"0 auto" }}>
          <div className="grid-footer" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"3rem", marginBottom:"3rem" }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:".7rem", marginBottom:"1rem" }}>
                <div style={{ width:36, height:36, background:BLUE, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:WHITE }}>IMA</div>
                <span style={{ fontWeight:700, fontSize:15 }}>IMA Creative<span style={{ color:YELLOW }}>.</span></span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.45)", lineHeight:1.85, maxWidth:240 }}>PT. IMA Creative Production — solusi kreatif dan teknologi terpercaya untuk bisnis Anda.</p>
            </div>
            {[
              ["Navigasi",["Beranda","Portofolio","Tentang Kami","Jasa"]],
              ["Layanan",["Live Streaming","Zoom Hybrid","Video Production","Event Management"]],
              ["Kontak",[t("kontak_email","info@imacreative.id"), t("kontak_telp","+62 21 1234 5678"), t("kontak_alamat","Jakarta, Indonesia")]]
            ].map(([heading,items])=>(
              <div key={heading}>
                <h4 style={{ fontWeight:700, fontSize:11, letterSpacing:".1em", marginBottom:"1.25rem", color:"rgba(255,255,255,.4)", textTransform:"uppercase" }}>{heading}</h4>
                {items.map(item=>(
                  <div key={item} style={{ fontSize:13, color:"rgba(255,255,255,.55)", marginBottom:".65rem", cursor:"pointer", transition:"color .2s" }}
                    onMouseOver={e=>e.target.style.color=YELLOW} onMouseOut={e=>e.target.style.color="rgba(255,255,255,.55)"}>{item}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="footer-bottom" style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:"1.5rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.3)" }}>© 2024 PT. IMA Creative Production. All rights reserved.</span>
            <span style={{ fontSize:12, color:"rgba(255,255,255,.3)" }}>Made with ❤️ in Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}