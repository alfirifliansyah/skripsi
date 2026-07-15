import { useState, useEffect } from "react";
import { BLUE, BLUE_L, BG, WHITE, DARK, MUTED, YELLOW } from "../constants/colors";
import { fmt } from "../constants/data";
import Navbar from "../components/layout/Navbar";
import Anim from "../components/ui/Anim";
import Label from "../components/ui/Label";

export default function JasaPage({
  jasaList = [], jasaLoading = false, onRefreshJasa,
  onBack, onLogin, onRegister, onGoPortfolio, onGoPemesanan, onGoBooking,
  user, onGoProfile, onLogout,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Semua");
  const [showAuthPrompt, setShowAuthPrompt] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (onRefreshJasa) onRefreshJasa();
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    console.log(jasaList)
  }, []);

  const allTags = ["Semua", ...Array.from(new Set(jasaList.map(s => s.tag).filter(Boolean)))];
  const filtered = jasaList.filter(s => {
    const matchTag = activeTag === "Semua" || s.tag === activeTag;
    const q = search.toLowerCase();
    const matchSearch = !q || (s.title || "").toLowerCase().includes(q) || (s.desc || "").toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  const handleNav = (link) => {
    if (link === "Beranda") { onBack(); return; }
    if (link === "Portofolio") { onGoPortfolio(); return; }
    if (link === "Pemesanan") { onGoPemesanan(); return; }
  };
  const handleBooking = (svc) => {
    if (!user) { setShowAuthPrompt(svc); return; }
    onGoBooking(svc);
  };

  const activeSvc = activeId ? jasaList.find(s => s.id === activeId) : null;

  const [imgErrors, setImgErrors] = useState({});

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", background: BG, color: DARK, minHeight: "100vh" }}>
      <Navbar activeNav="Jasa" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout} />

      {/* Auth Required Prompt */}
      {showAuthPrompt && (
        <div onClick={() => setShowAuthPrompt(null)} className="modal-pad" style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(15,27,61,.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn .2s ease" }}>
          <div onClick={e => e.stopPropagation()} className="modal-card" style={{ background: WHITE, borderRadius: 20, padding: "2.5rem", maxWidth: 420, width: "100%", boxShadow: "0 32px 80px rgba(15,27,61,.25)", animation: "slideUp .28s ease", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: BLUE_L, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 1.25rem" }}>🔐</div>
            <h3 style={{ fontWeight: 800, fontSize: "1.3rem", color: DARK, marginBottom: ".5rem" }}>Masuk untuk Memesan</h3>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.8, marginBottom: "1.75rem" }}>Anda perlu masuk atau daftar terlebih dahulu untuk memesan layanan <strong>{showAuthPrompt.title}</strong>.</p>
            <div className="btn-group" style={{ display: "flex", gap: ".75rem" }}>
              <button onClick={() => { setShowAuthPrompt(null); onLogin(); }} style={{ flex: 1, padding: ".8rem", background: WHITE, color: BLUE, border: `1.5px solid ${BLUE}`, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Masuk</button>
              <button onClick={() => { setShowAuthPrompt(null); onRegister(); }} style={{ flex: 1, padding: ".8rem", background: BLUE, color: WHITE, border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Daftar Gratis</button>
            </div>
            <button onClick={() => setShowAuthPrompt(null)} style={{ marginTop: "1rem", background: "none", border: "none", color: MUTED, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Tutup</button>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {activeSvc && (
        <div onClick={() => setActiveId(null)} className="modal-pad" style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(15,27,61,.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", animation: "fadeIn .2s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 20, overflow: "hidden", width: "min(720px,96vw)", boxShadow: "0 32px 80px rgba(15,27,61,.25)", animation: "slideUp .28s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ height: 180, background: activeSvc.imgBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, position: "relative", overflow: "hidden" }}>
              {activeSvc.gambar_url ? (
                <img src={activeSvc.gambar_url} alt={activeSvc.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>{activeSvc.emoji}</span>
              )}
              <span style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.35)", color: WHITE, fontSize: 11, fontWeight: 700, padding: ".3rem .8rem", borderRadius: 100, zIndex: 2 }}>{activeSvc.tag}</span>
              <button onClick={() => setActiveId(null)} style={{ position: "absolute", top: 14, left: 14, background: "rgba(255,255,255,.2)", border: "none", color: WHITE, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>←</button>
            </div>
            <div className="modal-card" style={{ padding: "2rem" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.3rem", color: DARK, marginBottom: ".25rem" }}>{activeSvc.title}</h3>
              <div style={{ fontSize: 13, color: BLUE, fontWeight: 700, marginBottom: "1rem" }}>Mulai dari {fmt(activeSvc.harga)}</div>
              <p style={{ color: MUTED, lineHeight: 1.85, marginBottom: "1.5rem" }}>{activeSvc.desc}</p>

              {activeSvc.features.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: ".75rem", letterSpacing: ".04em" }}>YANG TERMASUK DALAM LAYANAN:</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.5rem" }}>
                    {activeSvc.features.map(f => (
                      <span key={f} style={{ background: BLUE_L, color: BLUE, fontSize: 12, fontWeight: 600, padding: ".35rem .9rem", borderRadius: 100, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ color: YELLOW, fontSize: 10 }}>✦</span> {f}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {activeSvc.packages.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: ".75rem", letterSpacing: ".04em" }}>PILIHAN PAKET:</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: "1.75rem" }}>
                    {activeSvc.packages.map(p => (
                      <div key={p.id} style={{ background: BG, border: "1px solid #E5EAF5", borderRadius: 12, padding: "1rem" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: DARK }}>{p.label}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>{p.hours}</div>
                        <div style={{ fontWeight: 800, color: BLUE, fontSize: 14 }}>{fmt(p.price)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="btn-group" style={{ display: "flex", gap: "0.75rem" }}>
                <button onClick={() => { setActiveId(null); handleBooking(activeSvc); }} style={{ flex: 1, padding: ".8rem", background: BLUE, color: WHITE, border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Pesan Sekarang →</button>
                <button onClick={() => setActiveId(null)} style={{ padding: ".8rem 1.25rem", background: WHITE, color: DARK, border: "1.5px solid #D1D9EF", borderRadius: 10, fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-pad" style={{ maxWidth: 1920, margin: "0 auto", padding: "7rem 3rem 5rem" }}>
        <Anim>
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", color: MUTED, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", marginBottom: "2rem", padding: 0, transition: "color .2s" }}
            onMouseOver={e => e.currentTarget.style.color = BLUE} onMouseOut={e => e.currentTarget.style.color = MUTED}>← Kembali ke Beranda</button>
          <Label>APA YANG KAMI TAWARKAN</Label>
          <h1 className="hero-title" style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, color: DARK, letterSpacing: "-.02em", marginBottom: ".75rem" }}>Jasa <span style={{ color: BLUE }}>Kami.</span></h1>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.85, maxWidth: 560, marginBottom: "2.5rem" }}>
            Kami menyediakan layanan multimedia profesional lengkap — dari live streaming hingga zoom hybrid meeting skala besar untuk perusahaan di wilayah Balikpapan & sekitarnya.
          </p>
        </Anim>

        {/* Search + Filter */}
        <Anim delay={0.05}>
          <div className="filter-row" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1", minWidth: 220 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: MUTED, pointerEvents: "none" }}>🔍</span>
              <input type="text" placeholder="Cari layanan..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: ".7rem 1rem .7rem 2.75rem", border: "1.5px solid #D1D9EF", borderRadius: 10, fontSize: 14, fontFamily: "inherit", color: DARK, background: WHITE, outline: "none", transition: "border-color .2s" }}
                onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = "#D1D9EF"} />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {allTags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(tag)} style={{ background: activeTag === tag ? BLUE : WHITE, color: activeTag === tag ? WHITE : DARK, border: `1.5px solid ${activeTag === tag ? BLUE : "#D1D9EF"}`, padding: ".45rem 1.1rem", borderRadius: 100, fontSize: 13, fontWeight: activeTag === tag ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>{tag}</button>
              ))}
            </div>
          </div>
        </Anim>

        {/* Loading state */}
        {jasaLoading && jasaList.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem", color: MUTED }}>
            <div style={{ fontSize: 36, marginBottom: "1rem", animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
            <p style={{ fontSize: 14 }}>Memuat layanan dari server...</p>
          </div>
        )}

        {/* Service list */}
        {!jasaLoading || jasaList.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: MUTED }}>
                <div style={{ fontSize: 48, marginBottom: "1rem" }}>🔍</div>
                <p style={{ fontSize: 16 }}>{jasaList.length === 0 ? "Belum ada layanan tersedia." : "Layanan tidak ditemukan. Coba kata kunci lain."}</p>
              </div>
            ) : filtered.map((svc, i) => (
              <Anim key={svc.id} delay={i * 0.06}>
                <div onClick={() => setActiveId(svc.id)} className="jasa-card" style={{ background: WHITE, border: "1.5px solid #E5EAF5", borderRadius: 18, padding: "1.75rem", display: "flex", gap: "1.75rem", cursor: "pointer", alignItems: "flex-start", transition: "border-color .25s,transform .25s,box-shadow .25s" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(27,79,216,.1)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "#E5EAF5"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                  <div className="jasa-card-image" style={{ width: 200, minWidth: 200, height: 140, borderRadius: 14, background: svc.imgBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    {svc.gambar_url && !imgErrors[svc.id] ? (
                      <>
                        <img
                          src={svc.gambar_url}
                          alt={svc.title}
                          onError={() => setImgErrors(prev => ({ ...prev, [svc.id]: true }))}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.18)", zIndex: 1 }} />
                      </>
                    ) : (
                      <>
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.18)", zIndex: 1 }} />
                        <span style={{ position: "relative", zIndex: 1 }}>{svc.emoji}</span>
                      </>
                    )}
                    <div style={{ position: "absolute", top: 10, left: 10, width: 28, height: 28, background: "rgba(255,255,255,.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: WHITE, zIndex: 2 }}>{String(i + 1).padStart(2, "0")}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: ".6rem", flexWrap: "wrap" }}>
                      <span style={{ background: BLUE_L, color: BLUE, fontSize: 11, fontWeight: 700, padding: ".2rem .7rem", borderRadius: 100 }}>{svc.tag}</span>
                      <span style={{ fontSize: 11, color: MUTED }}>• Klik untuk detail</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.15rem", color: DARK, marginBottom: ".4rem", letterSpacing: "-.01em" }}>{svc.title?.toUpperCase()}</h3>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: ".5rem" }}>Mulai dari {fmt(svc.harga)}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: MUTED, marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{svc.desc}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {svc.features.slice(0, 3).map(f => (
                        <span key={f} style={{ background: BG, border: "1px solid #E5EAF5", color: MUTED, fontSize: 11, fontWeight: 500, padding: ".2rem .65rem", borderRadius: 100 }}>{f}</span>
                      ))}
                      {svc.features.length > 3 && <span style={{ background: BG, border: "1px solid #E5EAF5", color: MUTED, fontSize: 11, fontWeight: 500, padding: ".2rem .65rem", borderRadius: 100 }}>+{svc.features.length - 3} lainnya</span>}
                    </div>
                  </div>
                  <div className="jasa-card-arrow" style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: BLUE_L, display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, fontSize: 18, alignSelf: "center" }}>→</div>
                </div>
              </Anim>
            ))}
          </div>
        ) : null}

        {/* CTA strip */}
        
      </div>

      <div className="footer-bottom section-pad" style={{ borderTop: "1px solid #E5EAF5", padding: "1.5rem 3rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: MUTED }}>© 2024 PT. IMA Creative Production</span>
        <button onClick={onBack} style={{ background: "none", border: "none", color: BLUE, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← Kembali ke Beranda</button>
      </div>
    </div>
  );
}