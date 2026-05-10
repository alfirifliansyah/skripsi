import { useState, useEffect } from "react";
import { BLUE, BLUE_L, BG, WHITE, DARK, MUTED, YELLOW_L } from "../constants/colors";
import { STATUS_CONFIG, fmt } from "../constants/data";
import { pemesananAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Anim from "../components/ui/Anim";
import Label from "../components/ui/Label";

export default function PemesananPage({
  orders = [], ordersLoading = false, onRefresh,
  jasaList = [],
  onBack, onLogin, onRegister, onGoJasa, onGoPortfolio, onGoBooking,
  user, onGoProfile, onLogout,
}) {
  const [scrolled,     setScrolled]     = useState(false);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [activeOrder,  setActiveOrder]  = useState(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [cancelling,   setCancelling]   = useState(false);
  const [toast,        setToast]        = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (onRefresh) onRefresh();
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleNav = (link) => {
    if (link === "Beranda")    { onBack(); return; }
    if (link === "Portofolio") { onGoPortfolio(); return; }
    if (link === "Jasa")       { onGoJasa(); return; }
  };

  const handleManualRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); setToast({ type: "success", msg: "Daftar pesanan diperbarui" }); }
    catch { setToast({ type: "error", msg: "Gagal memperbarui daftar" }); }
    finally { setRefreshing(false); }
  };

  const handleCancel = async (ord) => {
    const orderId = ord.id_pemesanan;
    if (!orderId) {
      setToast({ type: "error", msg: "ID pesanan tidak ditemukan" });
      return;
    }
    if (!window.confirm(`Yakin batalkan pesanan ${ord.kode || ord.id}?`)) return;

    setCancelling(true);
    try {
      await pemesananAPI.cancel(orderId);
      setActiveOrder(null);
      setToast({ type: "success", msg: "Pesanan berhasil dibatalkan" });
      if (onRefresh) await onRefresh();
    } catch (e) {
      setToast({ type: "error", msg: e.message || "Gagal membatalkan pesanan" });
    } finally {
      setCancelling(false);
    }
  };

  // User belum login
  if (!user) {
    return (
      <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, minHeight:"100vh" }}>
        <Navbar activeNav="Pemesanan" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>
        <div style={{ maxWidth:520, margin:"7rem auto", padding:"3rem 2rem", background:WHITE, borderRadius:20, textAlign:"center", border:"1.5px solid #E5EAF5" }}>
          <div style={{ width:72, height:72, background:BLUE_L, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 1.25rem" }}>🔐</div>
          <h2 style={{ fontWeight:800, fontSize:"1.4rem", color:DARK, marginBottom:".5rem" }}>Masuk untuk melihat pesanan</h2>
          <p style={{ color:MUTED, marginBottom:"1.5rem", fontSize:14 }}>Silakan masuk atau daftar untuk melihat riwayat pemesanan Anda.</p>
          <div style={{ display:"flex", gap:".75rem", justifyContent:"center" }}>
            <button onClick={onLogin}    style={{ background:WHITE, color:BLUE, border:`1.5px solid ${BLUE}`, padding:".75rem 1.75rem", borderRadius:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Masuk</button>
            <button onClick={onRegister} style={{ background:BLUE,  color:WHITE, border:"none",                padding:".75rem 1.75rem", borderRadius:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Daftar</button>
          </div>
        </div>
      </div>
    );
  }

  const filters = ["semua","menunggu","proses","selesai","batal"];
  const shown   = filterStatus==="semua" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, minHeight:"100vh" }}>
      <Navbar activeNav="Pemesanan" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position:"fixed", top:84, right:24, zIndex:1200,
          background: toast.type==="success" ? "#059669" : "#DC2626",
          color: WHITE, padding:".85rem 1.5rem", borderRadius:10,
          fontSize:14, fontWeight:600, boxShadow:"0 12px 28px rgba(0,0,0,.18)",
          animation:"slideUp .25s ease"
        }}>
          {toast.type==="success" ? "✅ " : "⚠️ "}{toast.msg}
        </div>
      )}

      {/* Order Detail Modal */}
      {activeOrder && (() => {
        const ord = activeOrder;
        const st  = STATUS_CONFIG[ord.status] || STATUS_CONFIG.menunggu;
        const svc = jasaList.find(s => s.id === ord.svc) || jasaList.find(s => s.id_jasa === ord.svc);
        return (
          <div onClick={()=>setActiveOrder(null)} style={{ position:"fixed",inset:0,zIndex:999,background:"rgba(15,27,61,.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",animation:"fadeIn .2s ease" }}>
            <div onClick={e=>e.stopPropagation()} style={{ background:WHITE,borderRadius:20,overflow:"hidden",width:"min(580px,96vw)",boxShadow:"0 32px 80px rgba(15,27,61,.25)",animation:"slideUp .28s ease",maxHeight:"90vh",overflowY:"auto" }}>
              <div style={{ height:140,background:svc?.imgBg||"linear-gradient(135deg,#1B4FD8,#23d5ab)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:56,position:"relative" }}>
                {svc?.emoji||"📋"}
                <button onClick={()=>setActiveOrder(null)} style={{ position:"absolute",top:14,left:14,background:"rgba(255,255,255,.2)",border:"none",color:WHITE,width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>←</button>
                <span style={{ position:"absolute",top:14,right:14,background:st.bg,color:st.color,fontSize:11,fontWeight:700,padding:".3rem .8rem",borderRadius:100,border:`1px solid ${st.color}33` }}>{st.icon} {st.label}</span>
              </div>
              <div style={{ padding:"1.75rem" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.25rem" }}>
                  <div>
                    <h3 style={{ fontWeight:800,fontSize:"1.15rem",color:DARK }}>{ord.svcName}</h3>
                    <p style={{ fontSize:13,color:MUTED,marginTop:2 }}>{ord.company}</p>
                  </div>
                  <span style={{ fontSize:12,color:MUTED,fontFamily:"monospace",background:BG,padding:".3rem .7rem",borderRadius:8,border:"1px solid #E5EAF5" }}>{ord.kode || ord.id}</span>
                </div>
                {[
                  ["Paket",        ord.paket],
                  ["Tanggal",      ord.date],
                  ["Waktu",        ord.time],
                  ["PIC",          ord.nama_pic || "-"],
                  ["Telepon",      ord.telepon_pic || "-"],
                  ["Total Bayar",  fmt(ord.total)],
                  ["Status Bayar", ord.pembayaran?.status_verifikasi || "pending"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:".6rem 0",borderBottom:"1px solid #F1F5F9" }}>
                    <span style={{ fontSize:14,color:MUTED }}>{k}</span>
                    <span style={{ fontSize:14,fontWeight:k==="Total Bayar"?800:600,color:k==="Total Bayar"?BLUE:DARK }}>{v}</span>
                  </div>
                ))}
                {ord.catatan && (
                  <div style={{ marginTop:".75rem",background:BG,borderRadius:10,padding:".85rem 1rem" }}>
                    <div style={{ fontSize:12,color:MUTED,marginBottom:4 }}>Catatan</div>
                    <div style={{ fontSize:13,color:DARK,lineHeight:1.6 }}>{ord.catatan}</div>
                  </div>
                )}
                <div style={{ marginTop:"1.5rem",display:"flex",gap:".75rem",flexWrap:"wrap" }}>
                  {ord.status==="menunggu" && (
                    <button
                      onClick={()=>handleCancel(ord)}
                      disabled={cancelling}
                      style={{ flex:1,minWidth:120,padding:".75rem",background:"#FEF2F2",color:"#DC2626",border:"1.5px solid #FCA5A5",borderRadius:10,fontWeight:700,fontSize:14,cursor:cancelling?"not-allowed":"pointer",fontFamily:"inherit",opacity:cancelling?.6:1 }}>
                      {cancelling ? "Membatalkan..." : "❌ Batalkan"}
                    </button>
                  )}
                  {svc && (
                    <button onClick={()=>{ setActiveOrder(null); onGoBooking(svc); }} style={{ flex:1,minWidth:120,padding:".75rem",background:BLUE,color:WHITE,border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Pesan Lagi</button>
                  )}
                  <button onClick={()=>setActiveOrder(null)} style={{ padding:".75rem 1.25rem",background:WHITE,color:DARK,border:"1.5px solid #D1D9EF",borderRadius:10,fontWeight:500,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Tutup</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div style={{ maxWidth:1760, margin:"0 auto", padding:"7rem 2rem 5rem" }}>
        <Anim>
          <button onClick={onBack} style={{ display:"inline-flex",alignItems:"center",gap:8,background:"none",border:"none",color:MUTED,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginBottom:"2rem" }}>← Kembali ke Beranda</button>
          <Label>RIWAYAT PESANAN</Label>
          <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap",marginBottom:".75rem" }}>
            <h1 style={{ fontSize:"clamp(1.8rem,3.5vw,2.6rem)",fontWeight:800,color:DARK,letterSpacing:"-.02em" }}>
              Pemesanan <span style={{ color:BLUE }}>Saya</span>
            </h1>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              style={{ background:WHITE,color:BLUE,border:`1.5px solid ${BLUE_L}`,padding:".55rem 1rem",borderRadius:10,cursor:refreshing?"wait":"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,transition:"all .2s" }}
              onMouseOver={e=>{ if(!refreshing){ e.currentTarget.style.borderColor=BLUE; }}}
              onMouseOut={e=>{ e.currentTarget.style.borderColor=BLUE_L; }}>
              <span style={{ display:"inline-block",animation:refreshing?"spin 1s linear infinite":"none" }}>🔄</span>
              {refreshing ? "Memperbarui..." : "Perbarui"}
            </button>
          </div>
          <p style={{ fontSize:15,color:MUTED,marginBottom:"2rem" }}>Pantau status dan riwayat semua pesanan jasa Anda di sini. Status diperbarui otomatis setiap 12 detik.</p>
        </Anim>

        {/* Stats row */}
        <Anim delay={0.04}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1rem",marginBottom:"2.5rem" }}>
            {[
              { label:"Total Pesanan", val:orders.length,                                        bg:BLUE_L,   text:BLUE      },
              { label:"Menunggu",      val:orders.filter(o=>o.status==="menunggu").length,        bg:YELLOW_L, text:"#92400E" },
              { label:"Sedang Proses", val:orders.filter(o=>o.status==="proses").length,         bg:BLUE_L,   text:BLUE      },
              { label:"Selesai",       val:orders.filter(o=>o.status==="selesai").length,        bg:"#ECFDF5",text:"#059669" },
            ].map(s=>(
              <div key={s.label} style={{ background:s.bg,borderRadius:14,padding:"1.25rem",textAlign:"center" }}>
                <div style={{ fontSize:28,fontWeight:800,color:s.text }}>{s.val}</div>
                <div style={{ fontSize:12,color:s.text,opacity:.75,marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Anim>

        {/* Filter + New Order */}
        <Anim delay={0.06}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem",marginBottom:"2rem" }}>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {filters.map(f=>(
                <button key={f} onClick={()=>setFilterStatus(f)} style={{ background:filterStatus===f?BLUE:WHITE,color:filterStatus===f?WHITE:DARK,border:`1.5px solid ${filterStatus===f?BLUE:"#D1D9EF"}`,padding:".4rem 1rem",borderRadius:100,fontSize:13,fontWeight:filterStatus===f?700:500,cursor:"pointer",fontFamily:"inherit",transition:"all .2s" }}>
                  {f==="semua"?"Semua":STATUS_CONFIG[f]?.label||f}
                </button>
              ))}
            </div>
            <button onClick={onGoJasa} style={{ background:BLUE,color:WHITE,border:"none",padding:".6rem 1.4rem",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",display:"flex",alignItems:"center",gap:6 }}>
              + Pesan Jasa Baru
            </button>
          </div>
        </Anim>

        {/* Loading state */}
        {ordersLoading && orders.length === 0 ? (
          <div style={{ textAlign:"center",padding:"4rem",color:MUTED }}>
            <div style={{ fontSize:36,marginBottom:"1rem",animation:"spin 1s linear infinite",display:"inline-block" }}>⏳</div>
            <p>Memuat pesanan...</p>
          </div>
        ) : shown.length === 0 ? (
          <Anim>
            <div style={{ textAlign:"center",padding:"5rem",color:MUTED,background:WHITE,borderRadius:20,border:"1.5px solid #E5EAF5" }}>
              <div style={{ fontSize:56,marginBottom:"1rem" }}>📭</div>
              <h3 style={{ fontWeight:700,fontSize:18,color:DARK,marginBottom:".5rem" }}>{orders.length === 0 ? "Belum ada pesanan" : "Tidak ada pesanan dengan filter ini"}</h3>
              <p style={{ fontSize:14,marginBottom:"2rem" }}>{orders.length === 0 ? "Mulai pesan layanan multimedia profesional dari IMA Creative Production." : "Coba ganti filter status di atas."}</p>
              {orders.length === 0 && (
                <button onClick={onGoJasa} style={{ background:BLUE,color:WHITE,border:"none",padding:".8rem 2rem",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit" }}>Lihat Layanan Kami</button>
              )}
            </div>
          </Anim>
        ) : (
          <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
            {shown.map((ord, i) => {
              const st  = STATUS_CONFIG[ord.status] || STATUS_CONFIG.menunggu;
              const svc = jasaList.find(s => s.id === ord.svc) || jasaList.find(s => s.id_jasa === ord.svc);
              return (
                <Anim key={ord.id_pemesanan || ord.id || i} delay={i*0.04}>
                  <div onClick={()=>setActiveOrder(ord)} style={{ background:WHITE,border:"1.5px solid #E5EAF5",borderRadius:16,padding:"1.5rem",display:"flex",alignItems:"center",gap:"1.5rem",cursor:"pointer",transition:"border-color .25s,transform .25s,box-shadow .25s" }}
                    onMouseOver={e=>{ e.currentTarget.style.borderColor=BLUE; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(27,79,216,.1)"; }}
                    onMouseOut={e=>{ e.currentTarget.style.borderColor="#E5EAF5"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                    <div style={{ width:72,height:72,borderRadius:14,background:svc?.imgBg||BLUE_L,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0 }}>{svc?.emoji||"📋"}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap" }}>
                        <span style={{ fontWeight:800,fontSize:15,color:DARK }}>{ord.svcName}</span>
                        <span style={{ fontSize:11,fontFamily:"monospace",color:MUTED,background:BG,padding:".15rem .5rem",borderRadius:6,border:"1px solid #E5EAF5" }}>{ord.kode || ord.id}</span>
                      </div>
                      <div style={{ fontSize:13,color:MUTED,marginBottom:6 }}>{ord.paket} · {ord.company}</div>
                      <div style={{ display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:4,fontSize:13,color:MUTED }}>📅 {ord.date} · {ord.time}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right",flexShrink:0 }}>
                      <div style={{ fontWeight:800,fontSize:16,color:BLUE,marginBottom:8 }}>{fmt(ord.total)}</div>
                      <span style={{ background:st.bg,color:st.color,fontSize:11,fontWeight:700,padding:".3rem .8rem",borderRadius:100,border:`1px solid ${st.color}33`,whiteSpace:"nowrap" }}>{st.icon} {st.label}</span>
                    </div>
                    <div style={{ color:MUTED,fontSize:18,flexShrink:0 }}>›</div>
                  </div>
                </Anim>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <Anim delay={0.1}>
          <div style={{ marginTop:"3rem",background:BLUE,borderRadius:20,padding:"2.5rem 2rem",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"2rem",flexWrap:"wrap",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:"#FACC15",opacity:.15 }}/>
            <div style={{ position:"relative" }}>
              <h3 style={{ fontWeight:700,fontSize:"1.3rem",color:WHITE,marginBottom:".4rem" }}>Butuh layanan baru?</h3>
              <p style={{ fontSize:14,color:"rgba(255,255,255,.75)" }}>Pesan jasa multimedia profesional IMA Creative Production sekarang.</p>
            </div>
            <div style={{ display:"flex",gap:".75rem",flexShrink:0,position:"relative" }}>
              <button onClick={onGoJasa} style={{ background:"#FACC15",color:"#1C1200",border:"none",padding:".8rem 1.75rem",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Lihat Semua Jasa</button>
              <button onClick={onGoPortfolio} style={{ background:"rgba(255,255,255,.12)",color:WHITE,border:"1px solid rgba(255,255,255,.3)",padding:".8rem 1.75rem",borderRadius:10,fontWeight:500,fontSize:14,cursor:"pointer",fontFamily:"inherit" }}>Lihat Portofolio</button>
            </div>
          </div>
        </Anim>
      </div>

      <div style={{ borderTop:"1px solid #E5EAF5",padding:"1.5rem 3rem",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontSize:12,color:MUTED }}>© 2024 PT. IMA Creative Production</span>
        <button onClick={onBack} style={{ background:"none",border:"none",color:BLUE,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>← Kembali ke Beranda</button>
      </div>
    </div>
  );
}
