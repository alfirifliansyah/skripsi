import { useState, useEffect } from "react";
import { BLUE, BLUE_L, BG, WHITE, DARK, MUTED, YELLOW, YELLOW_L } from "../constants/colors";
import { MONTHS, DAYS_HDR, TIME_SLOTS, fmt } from "../constants/data";
import { pemesananAPI, jadwalAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Anim from "../components/ui/Anim";

/* ─── Booking Calendar ─────────────────────────────────── */
function BookingCalendar({ selDate, setSelDate, setSelTime, month, year, prevMonth, nextMonth, serviceId }) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const today       = new Date();
  const isPast   = (d) => new Date(year,month,d) < new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const isToday  = (d) => d===today.getDate() && month===today.getMonth() && year===today.getFullYear();

  const [unavailable, setUnavailable] = useState([]);
  const [unavailableMap, setUnavailableMap] = useState({});
  const [loadingJadwal, setLoadingJadwal] = useState(false);

  useEffect(() => {
    if (!serviceId) return;
    const bulan = `${year}-${String(month+1).padStart(2,"0")}`;
    setLoadingJadwal(true);
    jadwalAPI.check(serviceId, bulan)
      .then(data => {
        const list = data?.unavailable_list || [];
        setUnavailable(list);
        const map = {};
        (data?.unavailable || []).forEach(item => {
          map[item.tanggal] = item;
        });
        setUnavailableMap(map);
      })
      .catch(() => { setUnavailable([]); setUnavailableMap({}); })
      .finally(() => setLoadingJadwal(false));
  }, [serviceId, month, year]);

  const isUnavailable = (d) => {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return unavailable.includes(dateStr);
  };
  const getUnavailReason = (d) => {
    const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    return unavailableMap[dateStr];
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
        <button onClick={prevMonth} style={{ width:32,height:32,borderRadius:"50%",border:"1.5px solid #E5EAF5",background:WHITE,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
        <span style={{ fontWeight:700,fontSize:14,color:DARK }}>
          {MONTHS[month]} {year} {loadingJadwal && <span style={{fontSize:11,color:MUTED,marginLeft:6}}>memuat jadwal...</span>}
        </span>
        <button onClick={nextMonth} style={{ width:32,height:32,borderRadius:"50%",border:"1.5px solid #E5EAF5",background:WHITE,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4 }}>
        {DAYS_HDR.map(d=><div key={d} style={{ textAlign:"center",fontSize:11,fontWeight:700,color:MUTED,padding:".3rem 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3 }}>
        {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
        {Array(daysInMonth).fill(null).map((_,i)=>{
          const d=i+1;
          const past=isPast(d);
          const sel=selDate===d;
          const todayD=isToday(d);
          const unav=isUnavailable(d);
          const reason = unav ? getUnavailReason(d) : null;
          const disabled = past || unav;
          let bg = "transparent", color = DARK;
          if (sel) { bg = BLUE; color = WHITE; }
          else if (past) { color = "#CBD5E1"; }
          else if (unav) { bg = "#FEE2E2"; color = "#991B1B"; }
          else if (todayD) { bg = YELLOW_L; color = "#92400E"; }
          return (
            <button
              key={d}
              disabled={disabled}
              title={reason ? `❌ ${reason.alasan}` : ""}
              onClick={()=>{ if(!disabled){ setSelDate(d); setSelTime(null); }}}
              style={{ aspectRatio:"1",borderRadius:8,border:"none",background:bg,color,fontWeight:sel||todayD||unav?700:400,fontSize:13,cursor:disabled?"not-allowed":"pointer",position:"relative",transition:"background .15s",textDecoration:unav?"line-through":"none" }}>
              {d}
              {todayD&&!sel&&!unav&&<div style={{ position:"absolute",bottom:3,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:BLUE }}/>}
              {unav&&<div style={{ position:"absolute",top:2,right:2,fontSize:8,opacity:.7 }}>✕</div>}
            </button>
          );
        })}
      </div>
      <div style={{ display:"flex",gap:"1rem",marginTop:".9rem",paddingTop:".75rem",borderTop:"1px solid #F1F5F9",flexWrap:"wrap" }}>
        {[["#1B4FD8","Dipilih"],["#FACC15","Hari ini"],["#FEE2E2","Tidak tersedia"]].map(([c,l])=>(
          <div key={l} style={{ display:"flex",alignItems:"center",gap:5 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:c,border:c==="#FEE2E2"?"1px solid #991B1B":"none" }}/><span style={{ fontSize:11,color:MUTED }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Payment Step ─────────────────────────────────────── */
function PaymentStep({
  svcName, paketLabel, paketData, selDate, month, year, selTime,
  name, phone, company, notes, total, paketPrice, addonTotal,
  serviceId, addons, addonsList,
  onBack, onSuccess, onLogin, onRegister, onGoHome, scrolled, user, onGoProfile, onLogout,
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [payMethod, setPayMethod] = useState("midtrans");

  const tax = Math.round((paketPrice + addonTotal) * 0.11);
  const handleNav = (link) => { if(link==="Beranda") onGoHome(); };

  const dateForBackend = `${year}-${String(month+1).padStart(2,"0")}-${String(selDate).padStart(2,"0")}`;

  const handleBayar = async () => {
    if (!user) {
      alert("Anda harus login dulu sebelum memesan.");
      onLogin();
      return;
    }
    setLoading(true);
    setError("");

    let order;
    try {
      order = await pemesananAPI.create({
        serviceId,
        paketId:    paketData?.id,
        paketLabel,
        paketPrice,
        addonsObj:  addons || {},
        addonsList: addonsList || [],
        date:    dateForBackend,
        time:    selTime,
        name,
        phone,
        company: company || "",
        notes:   notes   || "",
      });
    } catch (e) {
      setError(e.message || "Gagal membuat pesanan. Coba lagi.");
      setLoading(false);
      return;
    }

    if (payMethod === "midtrans") {
      try {
        const idPemesanan = order?.id_pemesanan || order?.id;
        const payment = await pemesananAPI.createPayment(idPemesanan);
        const snapToken = payment?.snap_token;

        if (!snapToken) {
          throw new Error("Server tidak mengembalikan snap_token. Cek apakah MIDTRANS_SERVER_KEY sudah diisi di .env backend.");
        }
        if (!window.snap) {
          throw new Error("Midtrans Snap belum siap. Pastikan VITE_MIDTRANS_CLIENT_KEY ada di .env frontend, lalu restart dev server (npm run dev). Cek juga browser console untuk detail.");
        }

        window.snap.pay(snapToken, {
          onSuccess: (res) => {
            console.log("Midtrans success:", res);
            onSuccess({ ...order, payment_status: "success", midtrans_response: res });
          },
          onPending: (res) => {
            console.log("Midtrans pending:", res);
            onSuccess({ ...order, payment_status: "pending", midtrans_response: res });
          },
          onError: (res) => {
            console.error("Midtrans error:", res);
            setError("Pembayaran gagal: " + (res?.status_message || "Unknown error"));
            setLoading(false);
          },
          onClose: () => {
            onSuccess({ ...order, payment_status: "menunggu" });
          },
        });
      } catch (e) {
        setError(e.message || "Gagal memulai pembayaran Midtrans.");
        setLoading(false);
      }
    } else {
      setLoading(false);
      onSuccess(order);
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, minHeight:"100vh" }}>
      <Navbar activeNav="Pemesanan" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>
      <div className="section-pad" style={{ maxWidth:760, margin:"0 auto", padding:"7rem 2rem 4rem" }}>
        <button onClick={onBack} style={{ display:"inline-flex",alignItems:"center",gap:8,background:"none",border:"none",color:MUTED,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginBottom:"2rem" }}>← Kembali Edit Pesanan</button>
        <h2 style={{ fontWeight:800,fontSize:"clamp(1.4rem,3vw,1.8rem)",color:DARK,marginBottom:".5rem" }}>Review & Pembayaran</h2>
        <p style={{ color:MUTED,marginBottom:"2rem" }}>Periksa detail pesanan Anda sebelum melanjutkan pembayaran.</p>

        {error && (
          <div style={{ background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:10,padding:".9rem 1.25rem",marginBottom:"1.25rem",fontSize:13,color:"#DC2626" }}>
            ⚠️ {error}
          </div>
        )}

        <div className="card-pad" style={{ background:WHITE,borderRadius:16,border:"1.5px solid #E5EAF5",padding:"1.75rem",marginBottom:"1.25rem" }}>
          <h3 style={{ fontWeight:700,fontSize:15,color:DARK,marginBottom:"1.25rem" }}>📋 Ringkasan Pesanan</h3>
          {[
            ["Layanan",   svcName],
            ["Paket",     paketLabel],
            ["Tanggal",   `${selDate} ${MONTHS[month]} ${year}`],
            ["Waktu Mulai", selTime],
            ["Nama PIC",  name],
            ["Telepon",   phone],
            ["Perusahaan",company||"-"],
            ["Catatan",   notes||"-"],
          ].map(([k,v])=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:".6rem 0",borderBottom:"1px solid #F1F5F9", gap:8 }}>
              <span style={{ fontSize:14,color:MUTED, flexShrink:0 }}>{k}</span>
              <span style={{ fontSize:14,fontWeight:600,color:DARK,maxWidth:"60%",textAlign:"right", wordBreak:"break-word" }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="card-pad" style={{ background:WHITE,borderRadius:16,border:"1.5px solid #E5EAF5",padding:"1.75rem",marginBottom:"1.25rem" }}>
          <h3 style={{ fontWeight:700,fontSize:15,color:DARK,marginBottom:"1.25rem" }}>💰 Rincian Biaya</h3>
          {[[paketLabel, fmt(paketPrice)],["Tambahan", fmt(addonTotal)],["PPN 11%", fmt(tax)]].map(([k,v])=>(
            <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:".55rem 0",borderBottom:"1px solid #F1F5F9" }}>
              <span style={{ fontSize:14,color:MUTED }}>{k}</span>
              <span style={{ fontSize:14,color:DARK }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex",justifyContent:"space-between",padding:".8rem 0 0" }}>
            <span style={{ fontSize:16,fontWeight:800,color:DARK }}>Total Bayar</span>
            <span style={{ fontSize:18,fontWeight:800,color:BLUE }}>{fmt(total+tax)}</span>
          </div>
        </div>

        <div className="card-pad" style={{ background:WHITE,borderRadius:16,border:"1.5px solid #E5EAF5",padding:"1.75rem",marginBottom:"1.75rem" }}>
          <h3 style={{ fontWeight:700,fontSize:15,color:DARK,marginBottom:"1.25rem" }}>💳 Metode Pembayaran</h3>
          <div className="grid-2-sm" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:".75rem",marginBottom:"1.25rem" }}>
            {[
              {id:"midtrans",label:"Midtrans (Online)",icon:"⚡", desc:"Bayar instan via QRIS, e-wallet, kartu, transfer"},
              {id:"transfer",label:"Transfer Manual",  icon:"🏦", desc:"Transfer ke rekening, konfirmasi via WhatsApp"},
            ].map(m=>(
              <button key={m.id} onClick={()=>setPayMethod(m.id)} style={{ background:payMethod===m.id?BLUE_L:WHITE,border:`2px solid ${payMethod===m.id?BLUE:"#E5EAF5"}`,borderRadius:12,padding:"1rem 1.25rem",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:12,transition:"all .2s",textAlign:"left" }}>
                <span style={{ fontSize:24,flexShrink:0 }}>{m.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize:13,fontWeight:700,color:payMethod===m.id?BLUE:DARK,marginBottom:2 }}>{m.label}</div>
                  <div style={{ fontSize:11,color:MUTED }}>{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {payMethod==="midtrans" && (
            <div style={{ background:"#ECFDF5",border:"1.5px solid #BBF7D0",borderRadius:12,padding:"1.25rem" }}>
              <p style={{ fontSize:13,fontWeight:700,color:"#065F46",marginBottom:".4rem",display:"flex",alignItems:"center",gap:6 }}>⚡ Midtrans Snap</p>
              <p style={{ fontSize:13,color:MUTED,lineHeight:1.6,marginBottom:".75rem" }}>Setelah klik tombol "Bayar Sekarang", popup pembayaran Midtrans akan muncul. Pilih metode (QRIS, OVO, GoPay, kartu kredit, dll) lalu selesaikan pembayaran.</p>
              <div style={{ background:WHITE,borderRadius:8,padding:".7rem 1rem",fontSize:12,color:MUTED,lineHeight:1.7 }}>
                <strong style={{ color:"#065F46" }}>Mode Sandbox:</strong> Tidak ada uang sungguhan. Untuk testing, gunakan kartu <strong>4811-1111-1111-1114</strong> (CVV: 123, Exp: 01/29).
              </div>
            </div>
          )}
          {payMethod==="transfer" && (
            <div style={{ background:BLUE_L,borderRadius:12,padding:"1.25rem" }}>
              <p style={{ fontSize:13,fontWeight:700,color:BLUE,marginBottom:".6rem" }}>Detail Transfer Bank</p>
              {[["Bank","BCA"],["No. Rekening","123-456-7890"],["Atas Nama","PT IMA Creative Production"]].map(([k,v])=>(
                <div key={k} style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:13,color:MUTED }}>{k}</span>
                  <span style={{ fontSize:13,fontWeight:700,color:DARK }}>{v}</span>
                </div>
              ))}
              <p style={{ fontSize:11,color:MUTED,marginTop:".75rem" }}>Setelah transfer, hubungi WhatsApp +62 21 1234 5678 untuk konfirmasi.</p>
            </div>
          )}
        </div>

        <div style={{ background:YELLOW_L,border:"1.5px solid #FDE68A",borderRadius:12,padding:"1rem 1.25rem",display:"flex",alignItems:"center",gap:10,marginBottom:"1.75rem" }}>
          <span>🎁</span>
          <div>
            <p style={{ fontSize:13,fontWeight:700,color:"#92400E" }}>Promo Bayar Penuh</p>
            <p style={{ fontSize:12,color:"#92400E",opacity:.8 }}>Diskon 5% untuk pembayaran lunas sebelum H-7 acara</p>
          </div>
        </div>

        <button
          onClick={handleBayar}
          disabled={loading}
          style={{ width:"100%",padding:"1rem",background:loading?"#A0AABF":BLUE,color:WHITE,border:"none",borderRadius:14,fontWeight:800,fontSize:16,cursor:loading?"not-allowed":"pointer",fontFamily:"inherit",boxShadow:loading?"none":"0 6px 24px rgba(27,79,216,.3)",letterSpacing:".04em",transition:"background .2s" }}
        >
          {loading ? "⏳ Memproses Pesanan..." : `BAYAR SEKARANG — ${fmt(total+tax)}`}
        </button>
        <p style={{ textAlign:"center",fontSize:12,color:MUTED,marginTop:".75rem" }}>🔒 Pembayaran aman & terenkripsi.</p>
      </div>
    </div>
  );
}

/* ─── Booking Page ─────────────────────────────────────── */
export default function BookingPage({
  service, jasaList = [],
  onBack, onSuccess, onLogin, onRegister, onGoHome,
  user, onGoProfile, onLogout,
}) {
  const liveService = jasaList.find(j => j.id === service.id) || service;

  const packages = Array.isArray(liveService.packages) ? liveService.packages : [];
  const addonList = Array.isArray(liveService.addons) ? liveService.addons : [];

  const today = new Date();
  const [step,     setStep]     = useState(1);
  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [selDate,  setSelDate]  = useState(null);
  const [selTime,  setSelTime]  = useState(null);
  const [paket,    setPaket]    = useState(packages[0]?.id || "");
  const [addons,   setAddons]   = useState({});
  const [name,     setName]     = useState(user?.name||"");
  const [phone,    setPhone]    = useState(user?.phone&&user.phone!=="-"?user.phone:"");
  const [company,  setCompany]  = useState(user?.company||"");
  const [notes,    setNotes]    = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(()=>{
    window.scrollTo(0,0);
    const fn=()=>setScrolled(window.scrollY>60);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);

  useEffect(() => {
    if (!paket && packages.length > 0) setPaket(packages[0].id);
  }, [packages, paket]);

  const handleNav  = (link) => { if(link==="Beranda") onGoHome(); };
  const prevMonth  = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth  = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const paketData  = packages.find(p=>p.id===paket) || packages[0];
  const paketPrice = Number(paketData?.price || 0);
  const addonTotal = addonList.reduce((sum,a)=>sum + (addons[a.id]||0)*Number(a.price||0), 0);
  const subtotal   = paketPrice + addonTotal;
  const tax        = Math.round(subtotal*0.11);
  const total      = subtotal + tax;
  const canProceed = selDate && selTime && name && phone && paketData;

  if (liveService.status_tersedia === "tidak_tersedia") {
    return (
      <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, minHeight:"100vh" }}>
        <Navbar activeNav="Jasa" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>
        <div className="modal-card" style={{ maxWidth:520, margin:"7rem auto", padding:"3rem 2rem", background:WHITE, borderRadius:18, textAlign:"center", border:"1.5px solid #E5EAF5" }}>
          <div style={{ fontSize:48, marginBottom:"1rem" }}>⚠️</div>
          <h2 style={{ fontWeight:800, fontSize:"1.4rem", color:DARK, marginBottom:".5rem" }}>Layanan tidak tersedia</h2>
          <p style={{ color:MUTED, marginBottom:"1.5rem", fontSize:14 }}>Layanan <strong>{liveService.title}</strong> sedang tidak tersedia untuk pemesanan.</p>
          <button onClick={onBack} style={{ background:BLUE, color:WHITE, border:"none", padding:".75rem 2rem", borderRadius:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Kembali ke Daftar Jasa</button>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, minHeight:"100vh" }}>
        <Navbar activeNav="Jasa" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>
        <div className="modal-card" style={{ maxWidth:520, margin:"7rem auto", padding:"3rem 2rem", background:WHITE, borderRadius:18, textAlign:"center", border:"1.5px solid #E5EAF5" }}>
          <div style={{ fontSize:48, marginBottom:"1rem" }}>📦</div>
          <h2 style={{ fontWeight:800, fontSize:"1.4rem", color:DARK, marginBottom:".5rem" }}>Paket belum tersedia</h2>
          <p style={{ color:MUTED, marginBottom:"1.5rem", fontSize:14 }}>Layanan ini belum memiliki paket. Silakan hubungi admin untuk informasi lebih lanjut.</p>
          <button onClick={onBack} style={{ background:BLUE, color:WHITE, border:"none", padding:".75rem 2rem", borderRadius:10, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Kembali</button>
        </div>
      </div>
    );
  }

  if (step===2) return (
    <PaymentStep
      svcName={liveService.title}
      paketLabel={paketData?.label}
      paketData={paketData}
      selDate={selDate} month={month} year={year}
      selTime={selTime}
      name={name} phone={phone} company={company} notes={notes}
      total={subtotal} paketPrice={paketPrice} addonTotal={addonTotal}
      serviceId={liveService.id}
      addons={addons}
      addonsList={addonList}
      onBack={()=>setStep(1)}
      onSuccess={onSuccess}
      onLogin={onLogin} onRegister={onRegister}
      onGoHome={onGoHome} scrolled={scrolled}
      user={user} onGoProfile={onGoProfile} onLogout={onLogout}
    />
  );

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, minHeight:"100vh" }}>
      <Navbar activeNav="Pemesanan" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={onGoProfile} onLogout={onLogout}/>
      <div className="section-pad" style={{ maxWidth:1920, margin:"0 auto", padding:"7rem 2rem 5rem" }}>

        <Anim>
          <button onClick={onBack} style={{ display:"inline-flex",alignItems:"center",gap:8,background:"none",border:"none",color:MUTED,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginBottom:"2rem" }}>← Kembali ke Daftar Jasa</button>
        </Anim>

        <Anim delay={0.03}>
          <div style={{ display:"flex",alignItems:"center",gap:0,marginBottom:"2.5rem",overflowX:"auto" }}>
            {[["1","Detail Pesanan"],["2","Review & Bayar"],["3","Selesai"]].map(([n,label],i)=>(
              <div key={n} style={{ display:"flex",alignItems:"center",flex:i<2?1:"none" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:i===0?BLUE:BLUE_L,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:i===0?WHITE:MUTED,flexShrink:0 }}>{n}</div>
                  <span style={{ fontSize:13,fontWeight:i===0?700:400,color:i===0?DARK:MUTED,whiteSpace:"nowrap" }}>{label}</span>
                </div>
                {i<2&&<div style={{ flex:1,height:2,background:"#E5EAF5",margin:"0 12px",minWidth:20 }}/>}
              </div>
            ))}
          </div>
        </Anim>

        <div className="grid-booking" style={{ display:"grid",gridTemplateColumns:"1fr 380px",gap:"2rem",alignItems:"start" }}>
          <div>
            <Anim>
              <div style={{ borderRadius:20,overflow:"hidden",marginBottom:"1.75rem",position:"relative",aspectRatio:"16/9",background:liveService.imgBg,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,.38)" }}/>
                <div style={{ position:"relative",textAlign:"center" }}>
                  <div style={{ fontSize:72 }}>{liveService.emoji}</div>
                  <div style={{ color:WHITE,fontWeight:700,fontSize:20,marginTop:8 }}>{liveService.title}</div>
                </div>
                <div style={{ position:"absolute",top:16,left:16,background:"rgba(255,255,255,.2)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.3)",color:WHITE,fontSize:11,fontWeight:700,padding:".3rem .8rem",borderRadius:100 }}>{liveService.tag}</div>
                <div style={{ position:"absolute",bottom:16,right:16,background:"rgba(255,255,255,.15)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.3)",color:WHITE,fontSize:12,fontWeight:600,padding:".4rem .9rem",borderRadius:100 }}>⭐ 4.9 · 200+ Event</div>
              </div>
              <h1 className="hero-title" style={{ fontWeight:800,fontSize:"clamp(1.3rem,3vw,1.7rem)",color:DARK,marginBottom:".5rem" }}>{liveService.title?.toUpperCase()}</h1>
              <p style={{ fontSize:14,color:MUTED,lineHeight:1.8,marginBottom:"1.5rem" }}>{liveService.desc}</p>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:"2rem" }}>
                {(liveService.features||[]).map(f=><span key={f} style={{ background:BLUE_L,color:BLUE,fontSize:12,fontWeight:600,padding:".3rem .8rem",borderRadius:100 }}>✦ {f}</span>)}
              </div>
            </Anim>

            <Anim delay={0.06}>
              <div className="card-pad" style={{ background:WHITE,borderRadius:18,border:"1.5px solid #E5EAF5",padding:"1.75rem",marginBottom:"1.5rem" }}>
                <h3 style={{ fontWeight:700,fontSize:16,color:DARK,marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ width:28,height:28,background:BLUE_L,borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>📦</span> Pilih Paket
                </h3>
                <div style={{ display:"flex",flexDirection:"column",gap:".75rem" }}>
                  {packages.map(p=>(
                    <div key={p.id} onClick={()=>setPaket(p.id)} style={{ border:`2px solid ${paket===p.id?BLUE:"#E5EAF5"}`,background:paket===p.id?BLUE_L:WHITE,borderRadius:14,padding:"1.1rem 1.25rem",cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:"0.75rem", minWidth:0, flex:1 }}>
                        <div style={{ width:18,height:18,borderRadius:"50%",border:`2px solid ${paket===p.id?BLUE:MUTED}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          {paket===p.id&&<div style={{ width:9,height:9,borderRadius:"50%",background:BLUE }}/>}
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontWeight:700,fontSize:14,color:DARK }}>{p.label} {p.hours && <span style={{ color:MUTED,fontWeight:400,fontSize:12 }}>· {p.hours}</span>}</div>
                          {Array.isArray(p.features) && (
                            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:4 }}>
                              {p.features.map((f,i)=><span key={f+i} style={{ fontSize:11,color:MUTED }}>{i>0?"· ":""}{f}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontWeight:800,fontSize:14,color:paket===p.id?BLUE:DARK,whiteSpace:"nowrap",flexShrink:0 }}>{fmt(p.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Anim>

            {addonList.length > 0 && (
              <Anim delay={0.08}>
                <div className="card-pad" style={{ background:WHITE,borderRadius:18,border:"1.5px solid #E5EAF5",padding:"1.75rem",marginBottom:"1.5rem" }}>
                  <h3 style={{ fontWeight:700,fontSize:16,color:DARK,marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:28,height:28,background:BLUE_L,borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>➕</span>
                    {liveService.addonLabel || "Tambahan"} <span style={{ fontSize:12,color:MUTED,fontWeight:400 }}>(Opsional)</span>
                  </h3>
                  <div style={{ display:"flex",flexDirection:"column",gap:".75rem" }}>
                    {addonList.map(a=>(
                      <div key={a.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",border:`1.5px solid ${(addons[a.id]||0)>0?BLUE:"#E5EAF5"}`,borderRadius:12,padding:"1rem 1.25rem",background:(addons[a.id]||0)>0?BLUE_L:WHITE,transition:"all .2s",gap:8,flexWrap:"wrap" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:".9rem", minWidth:0, flex:"1 1 auto" }}>
                          <span style={{ fontSize:22 }}>{a.icon || "✨"}</span>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontWeight:700,fontSize:14,color:DARK }}>{a.name}</div>
                            <div style={{ fontSize:12,color:MUTED }}>{a.desc} · <span style={{ color:BLUE,fontWeight:600 }}>{fmt(a.price)}/unit</span></div>
                          </div>
                        </div>
                        <div style={{ display:"flex",alignItems:"center",gap:10, flexShrink:0 }}>
                          <button onClick={()=>setAddons(c=>({...c,[a.id]:Math.max(0,(c[a.id]||0)-1)}))} style={{ width:30,height:30,borderRadius:"50%",border:`1.5px solid ${(addons[a.id]||0)>0?BLUE:"#D1D9EF"}`,background:WHITE,color:(addons[a.id]||0)>0?BLUE:MUTED,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
                          <span style={{ fontWeight:700,fontSize:15,color:DARK,minWidth:20,textAlign:"center" }}>{addons[a.id]||0}</span>
                          <button onClick={()=>setAddons(c=>({...c,[a.id]:(c[a.id]||0)+1}))} style={{ width:30,height:30,borderRadius:"50%",border:`1.5px solid ${BLUE}`,background:BLUE,color:WHITE,fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Anim>
            )}

            <Anim delay={0.1}>
              <div className="card-pad" style={{ background:WHITE,borderRadius:18,border:"1.5px solid #E5EAF5",padding:"1.75rem" }}>
                <h3 style={{ fontWeight:700,fontSize:16,color:DARK,marginBottom:"1.25rem",display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ width:28,height:28,background:BLUE_L,borderRadius:8,display:"inline-flex",alignItems:"center",justifyContent:"center" }}>👤</span> Detail Pemesanan
                </h3>
                <div className="grid-2-sm" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:".9rem" }}>
                  {[
                    ["Nama PIC *","text",name,setName,"Nama penanggung jawab","span1"],
                    ["No. Telepon *","tel",phone,setPhone,"+62 812 xxxx xxxx","span1"],
                    ["Nama Perusahaan","text",company,setCompany,"PT / CV / Instansi","span2"],
                  ].map(([label,type,val,setter,ph,span])=>(
                    <div key={label} style={{ gridColumn:span==="span2"?"span 2":"span 1" }}>
                      <label style={{ display:"block",fontSize:13,fontWeight:600,color:DARK,marginBottom:".4rem" }}>{label}</label>
                      <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                        style={{ width:"100%",padding:".65rem .9rem",border:"1.5px solid #D1D9EF",borderRadius:10,fontSize:14,fontFamily:"inherit",color:DARK,outline:"none" }}
                        onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#D1D9EF"}/>
                    </div>
                  ))}
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={{ display:"block",fontSize:13,fontWeight:600,color:DARK,marginBottom:".4rem" }}>Catatan Tambahan</label>
                    <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Kebutuhan khusus, lokasi acara, jumlah peserta..." rows={3}
                      style={{ width:"100%",padding:".65rem .9rem",border:"1.5px solid #D1D9EF",borderRadius:10,fontSize:14,fontFamily:"inherit",color:DARK,outline:"none",resize:"vertical" }}
                      onFocus={e=>e.target.style.borderColor=BLUE} onBlur={e=>e.target.style.borderColor="#D1D9EF"}/>
                  </div>
                </div>
              </div>
            </Anim>
          </div>

          {/* RIGHT — sidebar (di mobile dia akan jadi bagian bawah karena grid-booking jadi 1 kolom) */}
          <div style={{ position:"sticky",top:90 }}>
            <Anim delay={0.04}>
              <div className="card-pad" style={{ background:WHITE,borderRadius:18,border:"1.5px solid #E5EAF5",padding:"1.5rem",marginBottom:"1.25rem" }}>
                <h3 style={{ fontWeight:700,fontSize:15,color:DARK,marginBottom:"1.25rem",letterSpacing:".04em" }}>📅 PILIH TANGGAL</h3>
                <BookingCalendar selDate={selDate} setSelDate={setSelDate} setSelTime={setSelTime} month={month} year={year} prevMonth={prevMonth} nextMonth={nextMonth} serviceId={liveService.id}/>
              </div>
            </Anim>

            {selDate && (
              <Anim>
                <div className="card-pad" style={{ background:WHITE,borderRadius:18,border:"1.5px solid #E5EAF5",padding:"1.5rem",marginBottom:"1.25rem" }}>
                  <h3 style={{ fontWeight:700,fontSize:15,color:DARK,marginBottom:"1rem",letterSpacing:".04em" }}>⏰ PILIH WAKTU MULAI</h3>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".5rem" }}>
                    {TIME_SLOTS.map(t=>(
                      <button key={t} onClick={()=>setSelTime(t)} style={{ padding:".55rem .4rem",borderRadius:10,fontSize:13,fontWeight:600,border:`1.5px solid ${selTime===t?BLUE:"#E5EAF5"}`,background:selTime===t?BLUE:WHITE,color:selTime===t?WHITE:DARK,cursor:"pointer",transition:"all .15s",fontFamily:"inherit" }}>{t}</button>
                    ))}
                  </div>
                </div>
              </Anim>
            )}

            <Anim delay={0.06}>
              <div className="card-pad" style={{ background:WHITE,borderRadius:18,border:"1.5px solid #E5EAF5",padding:"1.5rem" }}>
                <h3 style={{ fontWeight:700,fontSize:15,color:DARK,marginBottom:"1rem" }}>🧾 Total Biaya</h3>
                <div style={{ display:"flex",flexDirection:"column",gap:".55rem",marginBottom:"1rem" }}>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <span style={{ fontSize:13,color:MUTED }}>{paketData?.label || "Paket"}</span>
                    <span style={{ fontSize:13,color:DARK }}>{fmt(paketPrice)}</span>
                  </div>
                  {addonList.filter(a=>(addons[a.id]||0)>0).map(a=>(
                    <div key={a.id} style={{ display:"flex",justifyContent:"space-between" }}>
                      <span style={{ fontSize:13,color:MUTED }}>{a.name} ×{addons[a.id]}</span>
                      <span style={{ fontSize:13,color:DARK }}>{fmt(a.price*(addons[a.id]||0))}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <span style={{ fontSize:13,color:MUTED }}>PPN 11%</span>
                    <span style={{ fontSize:13,color:DARK }}>{fmt(tax)}</span>
                  </div>
                  <div style={{ height:1,background:"#E5EAF5",margin:".2rem 0" }}/>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <span style={{ fontSize:15,fontWeight:800,color:DARK }}>Total</span>
                    <span style={{ fontSize:15,fontWeight:800,color:BLUE }}>{fmt(total)}</span>
                  </div>
                </div>
                <div style={{ background:YELLOW_L,border:"1px solid #FDE68A",borderRadius:10,padding:".75rem 1rem",display:"flex",alignItems:"center",gap:8,marginBottom:"1.25rem" }}>
                  <span>🎁</span><span style={{ fontSize:12,color:"#92400E",fontWeight:600 }}>Bayar penuh sekarang, hemat 5%!</span>
                </div>
                <button disabled={!canProceed} onClick={()=>{ if(canProceed) setStep(2); }}
                  style={{ width:"100%",padding:".9rem",borderRadius:12,border:"none",background:canProceed?BLUE:"#D1D9EF",color:canProceed?WHITE:MUTED,fontWeight:800,fontSize:15,cursor:canProceed?"pointer":"not-allowed",fontFamily:"inherit",letterSpacing:".04em",boxShadow:canProceed?"0 6px 20px rgba(27,79,216,.3)":"none",transition:"all .2s" }}>
                  {canProceed?"LANJUT KE PEMBAYARAN →":"Lengkapi Formulir Dulu"}
                </button>
                {!selDate&&<p style={{ textAlign:"center",fontSize:12,color:MUTED,marginTop:".6rem" }}>Pilih tanggal terlebih dahulu</p>}
                {selDate&&!selTime&&<p style={{ textAlign:"center",fontSize:12,color:MUTED,marginTop:".6rem" }}>Pilih jam mulai</p>}
                {selDate&&selTime&&(!name||!phone)&&<p style={{ textAlign:"center",fontSize:12,color:MUTED,marginTop:".6rem" }}>Isi nama & telepon PIC</p>}
              </div>
            </Anim>
          </div>
        </div>
      </div>
    </div>
  );
}