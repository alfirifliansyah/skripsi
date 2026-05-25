import { useState, useEffect } from "react";
import { BLUE, BLUE_L, BLUE_M, WHITE, DARK, MUTED } from "../../constants/colors";
import { NAV_LINKS } from "../../constants/data";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function Navbar({
  activeNav, onNav, onLogin, onRegister,
  scrolled, user, onGoProfile, onLogout
}) {
  const isMobile = useIsMobile(1024);
  const [open, setOpen] = useState(false);

  // Kunci scroll saat menu mobile terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  const handleNavClick = (link) => {
    close();
    onNav(link);
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          height: 68,
          padding: isMobile ? "0 1rem" : "0 3rem",
          background: scrolled ? "rgba(255,255,255,.93)" : WHITE,
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: "1px solid #E5EAF5",
          boxShadow: scrolled ? "0 2px 20px rgba(27,79,216,.07)" : "none",
          transition: "all .35s",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <button
          onClick={() => handleNavClick("Beranda")}
          style={{
            display: "flex", alignItems: "center", gap: ".7rem",
            background: "none", border: "none", cursor: "pointer",
          }}
        >
          <div style={{
            width: 38, height: 38, background: BLUE, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: WHITE,
          }}>IMA</div>
          <span style={{
            fontWeight: 700, fontSize: 15, color: DARK, fontFamily: "inherit",
          }}>
            IMA Creative<span style={{ color: BLUE }}>.</span>
          </span>
        </button>

        {/* ── DESKTOP MENU ── */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            {NAV_LINKS.map(link => (
              <button key={link} onClick={() => handleNavClick(link)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: activeNav === link ? BLUE : MUTED,
                fontWeight: activeNav === link ? 700 : 400, fontSize: 14,
                padding: ".25rem 0",
                borderBottom: `2px solid ${activeNav === link ? BLUE : "transparent"}`,
                transition: "all .2s", fontFamily: "inherit",
              }}>{link}</button>
            ))}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={onGoProfile} style={{
                  display: "flex", alignItems: "center", gap: 9, background: BLUE_L,
                  border: `1.5px solid ${BLUE}33`, borderRadius: 10,
                  padding: ".45rem .9rem .45rem .55rem", cursor: "pointer",
                  fontFamily: "inherit", transition: "background .2s",
                }}
                  onMouseOver={e => e.currentTarget.style.background = "#DDE8FF"}
                  onMouseOut={e => e.currentTarget.style.background = BLUE_L}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: BLUE,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800, color: WHITE, flexShrink: 0,
                  }}>{user.avatar}</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>
                      {user.name.split(" ")[0]}
                    </div>
                    <div style={{ fontSize: 10, color: MUTED, lineHeight: 1.2 }}>
                      {user.company?.slice(0, 18)}
                    </div>
                  </div>
                </button>
                <button onClick={onLogout} style={{
                  background: "none", border: "1.5px solid #E5EAF5",
                  color: MUTED, padding: ".45rem .75rem", borderRadius: 8,
                  cursor: "pointer", fontFamily: "inherit",
                  fontSize: 12, fontWeight: 600, transition: "all .2s",
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "#E5EAF5"; e.currentTarget.style.color = MUTED; }}>
                  Keluar
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={onLogin} style={{
                  background: WHITE, border: `1.5px solid ${BLUE}`, color: BLUE,
                  padding: ".55rem 1.2rem", borderRadius: 8, cursor: "pointer",
                  fontWeight: 600, fontSize: 13, fontFamily: "inherit",
                  transition: "background .2s",
                }}
                  onMouseOver={e => e.target.style.background = BLUE_L}
                  onMouseOut={e => e.target.style.background = WHITE}>Masuk</button>
                <button onClick={onRegister} style={{
                  background: BLUE, border: "none", color: WHITE,
                  padding: ".55rem 1.2rem", borderRadius: 8, cursor: "pointer",
                  fontWeight: 700, fontSize: 13, fontFamily: "inherit",
                  transition: "background .2s",
                }}
                  onMouseOver={e => e.target.style.background = BLUE_M}
                  onMouseOut={e => e.target.style.background = BLUE}>Daftar</button>
              </div>
            )}
          </div>
        )}

        {/* ── MOBILE HAMBURGER BUTTON ── */}
        {isMobile && (
          <button
            onClick={() => setOpen(o => !o)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: ".5rem", display: "flex", flexDirection: "column",
              gap: 5, width: 40, height: 40, alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{
              width: 22, height: 2.5, background: DARK, borderRadius: 2,
              transition: "transform .25s, opacity .25s",
              transform: open ? "translateY(7.5px) rotate(45deg)" : "none",
            }}/>
            <span style={{
              width: 22, height: 2.5, background: DARK, borderRadius: 2,
              opacity: open ? 0 : 1, transition: "opacity .2s",
            }}/>
            <span style={{
              width: 22, height: 2.5, background: DARK, borderRadius: 2,
              transition: "transform .25s",
              transform: open ? "translateY(-7.5px) rotate(-45deg)" : "none",
            }}/>
          </button>
        )}
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {isMobile && open && (
        <>
          {/* Overlay */}
          <div
            onClick={close}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
              zIndex: 110, animation: "fadeInOverlay .25s ease-out",
            }}
          />
          {/* Drawer */}
          <aside
            style={{
              position: "fixed", top: 0, right: 0, bottom: 0,
              width: "min(85vw, 320px)", background: WHITE, zIndex: 111,
              boxShadow: "-4px 0 24px rgba(0,0,0,.12)",
              animation: "slideInRight .28s ease-out",
              display: "flex", flexDirection: "column",
              padding: "5.5rem 1.5rem 1.5rem", overflowY: "auto",
            }}
          >
            {/* Nav links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: "1.5rem" }}>
              {NAV_LINKS.map(link => (
                <button
                  key={link}
                  onClick={() => handleNavClick(link)}
                  style={{
                    background: activeNav === link ? BLUE_L : "transparent",
                    border: "none", cursor: "pointer", textAlign: "left",
                    color: activeNav === link ? BLUE : DARK,
                    fontWeight: activeNav === link ? 700 : 500,
                    fontSize: 15, padding: ".9rem 1rem", borderRadius: 10,
                    fontFamily: "inherit", transition: "background .15s",
                  }}
                >
                  {link}
                </button>
              ))}
            </div>

            {/* User area */}
            <div style={{
              marginTop: "auto", paddingTop: "1rem",
              borderTop: "1px solid #E5EAF5",
            }}>
              {user ? (
                <>
                  <button onClick={() => { close(); onGoProfile(); }} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    background: BLUE_L, border: `1.5px solid ${BLUE}33`,
                    borderRadius: 12, padding: ".75rem 1rem", cursor: "pointer",
                    fontFamily: "inherit", marginBottom: 10,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", background: BLUE,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: WHITE, flexShrink: 0,
                    }}>{user.avatar}</div>
                    <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700, color: DARK,
                        lineHeight: 1.3, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis",
                      }}>{user.name}</div>
                      <div style={{
                        fontSize: 11, color: MUTED, lineHeight: 1.3,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{user.email}</div>
                    </div>
                  </button>
                  <button onClick={() => { close(); onLogout(); }} style={{
                    width: "100%", background: WHITE, border: "1.5px solid #E5EAF5",
                    color: "#EF4444", padding: ".75rem", borderRadius: 10,
                    cursor: "pointer", fontFamily: "inherit",
                    fontSize: 13, fontWeight: 600,
                  }}>Keluar</button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => { close(); onLogin(); }} style={{
                    background: WHITE, border: `1.5px solid ${BLUE}`, color: BLUE,
                    padding: ".8rem", borderRadius: 10, cursor: "pointer",
                    fontWeight: 600, fontSize: 14, fontFamily: "inherit",
                  }}>Masuk</button>
                  <button onClick={() => { close(); onRegister(); }} style={{
                    background: BLUE, border: "none", color: WHITE,
                    padding: ".8rem", borderRadius: 10, cursor: "pointer",
                    fontWeight: 700, fontSize: 14, fontFamily: "inherit",
                  }}>Daftar</button>
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}