import { useState, useEffect, useCallback, useRef } from "react";
import { BLUE, BLUE_L, BG, WHITE, DARK, MUTED } from "./constants/colors";
import { normalizeJasa, normalizeOrder } from "./constants/data";
import { authAPI, jasaAPI, pemesananAPI, portofolioAPI, pengaturanAPI, getToken } from "./services/api";

import LoginModal    from "./components/auth/LoginModal";
import RegisterModal from "./components/auth/RegisterModal";

import HomePage      from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import JasaPage      from "./pages/JasaPage";
import BookingPage   from "./pages/BookingPage";
import PemesananPage from "./pages/PemesananPage";
import ProfilePage   from "./pages/ProfilePage";

/**
 * Polling intervals (ms)
 *  - JASA   : refresh setiap 15 detik (perubahan admin lebih jarang)
 *  - ORDERS : refresh setiap 12 detik (status bisa berubah cepat)
 */
const POLL_JASA   = 15000;
const POLL_ORDERS = 12000;

export default function App() {
  /* ── Global state ── */
  const [page,    setPage]    = useState("home");
  const [modal,   setModal]   = useState(null);
  const [bookSvc, setBookSvc] = useState(null);

  const [user,        setUser]        = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [jasaList,    setJasaList]    = useState([]);
  const [jasaLoading, setJasaLoading] = useState(true);

  const [orders,        setOrders]    = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [portofolio, setPortofolio] = useState([]);
  const [pengaturan, setPengaturan] = useState({});

  const orderPollRef = useRef(null);
  const jasaPollRef  = useRef(null);

  /* ── Auto-login saat refresh (jika token masih ada) ── */
  useEffect(() => {
    const init = async () => {
      // Ambil jasa, portofolio, pengaturan secara paralel (publik)
      const [jasaRes, portoRes, settRes] = await Promise.allSettled([
        jasaAPI.getAll(),
        portofolioAPI.getAll(),
        pengaturanAPI.getAll(),
      ]);
      if (jasaRes.status === "fulfilled") {
        setJasaList((jasaRes.value || []).map(normalizeJasa).filter(Boolean));
      }
      if (portoRes.status === "fulfilled") setPortofolio(portoRes.value || []);
      if (settRes.status === "fulfilled")  setPengaturan(settRes.value || {});
      setJasaLoading(false);

      if (getToken()) {
        try {
          const u = await authAPI.me();
          setUser(u);
          // Hanya pelanggan yang ambil orders. Admin tidak punya pesanan sendiri.
          if (!u.is_admin) {
            try {
              const o = await pemesananAPI.getAll();
              setOrders(o.map(normalizeOrder).filter(Boolean));
            } catch { setOrders([]); }
          }
        } catch {
          // token invalid → biarkan, sudah dihapus oleh handle()
        }
      }
      setLoadingAuth(false);
    };
    init();
  }, []);

  /* ── Polling: JASA + PORTOFOLIO + PENGATURAN ── */
  const refreshJasa = useCallback(async () => {
    try {
      const [jasaRes, portoRes, settRes] = await Promise.allSettled([
        jasaAPI.getAll(),
        portofolioAPI.getAll(),
        pengaturanAPI.getAll(),
      ]);
      if (jasaRes.status === "fulfilled")  setJasaList((jasaRes.value || []).map(normalizeJasa).filter(Boolean));
      if (portoRes.status === "fulfilled") setPortofolio(portoRes.value || []);
      if (settRes.status === "fulfilled")  setPengaturan(settRes.value || {});
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (jasaPollRef.current) clearInterval(jasaPollRef.current);
    jasaPollRef.current = setInterval(refreshJasa, POLL_JASA);

    // Refresh saat tab kembali aktif (visibility)
    const onVis = () => { if (!document.hidden) refreshJasa(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      if (jasaPollRef.current) clearInterval(jasaPollRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refreshJasa]);

  /* ── Polling: ORDERS (hanya kalau login & bukan admin) ── */
  const refreshOrders = useCallback(async () => {
    if (!user || user.is_admin) return;
    try {
      const o = await pemesananAPI.getAll();
      setOrders(o.map(normalizeOrder).filter(Boolean));
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    if (orderPollRef.current) clearInterval(orderPollRef.current);
    if (user && !user.is_admin) {
      orderPollRef.current = setInterval(refreshOrders, POLL_ORDERS);
    }
    const onVis = () => { if (!document.hidden && user && !user.is_admin) refreshOrders(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (orderPollRef.current) clearInterval(orderPollRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [user, refreshOrders]);

  /* ── Navigation ── */
  const goHome      = () => { setPage("home");      window.scrollTo(0,0); };
  const goPortfolio = () => { setPage("portfolio"); window.scrollTo(0,0); };
  const goJasa      = () => { setPage("jasa");      window.scrollTo(0,0); };
  const goPemesanan = () => { setPage("pemesanan"); refreshOrders(); window.scrollTo(0,0); };
  const goProfile   = () => { setPage("profile");   window.scrollTo(0,0); };
  const goBooking   = (svc) => { setBookSvc(svc); setPage("booking"); window.scrollTo(0,0); };

  const goSuccess = async (newOrder) => {
    if (newOrder) {
      const norm = normalizeOrder(newOrder);
      setOrders(prev => [norm, ...prev.filter(p => p.id_pemesanan !== norm.id_pemesanan)]);
    }
    // Refresh sekali untuk dapat data terbaru dari server
    await refreshOrders();
    setBookSvc(newOrder);
    setPage("success");
    window.scrollTo(0,0);
  };

  /* ── Auth callbacks ── */
  const handleLogin = async (userData) => {
    // Kalau admin login dari halaman pelanggan, biarkan setUser — blocker akan tampil
    setUser(userData);
    setModal(null);
    if (userData.is_admin) {
      // Tidak perlu fetch orders untuk admin
      setOrders([]);
      return;
    }
    try {
      const o = await pemesananAPI.getAll();
      setOrders(o.map(normalizeOrder).filter(Boolean));
    } catch { setOrders([]); }
  };

  const handleRegister = async (userData) => {
    // Register dari publik selalu jadi pelanggan, jadi aman
    setUser(userData);
    setModal(null);
    setOrders([]);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    setOrders([]);
    goHome();
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const authProps = {
    user,
    onGoProfile:  goProfile,
    onLogout:     handleLogout,
    onLogin:      () => setModal("login"),
    onRegister:   () => setModal("register"),
  };

  /* ── Lock body scroll on modal ── */
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  /* ── Force full-width + Load Midtrans Snap ── */
  useEffect(() => {
    const id = "ima-fullwidth";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = `html,body{width:100%;margin:0;padding:0;overflow-x:hidden;}#root{width:100%;min-height:100vh;}`;
      document.head.appendChild(s);
    }

    // Load Midtrans Snap.js (Sandbox)
    const snapId = "midtrans-snap-script";
    if (!document.getElementById(snapId)) {
      const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "";
      const snapUrl   = import.meta.env.VITE_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js";

      if (!clientKey) {
        console.warn(
          "%c⚠️ MIDTRANS BELUM DIKONFIGURASI",
          "color:#D97706;font-weight:bold;font-size:14px;",
          "\n\nTambahkan ke file .env (di folder root frontend, sejajar dengan package.json):" +
          "\n\nVITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXX" +
          "\nVITE_MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/snap.js" +
          "\n\nLalu RESTART dev server (npm run dev). " +
          "Tanpa CLIENT KEY, popup pembayaran Midtrans tidak akan muncul."
        );
      }

      const script = document.createElement("script");
      script.id = snapId;
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey);
      script.onload = () => {
        if (window.snap) {
          console.log("%c✅ Midtrans Snap loaded", "color:#059669;font-weight:bold;");
        } else {
          console.error("⚠️ Snap.js loaded tapi window.snap tidak tersedia. Cek apakah CLIENT KEY valid.");
        }
      };
      script.onerror = () => {
        console.error("❌ Gagal load Snap.js dari:", snapUrl);
      };
      document.head.appendChild(script);
    }
  }, []);

  /* ── Loading auth screen ── */
  if (loadingAuth) {
    return (
      <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:BG }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:48, height:48, background:BLUE, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:16, color:WHITE, margin:"0 auto 1rem" }}>IMA</div>
          <p style={{ color:MUTED, fontSize:14 }}>Memuat...</p>
        </div>
      </div>
    );
  }

  /* ── BLOCKER: Admin tidak boleh akses halaman pelanggan ── */
  if (user?.is_admin) {
    return (
      <div style={{ fontFamily:"'DM Sans',sans-serif", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${BG} 0%,#FFF 100%)`, padding:"2rem" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <div style={{ background:WHITE, borderRadius:20, padding:"3rem 2.5rem", maxWidth:480, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(27,79,216,.15)", border:"1px solid #E5EAF5" }}>
          <div style={{ width:80, height:80, background:"#FEF3C7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 1.5rem" }}>⚠️</div>
          <h2 style={{ fontWeight:800, fontSize:"1.5rem", color:DARK, marginBottom:".75rem" }}>Akun Admin Terdeteksi</h2>
          <p style={{ color:MUTED, lineHeight:1.7, marginBottom:"1.5rem", fontSize:14 }}>
            Anda login sebagai <strong style={{ color:DARK }}>{user.name}</strong> ({user.email}) yang merupakan akun <strong style={{ color:"#D97706" }}>admin</strong>.
            <br/><br/>
            Halaman ini khusus untuk pelanggan. Silakan akses panel admin di alamat <strong style={{ color:BLUE }}>/admin</strong>, atau logout untuk masuk dengan akun pelanggan.
          </p>
          <div style={{ display:"flex", gap:".75rem", flexDirection:"column" }}>
            <button onClick={() => { window.location.href = "/admin"; }} style={{ padding:".85rem", background:BLUE, color:WHITE, border:"none", borderRadius:10, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
              🔧 Buka Panel Admin
            </button>
            <button onClick={handleLogout} style={{ padding:".85rem", background:WHITE, color:DARK, border:"1.5px solid #D1D9EF", borderRadius:10, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
              🚪 Logout dari Akun Admin
            </button>
          </div>
          <p style={{ marginTop:"1.5rem", fontSize:12, color:MUTED }}>
            Untuk memesan jasa, gunakan akun pelanggan biasa.
          </p>
        </div>
      </div>
    );
  }

  /* ── Success Screen ── */
  if (page === "success") {
    const latestOrder = orders[0];
    return (
      <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=DM+Serif+Display:ital@1&display=swap" rel="stylesheet"/>
        <div style={{ background:WHITE,borderRadius:24,padding:"3rem",maxWidth:480,width:"100%",textAlign:"center",boxShadow:"0 20px 60px rgba(27,79,216,.12)",border:"1px solid #E5EAF5" }}>
          <div style={{ width:80,height:80,background:"#DCFCE7",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 1.5rem" }}>✅</div>
          <h2 style={{ fontWeight:800,fontSize:"1.6rem",color:DARK,marginBottom:".75rem" }}>Pemesanan Berhasil!</h2>
          <p style={{ color:MUTED,lineHeight:1.8,marginBottom:"1.5rem" }}>Tim IMA Creative Production akan menghubungi Anda dalam 1×24 jam untuk konfirmasi detail acara.</p>
          <div style={{ background:BG,borderRadius:14,padding:"1.25rem",marginBottom:"1.75rem",textAlign:"left" }}>
            {[
              ["No. Pesanan", latestOrder?.kode || latestOrder?.id || "IMA-XXXXX"],
              ["Layanan",     latestOrder?.svcName || "-"],
              ["Tanggal",     latestOrder?.date || "-"],
              ["Paket",       latestOrder?.paket || "-"],
              ["Status",      "Menunggu Konfirmasi"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
                <span style={{ fontSize:13,color:MUTED }}>{k}</span>
                <span style={{ fontSize:13,fontWeight:700,color:k==="No. Pesanan"?BLUE:k==="Status"?"#D97706":DARK }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",gap:".75rem" }}>
            <button onClick={goPemesanan} style={{ flex:1,padding:".85rem",background:BLUE_L,color:BLUE,border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Lihat Pesanan Saya</button>
            <button onClick={goHome}      style={{ flex:1,padding:".85rem",background:BLUE,color:WHITE,border:"none",borderRadius:12,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Kembali ke Beranda</button>
          </div>
        </div>
        <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&family=DM+Serif+Display:ital@1&display=swap" rel="stylesheet"/>

      {modal==="login"    && <LoginModal    onClose={()=>setModal(null)} onSwitch={()=>setModal("register")} onSuccess={handleLogin}/>}
      {modal==="register" && <RegisterModal onClose={()=>setModal(null)} onSwitch={()=>setModal("login")}   onSuccess={handleRegister}/>}

      {page==="home" && (
        <HomePage
          jasaList={jasaList} jasaLoading={jasaLoading}
          portofolio={portofolio} pengaturan={pengaturan}
          onGoPortfolio={goPortfolio} onGoJasa={goJasa} onGoPemesanan={goPemesanan}
          {...authProps}/>
      )}
      {page==="portfolio" && (
        <PortfolioPage
          portofolio={portofolio}
          onBack={goHome} onGoJasa={goJasa} onGoPemesanan={goPemesanan} {...authProps}/>
      )}
      {page==="jasa" && (
        <JasaPage
          jasaList={jasaList} jasaLoading={jasaLoading} onRefreshJasa={refreshJasa}
          onBack={goHome} onGoPortfolio={goPortfolio} onGoPemesanan={goPemesanan} onGoBooking={goBooking}
          {...authProps}/>
      )}
      {page==="pemesanan" && (
        <PemesananPage
          orders={orders} ordersLoading={ordersLoading}
          onRefresh={refreshOrders}
          jasaList={jasaList}
          onBack={goHome} onGoJasa={goJasa} onGoPortfolio={goPortfolio} onGoBooking={goBooking}
          {...authProps}/>
      )}
      {page==="profile" && user && (
        <ProfilePage
          user={user} onProfileUpdate={handleProfileUpdate}
          orders={orders} jasaList={jasaList}
          onBack={goHome} onGoJasa={goJasa} onGoPemesanan={goPemesanan} onGoPortfolio={goPortfolio}
          onLogout={handleLogout}
          onLogin={()=>setModal("login")} onRegister={()=>setModal("register")}/>
      )}
      {page==="booking" && bookSvc && (
        <BookingPage
          service={bookSvc}
          jasaList={jasaList}
          onBack={goJasa} onSuccess={goSuccess} onGoHome={goHome}
          {...authProps}/>
      )}

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;margin:0;padding:0;overflow-x:hidden;}
        #root{width:100%;min-height:100vh;max-width:none;}
        html{scroll-behavior:smooth;}
        input::placeholder,textarea::placeholder{color:#A0AABF;}
        @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
        @keyframes slideUp {from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulse   {0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)}}
        @keyframes spin    {from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
    </>
  );
}
