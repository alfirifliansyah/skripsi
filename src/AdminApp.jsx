import { useState, useEffect, useCallback, useRef } from "react";
import { authAPI, adminAPI, pemesananAPI, jasaAPI, jadwalAPI, portofolioAPI, pengaturanAPI, getToken } from "./services/api";
import { STATUS_DISPLAY, ADMIN_STATUS_OPTIONS, getDisplayStatus, mapDisplayToBackend } from "./constants/status";
import ImageUploader from "./components/admin/ImageUploader";

/* ─── Design tokens ─── */
const SIDEBAR_BG  = "#0D1117";
const SIDEBAR_W   = 240;
const ACCENT      = "#3B6EF6";
const ACCENT_L    = "#EEF2FF";
const SUCCESS     = "#10B981";
const SUCCESS_L   = "#ECFDF5";
const WARNING     = "#F59E0B";
const WARNING_L   = "#FFFBEB";
const DANGER      = "#EF4444";
const DANGER_L    = "#FEF2F2";
const DARK        = "#0F1B3D";
const MUTED       = "#6B7A99";
const BG          = "#F4F6FB";
const WHITE       = "#FFFFFF";
const BORDER      = "#E5EAF5";
const YELLOW      = "#FACC15";

/* ─── Helpers ─── */
const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const STATUS_CFG = {
  // ── Status lama (backend mentah) — tetap ada utk kompatibilitas ──
  selesai:        { label:"Selesai",         color:SUCCESS, bg:SUCCESS_L, icon:"✅" },
  proses:         { label:"Diproses",        color:ACCENT,  bg:ACCENT_L,  icon:"⚙️" },
  menunggu:       { label:"Menunggu",        color:WARNING, bg:WARNING_L, icon:"⏳" },
  batal:          { label:"Dibatalkan",      color:DANGER,  bg:DANGER_L,  icon:"❌" },
  tersedia:       { label:"Tersedia",        color:SUCCESS, bg:SUCCESS_L, icon:"🟢" },
  tidak_tersedia: { label:"Tidak Tersedia",  color:MUTED,   bg:"#F1F5F9", icon:"⚫" },
  // ── 7 status display baru (status_pesanan + sub_status) ──
  menunggu_pembayaran: { label:"Menunggu Pembayaran",         color:"#D97706", bg:WARNING_L, icon:"💳" },
  dikonfirmasi:        { label:"Pesanan Dikonfirmasi",        color:"#2563EB", bg:"#DBEAFE", icon:"✓" },
  persiapan:           { label:"Tim Sedang Persiapan",        color:ACCENT,    bg:ACCENT_L,  icon:"🛠️" },
  berlangsung:         { label:"Acara Sedang Berlangsung",    color:"#7C3AED", bg:"#EDE9FE", icon:"📡" },
  acara_selesai:       { label:"Acara Selesai",               color:"#0891B2", bg:"#CFFAFE", icon:"🎬" },
};

const POLL_ADMIN_DASHBOARD = 15000; // 15 detik
const POLL_ADMIN_ORDERS    = 12000; // 12 detik
const POLL_ADMIN_JASA      = 15000;

/* ──────────────────────────────────────────────────────── */
/*  Komponen Utility                                        */
/* ──────────────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || { label:status, color:MUTED, bg:"#F1F5F9", icon:"•" };
  return (
    <span style={{ background:cfg.bg, color:cfg.color, fontSize:11, fontWeight:700, padding:".25rem .75rem", borderRadius:100, border:`1px solid ${cfg.color}22`, whiteSpace:"nowrap" }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:14, padding:"1.5rem", ...style }}>{children}</div>;
}

function SectionTitle({ children }) {
  return <h3 style={{ fontWeight:700, fontSize:15, color:DARK, marginBottom:"1.25rem" }}>{children}</h3>;
}

function StatCard({ icon, label, value, sub, bg=ACCENT_L }) {
  return (
    <Card>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <p style={{ fontSize:12, color:MUTED, fontWeight:600, marginBottom:".4rem", letterSpacing:".04em" }}>{label}</p>
          <p style={{ fontSize:24, fontWeight:800, color:DARK, lineHeight:1 }}>{value}</p>
          {sub && <p style={{ fontSize:12, color:MUTED, marginTop:".35rem" }}>{sub}</p>}
        </div>
        <div style={{ width:44, height:44, borderRadius:12, background:bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      </div>
    </Card>
  );
}

function Spinner({ msg="Memuat data..." }) {
  return <div style={{ textAlign:"center", padding:"3rem", color:MUTED, fontSize:14 }}>⏳ {msg}</div>;
}

function ErrorMsg({ msg, onRetry }) {
  return (
    <div style={{ background:DANGER_L, border:`1px solid ${DANGER}33`, borderRadius:10, padding:"1rem 1.25rem", color:DANGER, fontSize:13, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
      <span>⚠️ {msg}</span>
      {onRetry && <button onClick={onRetry} style={{ background:DANGER, color:WHITE, border:"none", borderRadius:7, padding:".4rem .9rem", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Coba Lagi</button>}
    </div>
  );
}

function Table({ cols, rows, keyFn }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ background:BG }}>
            {cols.map(c=>(
              <th key={c.key+c.label} style={{ textAlign:"left", padding:".75rem 1rem", fontWeight:700, fontSize:12, color:MUTED, letterSpacing:".04em", whiteSpace:"nowrap", borderBottom:`1px solid ${BORDER}` }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row)=>(
            <tr key={keyFn(row)} style={{ borderBottom:`1px solid ${BORDER}`, transition:"background .15s" }}
              onMouseOver={e=>e.currentTarget.style.background=BG} onMouseOut={e=>e.currentTarget.style.background=WHITE}>
              {cols.map(c=>(
                <td key={c.key+c.label} style={{ padding:".85rem 1rem", color:DARK, whiteSpace:c.nowrap?"nowrap":"normal" }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length===0 && (
            <tr>
              <td colSpan={cols.length} style={{ padding:"2rem", textAlign:"center", color:MUTED, fontSize:13 }}>Tidak ada data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div style={{
      position:"fixed", top:24, right:24, zIndex:1500,
      background: toast.type==="success" ? SUCCESS : DANGER,
      color:WHITE, padding:".85rem 1.5rem", borderRadius:10,
      fontSize:14, fontWeight:600, boxShadow:"0 12px 28px rgba(0,0,0,.18)",
      minWidth:240, animation:"slideUp .25s ease"
    }}>
      {toast.type==="success" ? "✅ " : "⚠️ "}{toast.msg}
    </div>
  );
}

function Field({ label, children, hint, full }) {
  return (
    <div style={{ gridColumn: full ? "span 2" : "span 1" }}>
      <label style={{ display:"block", fontSize:12, fontWeight:600, color:MUTED, marginBottom:6, letterSpacing:".02em" }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize:11, color:MUTED, marginTop:4 }}>{hint}</p>}
    </div>
  );
}

function inputStyle() {
  return { width:"100%", padding:".65rem .85rem", border:`1.5px solid ${BORDER}`, borderRadius:8, fontSize:13, fontFamily:"inherit", color:DARK, outline:"none", background:WHITE };
}

/* ──────────────────────────────────────────────────────── */
/*  LOGIN                                                  */
/* ──────────────────────────────────────────────────────── */

function AdminLogin({ onSuccess }) {
  const [email,    setEmail]    = useState("admin@ima.test");
  const [password, setPassword] = useState("admin123");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  const handleLogin = async () => {
    setLoading(true); setErr("");
    try {
      const user = await authAPI.login({ email, password });
      if (!user.is_admin) {
        await authAPI.logout();
        setErr("Akun ini bukan admin. Hubungi super admin untuk akses.");
        return;
      }
      onSuccess(user);
    } catch (e) {
      setErr(e.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${SIDEBAR_BG} 0%,#1F2937 100%)`, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:WHITE, borderRadius:18, padding:"2.5rem", maxWidth:440, width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1.75rem" }}>
          <div style={{ width:38, height:38, background:ACCENT, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:WHITE }}>IMA</div>
          <span style={{ fontWeight:800, fontSize:14, color:DARK }}>IMA Creative <span style={{ color:ACCENT }}>Admin</span></span>
        </div>
        <h2 style={{ fontWeight:800, fontSize:"1.5rem", color:DARK, marginBottom:".5rem" }}>Selamat Datang!</h2>
        <p style={{ color:MUTED, marginBottom:"1.5rem", fontSize:14 }}>Masuk untuk mengakses admin panel.</p>

        {err && (
          <div style={{ background:DANGER_L, border:`1px solid ${DANGER}33`, borderRadius:8, padding:".75rem 1rem", marginBottom:"1rem", fontSize:13, color:DANGER }}>
            ⚠️ {err}
          </div>
        )}

        <Field label="EMAIL ADMIN">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle()} placeholder="admin@ima.test"/>
        </Field>
        <div style={{ marginTop:"1rem" }}>
          <Field label="PASSWORD">
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle()} placeholder="••••••••" onKeyDown={e=>e.key==='Enter' && handleLogin()}/>
          </Field>
        </div>

        <button onClick={handleLogin} disabled={loading || !email || !password}
          style={{ width:"100%", marginTop:"1.5rem", padding:".85rem", background:loading?MUTED:ACCENT, color:WHITE, border:"none", borderRadius:10, fontWeight:800, fontSize:14, cursor:loading?"wait":"pointer", fontFamily:"inherit", letterSpacing:".04em" }}>
          {loading ? "Memuat..." : "MASUK"}
        </button>

        <p style={{ marginTop:"1.25rem", fontSize:12, color:MUTED, textAlign:"center" }}>
          Default: <strong>admin@ima.test</strong> / <strong>admin123</strong>
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Sidebar                                                 */
/* ──────────────────────────────────────────────────────── */

function Sidebar({ active, onChange, onLogout, user }) {
  const items = [
    { id:"dashboard",  label:"Dashboard",      icon:"📊" },
    { id:"orders",     label:"Pesanan",        icon:"🛒" },
    { id:"services",   label:"Jasa",           icon:"🎬" },
    { id:"jadwal",     label:"Jadwal Jasa",    icon:"📅" },
    { id:"portofolio", label:"Portofolio",     icon:"🖼️" },
    { id:"beranda",    label:"Konten Beranda", icon:"🏠" },
    { id:"users",      label:"Pelanggan",      icon:"👥" },
    { id:"reports",    label:"Laporan",        icon:"📈" },
    { id:"profile",    label:"Profil Saya",    icon:"👤" },
  ];
  return (
    <aside style={{ width:SIDEBAR_W, background:SIDEBAR_BG, color:WHITE, position:"fixed", top:0, left:0, bottom:0, padding:"1.5rem 0", display:"flex", flexDirection:"column", zIndex:30 }}>
      <div style={{ padding:"0 1.5rem", marginBottom:"2rem", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, background:ACCENT, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:12, color:WHITE }}>IMA</div>
        <div>
          <div style={{ fontWeight:800, fontSize:13 }}>IMA Admin</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.5)" }}>v1.0</div>
        </div>
      </div>
      <nav style={{ flex:1, padding:"0 .75rem" }}>
        {items.map(it=>(
          <button key={it.id} onClick={()=>onChange(it.id)}
            style={{ width:"100%", padding:".7rem 1rem", marginBottom:4, background:active===it.id?"rgba(59,110,246,.18)":"transparent", color:active===it.id?WHITE:"rgba(255,255,255,.65)", border:"none", borderRadius:9, fontSize:13, fontWeight:active===it.id?700:500, fontFamily:"inherit", cursor:"pointer", display:"flex", alignItems:"center", gap:10, textAlign:"left", transition:"all .2s" }}>
            <span style={{ fontSize:16 }}>{it.icon}</span> {it.label}
          </button>
        ))}
      </nav>
      <div style={{ padding:"1rem 1rem 0", borderTop:"1px solid rgba(255,255,255,.08)", marginTop:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, padding:".4rem .5rem", marginBottom:".5rem" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:ACCENT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:WHITE }}>{user?.avatar || "A"}</div>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:WHITE, textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{user?.name || "Admin"}</div>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", textOverflow:"ellipsis", overflow:"hidden", whiteSpace:"nowrap" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width:"100%", padding:".55rem .75rem", background:"rgba(239,68,68,.12)", color:"#FCA5A5", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Dashboard Page                                          */
/* ──────────────────────────────────────────────────────── */

function DashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    try {
      const data = await adminAPI.dashboard();
      setStats(data);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_ADMIN_DASHBOARD);
    const onVis = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);

  if (loading && !stats) return <Spinner/>;
  if (error)   return <ErrorMsg msg={error} onRetry={load}/>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Dashboard</h1>
          <p style={{ color:MUTED, fontSize:13 }}>Ringkasan performa sistem · Auto-refresh 15 detik</p>
        </div>
        <button onClick={load} style={{ background:WHITE, color:ACCENT, border:`1.5px solid ${ACCENT_L}`, padding:".5rem 1rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🔄 Refresh</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"1rem", marginBottom:"1.5rem" }}>
        <StatCard icon="👥" label="Total Pelanggan"  value={stats.total_pelanggan}  bg={ACCENT_L}/>
        <StatCard icon="🛒" label="Total Pesanan"    value={stats.total_pemesanan}  bg={WARNING_L}/>
        <StatCard icon="🎬" label="Jasa Aktif"       value={`${stats.total_jasa_aktif}/${stats.total_jasa}`} bg={SUCCESS_L}/>
        <StatCard icon="💰" label="Pendapatan Total" value={fmt(stats.pendapatan_total)} sub={`Bulan ini: ${fmt(stats.pendapatan_bulan_ini)}`} bg={SUCCESS_L}/>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        <StatCard icon="⏳" label="Menunggu" value={stats.pemesanan_menunggu} bg={WARNING_L}/>
        <StatCard icon="⚙️" label="Diproses" value={stats.pemesanan_proses}   bg={ACCENT_L}/>
        <StatCard icon="✅" label="Selesai"  value={stats.pemesanan_selesai}  bg={SUCCESS_L}/>
        <StatCard icon="❌" label="Batal"    value={stats.pemesanan_batal}    bg={DANGER_L}/>
      </div>

      <Card>
        <SectionTitle>💡 Tips Operasional</SectionTitle>
        <ul style={{ listStyle:"none", padding:0, margin:0, color:MUTED, fontSize:13, lineHeight:1.9 }}>
          <li>• Konfirmasi pesanan menunggu dalam 1×24 jam untuk menjaga kepuasan pelanggan.</li>
          <li>• Update status pesanan secara realtime — user melihat perubahan otomatis.</li>
          <li>• Kelola jasa di menu <strong>Jasa</strong>: tambahkan paket dan addons untuk meningkatkan revenue.</li>
        </ul>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Orders Page                                             */
/* ──────────────────────────────────────────────────────── */

function OrdersPage({ showToast }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [filter,  setFilter]  = useState("semua");
  const [active,  setActive]  = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await pemesananAPI.getAll();
      setOrders(data);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_ADMIN_ORDERS);
    const onVis = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);

  const handleStatusChange = async (idOrCode, newDisplayKey) => {
    try {
      const ord = orders.find(o => (o.id_pemesanan === idOrCode || o.kode_pemesanan === idOrCode));
      const id = ord?.id_pemesanan || idOrCode;
      const { status_pesanan, sub_status_pesanan } = mapDisplayToBackend(newDisplayKey);
      await adminAPI.updateStatusPesanan(id, status_pesanan, sub_status_pesanan);
      showToast({ type:"success", msg:"Status pesanan diperbarui" });
      await load();
      if (active && active.id_pemesanan === id) {
        setActive({
          ...active,
          status_pesanan,
          status: status_pesanan,
          sub_status_pesanan,
          sub_status: sub_status_pesanan,
          display_status: newDisplayKey,
        });
      }
    } catch (e) { showToast({ type:"error", msg:e.message }); }
  };

  const filters = ["semua","menunggu_pembayaran","dikonfirmasi","persiapan","berlangsung","acara_selesai","selesai","batal"];
  const shown = filter==="semua" ? orders : orders.filter(o => getDisplayStatus(o) === filter);

  if (loading && orders.length === 0) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Manajemen Pesanan</h1>
          <p style={{ color:MUTED, fontSize:13 }}>Total: {orders.length} pesanan · Auto-refresh 12 detik</p>
        </div>
        <button onClick={load} style={{ background:WHITE, color:ACCENT, border:`1.5px solid ${ACCENT_L}`, padding:".5rem 1rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🔄 Refresh</button>
      </div>

      {error && <div style={{ marginBottom:"1rem" }}><ErrorMsg msg={error} onRetry={load}/></div>}

      <Card style={{ marginBottom:"1.5rem", padding:"1rem 1.25rem" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ background:filter===f?ACCENT:WHITE, color:filter===f?WHITE:DARK, border:`1.5px solid ${filter===f?ACCENT:BORDER}`, padding:".4rem 1rem", borderRadius:100, fontSize:12, fontWeight:filter===f?700:500, cursor:"pointer", fontFamily:"inherit" }}>
              {f === "semua" ? "Semua" : (STATUS_CFG[f]?.label || f)}
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ padding:0 }}>
        <Table
          cols={[
            { key:"kode_pemesanan", label:"Kode", nowrap:true, render:(v,r)=> <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:ACCENT }}>{v || r.kode}</span> },
            { key:"nama_pic",    label:"Pelanggan", render:(v,r)=>(<div><div style={{ fontWeight:700 }}>{r.customer?.nama || v}</div><div style={{ fontSize:11, color:MUTED }}>{r.perusahaan || "-"}</div></div>) },
            { key:"svcName",     label:"Layanan", render:(v,r)=>(<div><div>{v}</div><div style={{ fontSize:11, color:MUTED }}>{r.paket || r.paket_label}</div></div>) },
            { key:"date",        label:"Tanggal", nowrap:true },
            { key:"total_harga", label:"Total", nowrap:true, render:(v,r)=> <strong style={{ color:ACCENT }}>{fmt(v || r.total)}</strong> },
            { key:"status_pesanan", label:"Status", render:(v,r)=> <StatusBadge status={getDisplayStatus(r)}/> },
            { key:"actions", label:"Aksi", render:(_,r)=>(
              <button onClick={()=>setActive(r)} style={{ background:ACCENT, color:WHITE, border:"none", padding:".4rem .9rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Detail</button>
            )},
          ]}
          rows={shown}
          keyFn={r=>r.id_pemesanan || r.kode_pemesanan}
        />
      </Card>

      {/* Detail Modal */}
      {active && (
        <div onClick={()=>setActive(null)} style={{ position:"fixed", inset:0, background:"rgba(15,27,61,.55)", backdropFilter:"blur(6px)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:WHITE, borderRadius:14, padding:"1.75rem 2rem", maxWidth:600, width:"100%", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"1.25rem" }}>
              <div>
                <div style={{ fontFamily:"monospace", fontSize:14, fontWeight:800, color:ACCENT }}>{active.kode_pemesanan || active.kode}</div>
                <h3 style={{ fontWeight:800, fontSize:"1.2rem", color:DARK, marginTop:4 }}>{active.svcName}</h3>
                <div style={{ marginTop:6 }}><StatusBadge status={getDisplayStatus(active)}/></div>
              </div>
              <button onClick={()=>setActive(null)} style={{ background:BG, border:`1px solid ${BORDER}`, width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:18 }}>×</button>
            </div>
            {[
              ["Pelanggan",   active.customer?.nama || active.nama_pic],
              ["Email",       active.customer?.email || "-"],
              ["Telepon PIC", active.telepon_pic],
              ["Perusahaan",  active.perusahaan || "-"],
              ["Paket",       active.paket || active.paket_label],
              ["Tanggal",     active.date],
              ["Waktu",       active.time || active.waktu_pelaksanaan],
              ["Total Harga", <strong style={{ color:ACCENT }} key="t">{fmt(active.total || active.total_harga)}</strong>],
              ["Status Bayar", active.pembayaran?.status_verifikasi || "pending"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:".55rem 0", borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontSize:13, color:MUTED }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600, color:DARK, textAlign:"right", maxWidth:"60%" }}>{v}</span>
              </div>
            ))}
            {active.catatan && (
              <div style={{ marginTop:"1rem", background:BG, padding:".75rem 1rem", borderRadius:8, fontSize:13, color:DARK }}>
                <strong style={{ color:MUTED, fontSize:11 }}>CATATAN</strong><br/>{active.catatan}
              </div>
            )}
            <div style={{ marginTop:"1.5rem" }}>
              <p style={{ fontSize:12, fontWeight:700, color:MUTED, marginBottom:8 }}>UBAH STATUS:</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {ADMIN_STATUS_OPTIONS.map(s=>{
                  const cfg = STATUS_CFG[s];
                  const cur = getDisplayStatus(active);
                  return (
                    <button key={s} onClick={()=>handleStatusChange(active.id_pemesanan, s)} disabled={cur===s}
                      style={{ background:cur===s?cfg.bg:WHITE, color:cur===s?cfg.color:DARK, border:`1.5px solid ${cur===s?cfg.color:BORDER}`, padding:".5rem 1rem", borderRadius:8, fontSize:12, fontWeight:700, cursor:cur===s?"default":"pointer", fontFamily:"inherit", opacity:cur===s?.7:1 }}>
                      {cfg.icon} {cfg.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize:11, color:MUTED, marginTop:8 }}>
                💡 Pesanan "Menunggu Pembayaran" otomatis jadi "Pesanan Dikonfirmasi" setelah pembayaran berhasil.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  ServicesPage — FORM JASA LENGKAP                        */
/* ──────────────────────────────────────────────────────── */

const TAG_COLORS = [
  { value:"#1B4FD8", label:"Biru"   },
  { value:"#7C3AED", label:"Ungu"   },
  { value:"#D97706", label:"Oranye" },
  { value:"#DC2626", label:"Merah"  },
  { value:"#059669", label:"Hijau"  },
  { value:"#BE185D", label:"Pink"   },
];

const BG_PRESETS = [
  "linear-gradient(135deg,#1a2a6c,#1B4FD8 60%,#23d5ab)",
  "linear-gradient(135deg,#4c1d95,#7c3aed)",
  "linear-gradient(135deg,#92400e,#d97706)",
  "linear-gradient(135deg,#7f1d1d,#dc2626)",
  "linear-gradient(135deg,#064e3b,#059669)",
  "linear-gradient(135deg,#831843,#be185d)",
];

const EMPTY_JASA = {
  nama_jasa: "",
  deskripsi: "",
  harga: 0,
  status_tersedia: "tersedia",
  icon: "🎬",
  emoji: "🎬",
  tag: "Layanan",
  tag_color: "#1B4FD8",
  img_bg: BG_PRESETS[0],
  features: [],
  packages: [],
  addons: [],
  addon_label: "Tambahan",
};

function ServicesPage({ showToast }) {
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [editing,  setEditing]  = useState(null); // null | "new" | jasa object

  const load = useCallback(async () => {
    try {
      const data = await jasaAPI.getAllAdmin();
      setServices(data);
      setError("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_ADMIN_JASA);
    return () => clearInterval(id);
  }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin hapus jasa "${name}"?\n\nJika jasa pernah dipakai pesanan, akan disembunyikan (soft delete).`)) return;
    try {
      const res = await adminAPI.deleteJasa(id);
      showToast({ type:"success", msg: res.message || "Jasa dihapus" });
      await load();
    } catch (e) {
      showToast({ type:"error", msg: e.message || "Gagal menghapus" });
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminAPI.toggleJasa(id);
      showToast({ type:"success", msg:"Status jasa diubah" });
      await load();
    } catch (e) { showToast({ type:"error", msg: e.message }); }
  };

  if (loading && services.length === 0) return <Spinner/>;

  if (editing) {
    return <ServiceForm
      initial={editing === "new" ? EMPTY_JASA : editing}
      onCancel={()=>setEditing(null)}
      onSaved={async () => { await load(); setEditing(null); }}
      showToast={showToast}
    />;
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Manajemen Jasa</h1>
          <p style={{ color:MUTED, fontSize:13 }}>{services.length} jasa terdaftar · Perubahan otomatis terlihat di sisi user.</p>
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <button onClick={load} style={{ background:WHITE, color:ACCENT, border:`1.5px solid ${ACCENT_L}`, padding:".5rem 1rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🔄 Refresh</button>
          <button onClick={()=>setEditing("new")} style={{ background:ACCENT, color:WHITE, border:"none", padding:".55rem 1.25rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Tambah Jasa</button>
        </div>
      </div>

      {error && <div style={{ marginBottom:"1rem" }}><ErrorMsg msg={error} onRetry={load}/></div>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:"1rem" }}>
        {services.map(svc => (
          <Card key={svc.id_jasa || svc.id} style={{ padding:0, overflow:"hidden" }}>
            <div style={{ height:120, background:svc.img_bg || svc.imgBg || BG_PRESETS[0], display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, position:"relative", overflow:"hidden" }}>
              {svc.gambar_url ? (
                <img
                  src={svc.gambar_url}
                  alt={svc.nama_jasa || svc.title}
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <span style={{ position:"relative", zIndex:1 }}>{svc.emoji || svc.icon || "🎬"}</span>
              )}
              <div style={{ position:"absolute", top:10, right:10, zIndex:2 }}>
                <StatusBadge status={svc.status_tersedia}/>
              </div>
              <div style={{ position:"absolute", top:10, left:10, background:"rgba(255,255,255,.2)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.3)", color:WHITE, fontSize:10, fontWeight:700, padding:".2rem .6rem", borderRadius:100, zIndex:2 }}>{svc.tag}</div>
            </div>
            <div style={{ padding:"1.1rem 1.25rem" }}>
              <h3 style={{ fontWeight:800, fontSize:14, color:DARK, marginBottom:4 }}>{svc.nama_jasa || svc.title}</h3>
              <p style={{ fontSize:12, color:MUTED, lineHeight:1.6, marginBottom:".75rem", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{svc.deskripsi || svc.desc}</p>
              <div style={{ fontSize:11, color:MUTED, marginBottom:".75rem" }}>
                {(svc.packages || []).length} paket · {(svc.addons || []).length} addon · {(svc.features || []).length} fitur
              </div>
              <div style={{ fontWeight:800, fontSize:14, color:ACCENT, marginBottom:".85rem" }}>{fmt(svc.harga || svc.price)}</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <button onClick={()=>setEditing(svc)} style={{ flex:1, background:ACCENT_L, color:ACCENT, border:"none", padding:".45rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✏️ Edit</button>
                <button onClick={()=>handleToggle(svc.id_jasa || svc.id)} style={{ flex:1, background:WARNING_L, color:WARNING, border:"none", padding:".45rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  {svc.status_tersedia === "tersedia" ? "🔇 Sembunyikan" : "📢 Tampilkan"}
                </button>
                <button onClick={()=>handleDelete(svc.id_jasa || svc.id, svc.nama_jasa || svc.title)} style={{ background:DANGER_L, color:DANGER, border:"none", padding:".45rem .65rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🗑️</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <Card style={{ textAlign:"center", padding:"3rem" }}>
          <div style={{ fontSize:48, marginBottom:"1rem" }}>📦</div>
          <h3 style={{ fontWeight:700, color:DARK, marginBottom:".5rem" }}>Belum ada jasa</h3>
          <p style={{ color:MUTED, fontSize:13, marginBottom:"1.5rem" }}>Tambahkan jasa pertama Anda untuk mulai menerima pesanan.</p>
          <button onClick={()=>setEditing("new")} style={{ background:ACCENT, color:WHITE, border:"none", padding:".7rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Tambah Jasa</button>
        </Card>
      )}
    </div>
  );
}

/* ─── Service Form (Create / Edit) ─────────────────────── */
function ServiceForm({ initial, onCancel, onSaved, showToast }) {
  const isEdit = !!(initial.id_jasa || initial.id);
  const [form, setForm] = useState(() => ({
    nama_jasa:        initial.nama_jasa || initial.title || "",
    deskripsi:        initial.deskripsi || initial.desc  || "",
    harga:            Number(initial.harga || initial.price || 0),
    status_tersedia:  initial.status_tersedia || "tersedia",
    icon:             initial.icon  || "🎬",
    emoji:            initial.emoji || initial.icon || "🎬",
    tag:              initial.tag || "Layanan",
    tag_color:        initial.tag_color || initial.tagColor || "#1B4FD8",
    img_bg:           initial.img_bg || initial.imgBg || BG_PRESETS[0],
    gambar:           initial.gambar || null,            // ← BARU: path file dari server
    gambar_url:       initial.gambar_url || null,        // ← BARU: URL siap pakai utk preview
    features:         Array.isArray(initial.features) ? [...initial.features] : [],
    packages:         Array.isArray(initial.packages) ? initial.packages.map(p => ({
                        id: p.id, label: p.label, hours: p.hours || "", price: Number(p.price || 0),
                        features: Array.isArray(p.features) ? [...p.features] : [],
                      })) : [],
    addons:           Array.isArray(initial.addons) ? initial.addons.map(a => ({
                        id: a.id, name: a.name, desc: a.desc || "",
                        price: Number(a.price || 0), icon: a.icon || "✨",
                      })) : [],
    addon_label:      initial.addon_label || initial.addonLabel || "Tambahan",
  }));
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ─ Features ─
  const addFeature    = () => set("features", [...form.features, ""]);
  const updateFeature = (i, v) => set("features", form.features.map((f,j) => j===i ? v : f));
  const removeFeature = (i) => set("features", form.features.filter((_,j) => j!==i));

  // ─ Packages ─
  const addPackage = () => {
    const id = "pkg_" + Date.now().toString(36);
    set("packages", [...form.packages, { id, label:"Paket Baru", hours:"", price:0, features:[] }]);
  };
  const updatePackage = (i, k, v) => set("packages", form.packages.map((p,j) => j===i ? { ...p, [k]: v } : p));
  const removePackage = (i) => set("packages", form.packages.filter((_,j) => j!==i));
  const addPackageFeature    = (pi)        => updatePackage(pi, "features", [...form.packages[pi].features, ""]);
  const updatePackageFeature = (pi, fi, v) => updatePackage(pi, "features", form.packages[pi].features.map((f,j) => j===fi ? v : f));
  const removePackageFeature = (pi, fi)    => updatePackage(pi, "features", form.packages[pi].features.filter((_,j) => j!==fi));

  // ─ Addons ─
  const addAddon = () => {
    const id = "addon_" + Date.now().toString(36);
    set("addons", [...form.addons, { id, name:"Addon Baru", desc:"", price:0, icon:"✨" }]);
  };
  const updateAddon = (i, k, v) => set("addons", form.addons.map((a,j) => j===i ? { ...a, [k]: v } : a));
  const removeAddon = (i) => set("addons", form.addons.filter((_,j) => j!==i));

  const handleSave = async () => {
    if (!form.nama_jasa || !form.deskripsi || form.harga <= 0) {
      showToast({ type:"error", msg:"Nama, deskripsi, dan harga wajib diisi" });
      return;
    }
    // Exclude gambar_url dari payload — backend tidak butuh field itu
    // (cuma untuk preview UI). Backend hanya simpan `gambar` (path).
    const { gambar_url, ...rest } = form;
    const payload = {
      ...rest,
      harga: Number(form.harga),
      features: form.features.filter(f => f && f.trim()),
      packages: form.packages.map(p => ({
        ...p,
        price: Number(p.price),
        features: (p.features || []).filter(f => f && f.trim()),
      })),
      addons: form.addons.map(a => ({ ...a, price: Number(a.price) })),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await adminAPI.updateJasa(initial.id_jasa || initial.id, payload);
        showToast({ type:"success", msg:"Jasa berhasil diupdate!" });
      } else {
        await adminAPI.createJasa(payload);
        showToast({ type:"success", msg:"Jasa baru berhasil dibuat!" });
      }
      await onSaved();
    } catch (e) {
      const msg = e.errors
        ? Object.values(e.errors).flat().join(", ")
        : (e.message || "Gagal menyimpan");
      showToast({ type:"error", msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <button onClick={onCancel} style={{ background:"none", border:"none", color:MUTED, fontSize:13, cursor:"pointer", marginBottom:".4rem", padding:0 }}>← Kembali ke Daftar Jasa</button>
          <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:DARK }}>{isEdit ? `Edit: ${form.nama_jasa}` : "Tambah Jasa Baru"}</h1>
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <button onClick={onCancel} disabled={saving} style={{ background:WHITE, color:DARK, border:`1.5px solid ${BORDER}`, padding:".55rem 1.2rem", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Batal</button>
          <button onClick={handleSave} disabled={saving} style={{ background:saving?MUTED:ACCENT, color:WHITE, border:"none", padding:".55rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?"wait":"pointer", fontFamily:"inherit" }}>
            {saving ? "Menyimpan..." : (isEdit ? "💾 Update Jasa" : "✓ Buat Jasa")}
          </button>
        </div>
      </div>

      {/* Section: Info Dasar */}
      <Card style={{ marginBottom:"1rem" }}>
        <SectionTitle>📝 Informasi Dasar</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <Field label="NAMA JASA *" full>
            <input style={inputStyle()} value={form.nama_jasa} onChange={e=>set("nama_jasa", e.target.value)} placeholder="Contoh: Live Streaming"/>
          </Field>
          <Field label="DESKRIPSI *" full>
            <textarea rows={3} style={{ ...inputStyle(), resize:"vertical", fontFamily:"inherit" }} value={form.deskripsi} onChange={e=>set("deskripsi", e.target.value)} placeholder="Deskripsi lengkap layanan..."/>
          </Field>
          <Field label="HARGA MULAI (Rp) *">
            <input type="number" min="0" style={inputStyle()} value={form.harga} onChange={e=>set("harga", e.target.value)}/>
          </Field>
          <Field label="STATUS">
            <select style={inputStyle()} value={form.status_tersedia} onChange={e=>set("status_tersedia", e.target.value)}>
              <option value="tersedia">Tersedia (terlihat user)</option>
              <option value="tidak_tersedia">Tidak Tersedia</option>
            </select>
          </Field>
        </div>
      </Card>

      {/* Section: Visual */}
      <Card style={{ marginBottom:"1rem" }}>
        <SectionTitle>🎨 Tampilan Visual</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
          <Field label="EMOJI/ICON">
            <input style={inputStyle()} value={form.emoji} onChange={e=>{ set("emoji", e.target.value); set("icon", e.target.value); }} placeholder="🎬" maxLength={4}/>
          </Field>
          <Field label="TAG/KATEGORI">
            <input style={inputStyle()} value={form.tag} onChange={e=>set("tag", e.target.value)} placeholder="Broadcasting"/>
          </Field>
          <Field label="WARNA TAG">
            <select style={inputStyle()} value={form.tag_color} onChange={e=>set("tag_color", e.target.value)}>
              {TAG_COLORS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        {/* ── BARU: Upload Gambar Jasa ──────────────────────────────────── */}
        <Field label="GAMBAR JASA (OPSIONAL — JIKA DIISI, AKAN MENGGANTI GRADIENT)" full>
          <ImageUploader
            value={form.gambar}
            valueUrl={form.gambar_url}
            folder="jasa"
            onChange={(path, url) => setForm(f => ({ ...f, gambar: path, gambar_url: url }))}
            onError={(msg) => showToast({ type:"error", msg })}
            height={180}
          />
          <p style={{ fontSize:11, color:MUTED, marginTop:6 }}>
            Rekomendasi rasio 16:9, resolusi minimal 1200x675px. Maksimal 5MB.
          </p>
        </Field>
        {/* ──────────────────────────────────────────────────────────────── */}

        <Field label="BACKGROUND GRADIENT (DIPAKAI JIKA TIDAK ADA GAMBAR)" full>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6, marginBottom:8 }}>
            {BG_PRESETS.map((bg,i)=>(
              <div key={i} onClick={()=>set("img_bg", bg)} style={{ height:48, background:bg, borderRadius:8, cursor:"pointer", border:`3px solid ${form.img_bg===bg ? ACCENT : "transparent"}`, transition:"border-color .2s" }}/>
            ))}
          </div>
          <input style={inputStyle()} value={form.img_bg} onChange={e=>set("img_bg", e.target.value)} placeholder="linear-gradient(135deg,#1B4FD8,#23d5ab)"/>
        </Field>

        {/* Preview — tampilkan gambar kalau ada, fallback ke emoji+gradient */}
        <div style={{ marginTop:"1rem", height:120, background:form.img_bg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, position:"relative", overflow:"hidden" }}>
          {form.gambar_url ? (
            <img src={form.gambar_url} alt="Preview" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
          ) : (
            <span style={{ position:"relative", zIndex:1 }}>{form.emoji}</span>
          )}
          <div style={{ position:"absolute", top:10, left:10, background:"rgba(255,255,255,.2)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.3)", color:WHITE, fontSize:10, fontWeight:700, padding:".2rem .6rem", borderRadius:100, zIndex:2 }}>{form.tag}</div>
        </div>
      </Card>

      {/* Section: Features */}
      <Card style={{ marginBottom:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <SectionTitle>✨ Fitur Layanan</SectionTitle>
          <button onClick={addFeature} style={{ background:ACCENT, color:WHITE, border:"none", padding:".4rem .9rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Tambah Fitur</button>
        </div>
        <p style={{ fontSize:12, color:MUTED, marginBottom:"1rem", marginTop:"-1rem" }}>Fitur utama yang ditampilkan sebagai chip di kartu layanan.</p>
        {form.features.length === 0 ? (
          <p style={{ color:MUTED, fontSize:13, fontStyle:"italic" }}>Belum ada fitur. Klik "+" untuk menambah.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {form.features.map((f,i)=>(
              <div key={i} style={{ display:"flex", gap:8 }}>
                <input style={inputStyle()} value={f} onChange={e=>updateFeature(i, e.target.value)} placeholder={`Fitur #${i+1}`}/>
                <button onClick={()=>removeFeature(i)} style={{ background:DANGER_L, color:DANGER, border:"none", padding:"0 .9rem", borderRadius:8, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section: Packages */}
      <Card style={{ marginBottom:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <SectionTitle>📦 Paket Harga</SectionTitle>
          <button onClick={addPackage} style={{ background:ACCENT, color:WHITE, border:"none", padding:".4rem .9rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Tambah Paket</button>
        </div>
        <p style={{ fontSize:12, color:MUTED, marginBottom:"1rem", marginTop:"-1rem" }}>Pelanggan akan memilih salah satu paket saat memesan. Harga total dihitung dari paket + addon.</p>
        {form.packages.length === 0 ? (
          <p style={{ color:MUTED, fontSize:13, fontStyle:"italic" }}>Belum ada paket. Tambahkan minimal 1 paket agar layanan bisa dipesan.</p>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {form.packages.map((p,pi)=>(
              <div key={pi} style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:10, padding:"1rem 1.25rem" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".75rem" }}>
                  <strong style={{ fontSize:13, color:DARK }}>Paket #{pi+1}</strong>
                  <button onClick={()=>removePackage(pi)} style={{ background:DANGER_L, color:DANGER, border:"none", padding:".3rem .7rem", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✕ Hapus Paket</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:".75rem" }}>
                  <Field label="Nama Paket">
                    <input style={inputStyle()} value={p.label} onChange={e=>updatePackage(pi, "label", e.target.value)}/>
                  </Field>
                  <Field label="Durasi/Hours">
                    <input style={inputStyle()} value={p.hours} onChange={e=>updatePackage(pi, "hours", e.target.value)} placeholder="4 Jam / Full Day"/>
                  </Field>
                  <Field label="Harga (Rp)">
                    <input type="number" min="0" style={inputStyle()} value={p.price} onChange={e=>updatePackage(pi, "price", e.target.value)}/>
                  </Field>
                </div>
                <div style={{ marginTop:".5rem" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:".04em" }}>FITUR PAKET INI</span>
                    <button onClick={()=>addPackageFeature(pi)} style={{ background:ACCENT_L, color:ACCENT, border:"none", padding:".25rem .65rem", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Fitur</button>
                  </div>
                  {(p.features || []).map((f,fi)=>(
                    <div key={fi} style={{ display:"flex", gap:6, marginBottom:5 }}>
                      <input style={{ ...inputStyle(), padding:".5rem .75rem", fontSize:12 }} value={f} onChange={e=>updatePackageFeature(pi,fi,e.target.value)} placeholder="Fitur paket"/>
                      <button onClick={()=>removePackageFeature(pi,fi)} style={{ background:DANGER_L, color:DANGER, border:"none", padding:"0 .65rem", borderRadius:6, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Section: Addons */}
      <Card style={{ marginBottom:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <SectionTitle>➕ Addon (Tambahan Opsional)</SectionTitle>
          <button onClick={addAddon} style={{ background:ACCENT, color:WHITE, border:"none", padding:".4rem .9rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Tambah Addon</button>
        </div>
        <Field label="LABEL ADDON SECTION (DISPLAY)" full>
          <input style={inputStyle()} value={form.addon_label} onChange={e=>set("addon_label", e.target.value)} placeholder="Tambah Kamera / Tambah Fitur..."/>
        </Field>
        <div style={{ marginTop:"1rem" }}>
          {form.addons.length === 0 ? (
            <p style={{ color:MUTED, fontSize:13, fontStyle:"italic" }}>Belum ada addon. Pelanggan akan langsung membayar harga paket saja.</p>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:".75rem" }}>
              {form.addons.map((a,i)=>(
                <div key={i} style={{ background:BG, border:`1px solid ${BORDER}`, borderRadius:10, padding:".9rem 1.25rem" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:".5rem" }}>
                    <strong style={{ fontSize:12, color:DARK }}>Addon #{i+1}</strong>
                    <button onClick={()=>removeAddon(i)} style={{ background:DANGER_L, color:DANGER, border:"none", padding:".25rem .65rem", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✕ Hapus</button>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"60px 1fr 2fr 120px", gap:8 }}>
                    <Field label="Icon">
                      <input style={inputStyle()} value={a.icon} onChange={e=>updateAddon(i, "icon", e.target.value)} maxLength={4}/>
                    </Field>
                    <Field label="Nama">
                      <input style={inputStyle()} value={a.name} onChange={e=>updateAddon(i, "name", e.target.value)}/>
                    </Field>
                    <Field label="Deskripsi">
                      <input style={inputStyle()} value={a.desc} onChange={e=>updateAddon(i, "desc", e.target.value)}/>
                    </Field>
                    <Field label="Harga">
                      <input type="number" min="0" style={inputStyle()} value={a.price} onChange={e=>updateAddon(i, "price", e.target.value)}/>
                    </Field>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Action Bar Bawah */}
      <div style={{ position:"sticky", bottom:0, background:WHITE, padding:"1rem", borderRadius:10, border:`1px solid ${BORDER}`, display:"flex", justifyContent:"flex-end", gap:".75rem" }}>
        <button onClick={onCancel} disabled={saving} style={{ background:WHITE, color:DARK, border:`1.5px solid ${BORDER}`, padding:".7rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Batal</button>
        <button onClick={handleSave} disabled={saving} style={{ background:saving?MUTED:ACCENT, color:WHITE, border:"none", padding:".7rem 2rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?"wait":"pointer", fontFamily:"inherit" }}>
          {saving ? "Menyimpan..." : (isEdit ? "💾 Update Jasa" : "✓ Buat Jasa")}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Users Page                                              */
/* ──────────────────────────────────────────────────────── */

function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    try { setUsers(await adminAPI.listPelanggan()); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner/>;
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Pelanggan</h1>
          <p style={{ color:MUTED, fontSize:13 }}>{users.length} pelanggan terdaftar.</p>
        </div>
        <button onClick={load} style={{ background:WHITE, color:ACCENT, border:`1.5px solid ${ACCENT_L}`, padding:".5rem 1rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🔄 Refresh</button>
      </div>
      {error && <div style={{ marginBottom:"1rem" }}><ErrorMsg msg={error} onRetry={load}/></div>}
      <Card style={{ padding:0 }}>
        <Table
          cols={[
            { key:"id",         label:"ID",   nowrap:true },
            { key:"nama",       label:"Nama", render:(v,r)=>(<div><div style={{ fontWeight:700 }}>{v}</div><div style={{ fontSize:11, color:MUTED }}>{r.email}</div></div>) },
            { key:"no_telp",    label:"Telepon", nowrap:true },
            { key:"perusahaan", label:"Perusahaan" },
            { key:"total_pesanan", label:"Pesanan", nowrap:true, render:(v)=> <strong>{v||0}</strong> },
            { key:"bergabung",  label:"Bergabung", nowrap:true, render:(v)=> v ? new Date(v).toLocaleDateString("id-ID") : "-" },
          ]}
          rows={users}
          keyFn={r=>r.id}
        />
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Reports Page                                            */
/* ──────────────────────────────────────────────────────── */

function ReportsPage() {
  const [data,   setData]   = useState(null);
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState("");
  const [dari,   setDari]   = useState("");
  const [sampai, setSampai] = useState("");

  const load = useCallback(async () => {
    try { setData(await adminAPI.laporan(dari, sampai)); setError(""); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [dari, sampai]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:"1rem" }}>Laporan</h1>
      <Card style={{ marginBottom:"1rem" }}>
        <div style={{ display:"flex", gap:"1rem", alignItems:"flex-end", flexWrap:"wrap" }}>
          <Field label="DARI TANGGAL"><input type="date" style={inputStyle()} value={dari} onChange={e=>setDari(e.target.value)}/></Field>
          <Field label="SAMPAI TANGGAL"><input type="date" style={inputStyle()} value={sampai} onChange={e=>setSampai(e.target.value)}/></Field>
          <button onClick={load} style={{ background:ACCENT, color:WHITE, border:"none", padding:".65rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Tampilkan</button>
        </div>
      </Card>

      {error && <div style={{ marginBottom:"1rem" }}><ErrorMsg msg={error} onRetry={load}/></div>}
      {loading ? <Spinner/> : data && (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"1rem", marginBottom:"1rem" }}>
            <StatCard icon="📋" label="Total Pesanan"     value={data.rekap.total_pesanan}/>
            <StatCard icon="💰" label="Total Pendapatan"  value={fmt(data.rekap.total_pendapatan)}    bg={SUCCESS_L}/>
            <StatCard icon="✅" label="Pendapatan Lunas"  value={fmt(data.rekap.pendapatan_lunas)}    bg={SUCCESS_L}/>
            <StatCard icon="⏳" label="Pendapatan Pending"value={fmt(data.rekap.pendapatan_menunggu)} bg={WARNING_L}/>
          </div>
          <Card style={{ padding:0 }}>
            <Table
              cols={[
                { key:"kode_pemesanan", label:"Kode",    nowrap:true, render:v=> <span style={{ fontFamily:"monospace", color:ACCENT, fontWeight:700 }}>{v}</span> },
                { key:"tanggal",        label:"Tanggal", nowrap:true, render:v=> v ? new Date(v).toLocaleDateString("id-ID") : "-" },
                { key:"pelanggan",      label:"Pelanggan" },
                { key:"perusahaan",     label:"Perusahaan" },
                { key:"jasa",           label:"Layanan", render:v=> Array.isArray(v) ? v.join(", ") : v },
                { key:"total",          label:"Total",  nowrap:true, render:v=> <strong>{fmt(v)}</strong> },
                { key:"status",         label:"Status", render:v=> <StatusBadge status={v}/> },
                { key:"status_bayar",   label:"Bayar",  render:v=> <StatusBadge status={v==="success"?"selesai":"menunggu"}/> },
              ]}
              rows={data.pesanan}
              keyFn={r=>r.kode_pemesanan}
            />
          </Card>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Profile Page (Admin)                                    */
/*  Admin hanya bisa edit nama, email, no_telp + ganti pwd  */
/*  TIDAK ada alamat & perusahaan (itu milik pelanggan)     */
/* ──────────────────────────────────────────────────────── */

function AdminProfilePage({ user, onProfileUpdate, onLogout, showToast }) {
  const [form, setForm] = useState({
    nama:    user.name    || user.nama || "",
    email:   user.email   || "",
    no_telp: (user.phone && user.phone !== "-") ? user.phone : (user.no_telp || ""),
  });
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [saving,    setSaving]    = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);

  // Sinkronkan form ketika user prop berubah
  useEffect(() => {
    setForm({
      nama:    user.name    || user.nama || "",
      email:   user.email   || "",
      no_telp: (user.phone && user.phone !== "-") ? user.phone : (user.no_telp || ""),
    });
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await authAPI.updateProfile({
        nama:    form.nama,
        email:   form.email,
        no_telp: form.no_telp,
        // Sengaja TIDAK kirim alamat/perusahaan — admin bukan pelanggan
      });
      if (onProfileUpdate) onProfileUpdate(updated);
      showToast({ type: "success", msg: "Profil admin diperbarui!" });
    } catch (e) {
      const msg = e.errors
        ? Object.values(e.errors).flat().join(", ")
        : (e.message || "Gagal menyimpan profil");
      showToast({ type: "error", msg });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      showToast({ type: "error", msg: "Konfirmasi password baru tidak cocok" });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      showToast({ type: "error", msg: "Password baru minimal 6 karakter" });
      return;
    }
    setPwdSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast({ type: "success", msg: "Password berhasil diubah!" });
    } catch (e) {
      showToast({ type: "error", msg: e.message || "Gagal mengubah password" });
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Profil Admin</h1>
        <p style={{ color:MUTED, fontSize:13 }}>Kelola informasi akun super admin Anda.</p>
      </div>

      {/* Profile Card */}
      <Card style={{ marginBottom:"1rem", padding:0, overflow:"hidden" }}>
        <div style={{ height:120, background:`linear-gradient(135deg,${ACCENT} 0%,#23d5ab 100%)`, position:"relative" }}>
          <div style={{ position:"absolute", bottom:-32, left:"2rem", width:72, height:72, borderRadius:"50%", background:ACCENT, border:`4px solid ${WHITE}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:900, color:WHITE }}>
            {user.avatar || (user.name?.[0] || "A").toUpperCase()}
          </div>
          <div style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,.2)", backdropFilter:"blur(6px)", color:WHITE, fontSize:11, fontWeight:700, padding:".25rem .8rem", borderRadius:100, border:"1px solid rgba(255,255,255,.3)" }}>
            ⭐ {user.role_level || "ADMIN"}
          </div>
        </div>
        <div style={{ padding:"2.75rem 2rem 1.75rem" }}>
          <h3 style={{ fontWeight:800, fontSize:"1.2rem", color:DARK, marginBottom:".25rem" }}>{user.name}</h3>
          <p style={{ color:MUTED, fontSize:13, marginBottom:"1.5rem" }}>✉️ {user.email}</p>

          <SectionTitle>📝 Informasi Akun</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
            <Field label="NAMA LENGKAP">
              <input style={inputStyle()} value={form.nama} onChange={e=>setForm({...form, nama: e.target.value})} placeholder="Nama lengkap"/>
            </Field>
            <Field label="EMAIL">
              <input type="email" style={inputStyle()} value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="email@ima.test"/>
            </Field>
            <Field label="NOMOR TELEPON" full>
              <input type="tel" style={inputStyle()} value={form.no_telp} onChange={e=>setForm({...form, no_telp: e.target.value})} placeholder="081234567890"/>
            </Field>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={{ marginTop:"1.25rem", background:saving?MUTED:ACCENT, color:WHITE, border:"none", padding:".7rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?"wait":"pointer", fontFamily:"inherit" }}>
            {saving ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </div>
      </Card>

      {/* Change Password Card */}
      <Card style={{ marginBottom:"1rem" }}>
        <SectionTitle>🔐 Ubah Password</SectionTitle>
        <p style={{ color:MUTED, fontSize:12, marginBottom:"1rem", marginTop:"-0.75rem" }}>
          Untuk menjaga keamanan akun super admin, gunakan password yang kuat dan ganti secara berkala.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
          <Field label="PASSWORD SAAT INI">
            <input type="password" style={inputStyle()} value={pwdForm.currentPassword} onChange={e=>setPwdForm({...pwdForm, currentPassword: e.target.value})}/>
          </Field>
          <Field label="PASSWORD BARU">
            <input type="password" style={inputStyle()} value={pwdForm.newPassword} onChange={e=>setPwdForm({...pwdForm, newPassword: e.target.value})}/>
          </Field>
          <Field label="KONFIRMASI PASSWORD BARU">
            <input type="password" style={inputStyle()} value={pwdForm.confirmPassword} onChange={e=>setPwdForm({...pwdForm, confirmPassword: e.target.value})}/>
          </Field>
        </div>
        <button
          onClick={handleChangePassword}
          disabled={pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword}
          style={{ marginTop:"1.25rem", background:(pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword)?"#D1D9EF":ACCENT, color:WHITE, border:"none", padding:".7rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:(pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword)?"not-allowed":"pointer", fontFamily:"inherit" }}>
          {pwdSaving ? "Memproses..." : "🔒 Ubah Password"}
        </button>
      </Card>

      {/* Danger Zone */}
      <Card style={{ background:DANGER_L, border:`1px solid ${DANGER}33` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <h4 style={{ fontWeight:700, fontSize:14, color:DANGER, marginBottom:".25rem" }}>Keluar dari Akun Admin</h4>
            <p style={{ fontSize:12, color:MUTED }}>Anda akan diarahkan kembali ke halaman login admin.</p>
          </div>
          <button onClick={onLogout} style={{ background:DANGER, color:WHITE, border:"none", padding:".65rem 1.4rem", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            🚪 Logout
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  JadwalPage — Atur Tanggal Tidak Tersedia per Jasa       */
/* ──────────────────────────────────────────────────────── */

function JadwalPage({ showToast }) {
  const [services, setServices] = useState([]);
  const [selectedJasa, setSelectedJasa] = useState(null);
  const [blocked, setBlocked] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [bulan, setBulan] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });

  // Load services
  useEffect(() => {
    jasaAPI.getAllAdmin()
      .then(d => { setServices(d || []); if ((d || []).length > 0) setSelectedJasa(d[0]); })
      .catch(e => showToast({ type:"error", msg: e.message }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load blocked dates ketika jasa atau bulan berubah
  const loadBlocked = useCallback(async () => {
    if (!selectedJasa) return;
    try {
      const id = selectedJasa.id_jasa || selectedJasa.id;
      const blockedList = await adminAPI.listBlockedDates(id);
      setBlocked(blockedList);
      // Juga ambil booked dates dari endpoint publik
      const jadwalData = await jadwalAPI.check(id, bulan);
      setBookedDates(jadwalData?.booked_dates || []);
    } catch (e) {
      showToast({ type:"error", msg: e.message });
    }
  }, [selectedJasa, bulan, showToast]);

  useEffect(() => { loadBlocked(); }, [loadBlocked]);

  const handleAddBlock = async () => {
    if (!newDate || !selectedJasa) return;
    setAdding(true);
    try {
      const id = selectedJasa.id_jasa || selectedJasa.id;
      await adminAPI.blockDate(id, { tanggal: newDate, alasan: newReason || "Tidak tersedia" });
      showToast({ type:"success", msg:"Tanggal berhasil di-block" });
      setNewDate(""); setNewReason("");
      loadBlocked();
    } catch (e) {
      showToast({ type:"error", msg: e.message });
    } finally {
      setAdding(false);
    }
  };

  const handleUnblock = async (idBlocked) => {
    if (!window.confirm("Yakin buka block tanggal ini?")) return;
    try {
      await adminAPI.unblockDate(idBlocked);
      showToast({ type:"success", msg:"Tanggal kembali tersedia" });
      loadBlocked();
    } catch (e) {
      showToast({ type:"error", msg: e.message });
    }
  };

  // Build calendar untuk bulan terpilih
  const renderCalendar = () => {
    if (!selectedJasa) return null;
    const [year, monthStr] = bulan.split("-");
    const month = Number(monthStr) - 1;
    const yearNum = Number(year);
    const firstDay = new Date(yearNum, month, 1).getDay();
    const daysInMonth = new Date(yearNum, month+1, 0).getDate();
    const today = new Date();
    const isPast = (d) => new Date(yearNum, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const blockedDates = new Set(blocked.map(b => b.tanggal));
    const bookedSet = new Set(bookedDates.map(b => b.tanggal));
    const monthName = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][month];

    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
          <button onClick={() => {
            const d = new Date(yearNum, month - 1, 1);
            setBulan(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
          }} style={{ background:WHITE, border:`1.5px solid ${BORDER}`, padding:".4rem .8rem", borderRadius:8, fontSize:13, cursor:"pointer" }}>‹ Bulan Lalu</button>
          <strong style={{ fontSize:16, color:DARK }}>{monthName} {yearNum}</strong>
          <button onClick={() => {
            const d = new Date(yearNum, month + 1, 1);
            setBulan(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
          }} style={{ background:WHITE, border:`1.5px solid ${BORDER}`, padding:".4rem .8rem", borderRadius:8, fontSize:13, cursor:"pointer" }}>Bulan Depan ›</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
          {["Min","Sen","Sel","Rab","Kam","Jum","Sab"].map(d => (
            <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:MUTED, padding:".3rem 0" }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {Array(firstDay).fill(null).map((_,i)=><div key={"e"+i}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const d = i+1;
            const dateStr = `${yearNum}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
            const past = isPast(d);
            const isBlocked = blockedDates.has(dateStr);
            const isBooked = bookedSet.has(dateStr);
            let bg = past ? "#F1F5F9" : WHITE;
            let color = past ? "#CBD5E1" : DARK;
            let label = "";
            if (isBlocked) { bg = "#FEE2E2"; color = "#991B1B"; label = "🚫"; }
            else if (isBooked) { bg = "#FEF3C7"; color = "#92400E"; label = "📋"; }
            return (
              <button
                key={d}
                disabled={past || isBooked}
                onClick={() => {
                  if (past || isBooked) return;
                  if (isBlocked) {
                    const item = blocked.find(b => b.tanggal === dateStr);
                    if (item) handleUnblock(item.id_blocked);
                  } else {
                    setNewDate(dateStr);
                  }
                }}
                style={{ aspectRatio:"1", background:bg, color, border:`1px solid ${BORDER}`, borderRadius:6, fontSize:12, fontWeight:600, cursor:(past||isBooked)?"not-allowed":"pointer", position:"relative", padding:0, fontFamily:"inherit" }}
                title={isBlocked ? "Klik untuk buka block" : isBooked ? "Sudah dipesan pelanggan" : "Klik untuk block"}>
                {d}
                {label && <div style={{ position:"absolute", bottom:1, right:1, fontSize:10 }}>{label}</div>}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:"1rem", marginTop:"1rem", paddingTop:"1rem", borderTop:`1px solid ${BORDER}`, flexWrap:"wrap", fontSize:12 }}>
          <span style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:14, height:14, background:"#FEE2E2", border:`1px solid #991B1B`, borderRadius:3 }}/> Di-block admin
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:14, height:14, background:"#FEF3C7", border:`1px solid #92400E`, borderRadius:3 }}/> Sudah dipesan
          </span>
          <span style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:14, height:14, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:3 }}/> Tersedia
          </span>
        </div>
      </div>
    );
  };

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Jadwal & Ketersediaan Jasa</h1>
        <p style={{ color:MUTED, fontSize:13 }}>Atur tanggal yang tidak tersedia untuk masing-masing jasa. Tanggal yang sudah dipesan otomatis ditandai.</p>
      </div>

      {services.length === 0 ? (
        <Card style={{ textAlign:"center", padding:"3rem" }}>
          <div style={{ fontSize:48, marginBottom:"1rem" }}>📦</div>
          <p style={{ color:MUTED }}>Belum ada jasa terdaftar. Tambah jasa di menu Jasa terlebih dahulu.</p>
        </Card>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:"1rem" }}>
          {/* List Jasa */}
          <Card style={{ padding:"1rem .5rem" }}>
            <p style={{ fontSize:11, fontWeight:700, color:MUTED, padding:"0 .75rem", marginBottom:".5rem" }}>PILIH JASA</p>
            {services.map(svc => {
              const id = svc.id_jasa || svc.id;
              const isSelected = selectedJasa && (selectedJasa.id_jasa === id || selectedJasa.id === id);
              return (
                <button key={id} onClick={() => setSelectedJasa(svc)}
                  style={{ width:"100%", textAlign:"left", padding:".7rem .85rem", marginBottom:4, background:isSelected?ACCENT_L:"transparent", color:isSelected?ACCENT:DARK, border:"none", borderRadius:8, fontSize:13, fontWeight:isSelected?700:500, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:18 }}>{svc.emoji || svc.icon || "🎬"}</span>
                  <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{svc.nama_jasa || svc.title}</span>
                </button>
              );
            })}
          </Card>

          {/* Calendar + Form */}
          <div>
            <Card style={{ marginBottom:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", flexWrap:"wrap", gap:"1rem" }}>
                <div>
                  <h3 style={{ fontWeight:700, fontSize:15, color:DARK }}>Kalender: {selectedJasa?.nama_jasa || selectedJasa?.title}</h3>
                  <p style={{ fontSize:12, color:MUTED, marginTop:2 }}>Klik tanggal kosong untuk block, klik tanggal merah untuk buka block</p>
                </div>
              </div>
              {renderCalendar()}
            </Card>

            {/* Form Block Manual */}
            <Card>
              <SectionTitle>➕ Block Tanggal Manual</SectionTitle>
              <div style={{ display:"grid", gridTemplateColumns:"180px 1fr 120px", gap:"1rem", alignItems:"flex-end" }}>
                <Field label="TANGGAL">
                  <input type="date" min={new Date().toISOString().split('T')[0]} style={inputStyle()} value={newDate} onChange={e=>setNewDate(e.target.value)}/>
                </Field>
                <Field label="ALASAN (OPSIONAL)">
                  <input style={inputStyle()} value={newReason} onChange={e=>setNewReason(e.target.value)} placeholder="Maintenance / Tim Cuti / dll"/>
                </Field>
                <button onClick={handleAddBlock} disabled={!newDate || adding} style={{ background:(!newDate || adding)?MUTED:DANGER, color:WHITE, border:"none", padding:".7rem 1rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:(!newDate || adding)?"not-allowed":"pointer", fontFamily:"inherit" }}>
                  {adding ? "Memblokir..." : "🚫 Block"}
                </button>
              </div>
            </Card>

            {/* List Blocked */}
            {blocked.length > 0 && (
              <Card style={{ marginTop:"1rem" }}>
                <SectionTitle>📋 Daftar Tanggal Di-block ({blocked.length})</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {blocked.map(b => (
                    <div key={b.id_blocked} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:".7rem 1rem", background:"#FEE2E2", borderRadius:8, border:"1px solid #FECACA" }}>
                      <div>
                        <strong style={{ color:"#991B1B", fontSize:13 }}>{b.tanggal}</strong>
                        <span style={{ color:MUTED, fontSize:12, marginLeft:8 }}>· {b.alasan || "Tidak tersedia"}</span>
                        {b.admin && <span style={{ color:MUTED, fontSize:11, marginLeft:8 }}>oleh {b.admin}</span>}
                      </div>
                      <button onClick={()=>handleUnblock(b.id_blocked)} style={{ background:WHITE, color:"#991B1B", border:"1px solid #FCA5A5", padding:".35rem .8rem", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Buka Block</button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  PortofolioAdminPage — CRUD Portofolio                   */
/* ──────────────────────────────────────────────────────── */

const EMPTY_PORTO = {
  judul:"", deskripsi:"", kategori:"Umum", klien:"",
  tanggal_proyek:"", icon:"🎬", img_bg:"linear-gradient(135deg,#1a2a6c,#1B4FD8 60%,#23d5ab)",
  tag:"PROJECT", tag_color:"#1B4FD8", is_featured:false, urutan:0,
};

function PortofolioAdminPage({ showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | item

  const load = useCallback(() => {
    setLoading(true);
    portofolioAPI.getAll().then(d => setItems(d || []))
      .catch(e => showToast({ type:"error", msg: e.message }))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, judul) => {
    if (!window.confirm(`Hapus portofolio "${judul}"?`)) return;
    try {
      await adminAPI.deletePortofolio(id);
      showToast({ type:"success", msg:"Portofolio dihapus" });
      load();
    } catch (e) { showToast({ type:"error", msg:e.message }); }
  };

  if (loading) return <Spinner/>;

  if (editing) {
    return <PortofolioForm
      initial={editing === "new" ? EMPTY_PORTO : editing}
      onCancel={() => setEditing(null)}
      onSaved={() => { load(); setEditing(null); }}
      showToast={showToast}
    />;
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Manajemen Portofolio</h1>
          <p style={{ color:MUTED, fontSize:13 }}>{items.length} portofolio terdaftar. Centang "Tampilkan di Beranda" untuk menampilkan di preview homepage.</p>
        </div>
        <button onClick={() => setEditing("new")} style={{ background:ACCENT, color:WHITE, border:"none", padding:".55rem 1.25rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Tambah Portofolio</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1rem" }}>
        {items.map(p => (
          <Card key={p.id_portofolio} style={{ padding:0, overflow:"hidden" }}>
            <div style={{ height:120, background:p.img_bg || p.imgBg || "linear-gradient(135deg,#1B4FD8,#23d5ab)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, position:"relative", overflow:"hidden" }}>
              {p.gambar_url ? (
                <img
                  src={p.gambar_url}
                  alt={p.judul}
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <span style={{ position:"relative", zIndex:1 }}>{p.icon}</span>
              )}
              {p.is_featured && <div style={{ position:"absolute", top:10, right:10, background:YELLOW, color:"#1C1200", fontSize:10, fontWeight:800, padding:".2rem .6rem", borderRadius:100, zIndex:2 }}>⭐ BERANDA</div>}
              <div style={{ position:"absolute", top:10, left:10, background:"rgba(255,255,255,.2)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.3)", color:WHITE, fontSize:10, fontWeight:700, padding:".2rem .6rem", borderRadius:100, zIndex:2 }}>{p.tag}</div>
            </div>
            <div style={{ padding:"1.1rem 1.25rem" }}>
              <h3 style={{ fontWeight:800, fontSize:14, color:DARK, marginBottom:4 }}>{p.judul}</h3>
              <p style={{ fontSize:12, color:MUTED, marginBottom:".5rem" }}>{p.kategori}{p.klien ? ` · ${p.klien}` : ""}</p>
              {p.deskripsi && <p style={{ fontSize:12, color:MUTED, lineHeight:1.5, marginBottom:".75rem", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.deskripsi}</p>}
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => setEditing(p)} style={{ flex:1, background:ACCENT_L, color:ACCENT, border:"none", padding:".45rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✏️ Edit</button>
                <button onClick={() => handleDelete(p.id_portofolio, p.judul)} style={{ background:DANGER_L, color:DANGER, border:"none", padding:".45rem .65rem", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>🗑️</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card style={{ textAlign:"center", padding:"3rem" }}>
          <div style={{ fontSize:48, marginBottom:"1rem" }}>🖼️</div>
          <h3 style={{ fontWeight:700, color:DARK, marginBottom:".5rem" }}>Belum ada portofolio</h3>
          <button onClick={()=>setEditing("new")} style={{ marginTop:"1rem", background:ACCENT, color:WHITE, border:"none", padding:".7rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Tambah Portofolio</button>
        </Card>
      )}
    </div>
  );
}

function PortofolioForm({ initial, onCancel, onSaved, showToast }) {
  const isEdit = !!initial.id_portofolio;
  const [form, setForm] = useState({
    judul: initial.judul || "",
    deskripsi: initial.deskripsi || "",
    kategori: initial.kategori || "Umum",
    klien: initial.klien || "",
    tanggal_proyek: initial.tanggal_proyek || "",
    icon: initial.icon || "🎬",
    img_bg: initial.img_bg || initial.imgBg || BG_PRESETS[0],
    gambar: initial.gambar || null,            // ← BARU: path file dari server
    gambar_url: initial.gambar_url || null,    // ← BARU: URL siap pakai utk preview
    tag: initial.tag || "PROJECT",
    tag_color: initial.tag_color || initial.tagColor || "#1B4FD8",
    is_featured: !!initial.is_featured,
    urutan: Number(initial.urutan || 0),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.judul) { showToast({ type:"error", msg:"Judul wajib diisi" }); return; }
    setSaving(true);
    try {
      // Exclude gambar_url dari payload — backend tidak butuh field itu
      // (cuma dipakai di frontend untuk preview). Backend hanya simpan `gambar` (path).
      const { gambar_url, ...rest } = form;
      const payload = { ...rest, urutan: Number(form.urutan) };

      if (isEdit) await adminAPI.updatePortofolio(initial.id_portofolio, payload);
      else await adminAPI.createPortofolio(payload);
      showToast({ type:"success", msg: isEdit ? "Portofolio diupdate" : "Portofolio dibuat" });
      onSaved();
    } catch (e) {
      const msg = e.errors ? Object.values(e.errors).flat().join(", ") : e.message;
      showToast({ type:"error", msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem" }}>
        <div>
          <button onClick={onCancel} style={{ background:"none", border:"none", color:MUTED, fontSize:13, cursor:"pointer", marginBottom:".4rem", padding:0 }}>← Kembali</button>
          <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:DARK }}>{isEdit ? `Edit: ${form.judul}` : "Tambah Portofolio"}</h1>
        </div>
        <div style={{ display:"flex", gap:".5rem" }}>
          <button onClick={onCancel} style={{ background:WHITE, color:DARK, border:`1.5px solid ${BORDER}`, padding:".55rem 1.2rem", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Batal</button>
          <button onClick={handleSave} disabled={saving} style={{ background:saving?MUTED:ACCENT, color:WHITE, border:"none", padding:".55rem 1.5rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?"wait":"pointer", fontFamily:"inherit" }}>
            {saving ? "Menyimpan..." : (isEdit ? "💾 Update" : "✓ Buat")}
          </button>
        </div>
      </div>

      <Card style={{ marginBottom:"1rem" }}>
        <SectionTitle>📝 Informasi Proyek</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
          <Field label="JUDUL *" full>
            <input style={inputStyle()} value={form.judul} onChange={e=>setForm({...form, judul: e.target.value})}/>
          </Field>
          <Field label="DESKRIPSI" full>
            <textarea rows={3} style={{ ...inputStyle(), resize:"vertical", fontFamily:"inherit" }} value={form.deskripsi} onChange={e=>setForm({...form, deskripsi: e.target.value})}/>
          </Field>
          <Field label="KATEGORI">
            <input style={inputStyle()} value={form.kategori} onChange={e=>setForm({...form, kategori: e.target.value})} placeholder="Live Streaming"/>
          </Field>
          <Field label="KLIEN">
            <input style={inputStyle()} value={form.klien} onChange={e=>setForm({...form, klien: e.target.value})} placeholder="PT XYZ Indonesia"/>
          </Field>
          <Field label="TANGGAL PROYEK">
            <input type="date" style={inputStyle()} value={form.tanggal_proyek} onChange={e=>setForm({...form, tanggal_proyek: e.target.value})}/>
          </Field>
          <Field label="URUTAN TAMPIL">
            <input type="number" style={inputStyle()} value={form.urutan} onChange={e=>setForm({...form, urutan: e.target.value})}/>
          </Field>
        </div>
      </Card>

      <Card style={{ marginBottom:"1rem" }}>
        <SectionTitle>🎨 Tampilan</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem", marginBottom:"1rem" }}>
          <Field label="ICON/EMOJI">
            <input style={inputStyle()} value={form.icon} onChange={e=>setForm({...form, icon: e.target.value})} maxLength={4}/>
          </Field>
          <Field label="TAG">
            <input style={inputStyle()} value={form.tag} onChange={e=>setForm({...form, tag: e.target.value})} placeholder="BROADCASTING"/>
          </Field>
          <Field label="WARNA TAG">
            <select style={inputStyle()} value={form.tag_color} onChange={e=>setForm({...form, tag_color: e.target.value})}>
              {TAG_COLORS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
        </div>

        {/* ── BARU: Upload Gambar Portofolio ──────────────────────────────────── */}
        <Field label="GAMBAR PORTOFOLIO (OPSIONAL — JIKA DIISI, AKAN MENGGANTI GRADIENT)" full>
          <ImageUploader
            value={form.gambar}
            valueUrl={form.gambar_url}
            folder="portofolio"
            onChange={(path, url) => setForm({ ...form, gambar: path, gambar_url: url })}
            onError={(msg) => showToast({ type:"error", msg })}
            height={180}
          />
          <p style={{ fontSize:11, color:MUTED, marginTop:6 }}>
            Rekomendasi rasio 16:9 atau 4:3. Maksimal 5MB.
          </p>
        </Field>
        {/* ──────────────────────────────────────────────────────────────────────── */}

        <Field label="BACKGROUND GRADIENT (DIPAKAI JIKA TIDAK ADA GAMBAR)" full>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6, marginBottom:8 }}>
            {BG_PRESETS.map((bg,i)=>(
              <div key={i} onClick={()=>setForm({...form, img_bg: bg})} style={{ height:48, background:bg, borderRadius:8, cursor:"pointer", border:`3px solid ${form.img_bg===bg ? ACCENT : "transparent"}` }}/>
            ))}
          </div>
        </Field>

        <div style={{ marginTop:"1rem", display:"flex", alignItems:"center", gap:8 }}>
          <input type="checkbox" id="featured" checked={form.is_featured} onChange={e=>setForm({...form, is_featured: e.target.checked})} style={{ width:18, height:18, accentColor:ACCENT, cursor:"pointer" }}/>
          <label htmlFor="featured" style={{ fontSize:13, color:DARK, cursor:"pointer", fontWeight:600 }}>⭐ Tampilkan di Beranda (preview portofolio homepage)</label>
        </div>

        {/* Preview — tampilkan gambar kalau ada, fallback ke icon+gradient */}
        <div style={{ marginTop:"1.25rem", height:140, background:form.img_bg, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:48, position:"relative", overflow:"hidden" }}>
          {form.gambar_url ? (
            <img src={form.gambar_url} alt="Preview" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
          ) : (
            <span style={{ position:"relative", zIndex:1 }}>{form.icon}</span>
          )}
          <div style={{ position:"absolute", top:10, left:10, background:"rgba(255,255,255,.2)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,.3)", color:WHITE, fontSize:10, fontWeight:700, padding:".2rem .6rem", borderRadius:100, zIndex:2 }}>{form.tag}</div>
          {form.is_featured && <div style={{ position:"absolute", top:10, right:10, background:YELLOW, color:"#1C1200", fontSize:10, fontWeight:800, padding:".2rem .6rem", borderRadius:100, zIndex:2 }}>⭐ BERANDA</div>}
        </div>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  BerandaSettingsPage — Edit konten beranda dinamis       */
/* ──────────────────────────────────────────────────────── */

function BerandaSettingsPage({ showToast }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    pengaturanAPI.getAll("beranda").then(d => { setSettings(d || {}); setLoading(false); })
      .catch(e => { showToast({ type:"error", msg: e.message }); setLoading(false); });
  }, [showToast]);

  const update = (kunci, nilai) => setSettings(s => ({ ...s, [kunci]: nilai }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Filter: skip key yang berakhiran `_url` (kunci yang di-inject backend
      // untuk URL siap pakai, mis. hero_image_url). Kunci-kunci ini cuma
      // dipakai frontend untuk preview, BUKAN data yang disimpan ke DB.
      const items = Object.keys(settings)
        .filter(k => !k.endsWith("_url"))
        .map(kunci => ({
          kunci,
          nilai: settings[kunci] ?? "",
          grup:  "beranda",
          tipe:  (settings[kunci] || "").length > 80 ? "longtext" : "text",
        }));
      await adminAPI.updatePengaturan(items);
      showToast({ type:"success", msg:"Konten beranda diperbarui" });
    } catch (e) { showToast({ type:"error", msg: e.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner/>;

  // Field config dengan label-label yang user-friendly
  const sections = [
    { title:"Hero Section (atas halaman)", fields:[
      { key:"hero_label",    label:"Label kecil (caps)", isLong:false },
      { key:"hero_title",    label:"Judul utama",        isLong:true },
      { key:"hero_subtitle", label:"Deskripsi sub-judul", isLong:true },
    ]},
    { title:"Statistik (4 kotak)", fields:[
      { key:"stat_klien",      label:"Statistik #1 — Klien",         isLong:false },
      { key:"stat_proyek",     label:"Statistik #2 — Proyek",        isLong:false },
      { key:"stat_pengalaman", label:"Statistik #3 — Pengalaman",    isLong:false },
      { key:"stat_kota",       label:"Statistik #4 — Kota",          isLong:false },
    ]},
    { title:"Tentang Kami", fields:[
      { key:"about_title",  label:"Judul About",     isLong:false },
      { key:"about_text_1", label:"Paragraf 1",      isLong:true },
      { key:"about_text_2", label:"Paragraf 2",      isLong:true },
    ]},
    { title:"Director Quote", fields:[
      { key:"director_quote", label:"Quote Direktur",   isLong:true },
      { key:"director_name",  label:"Nama Direktur",    isLong:false },
    ]},
    { title:"Kontak", fields:[
      { key:"kontak_email",  label:"Email Kontak",   isLong:false },
      { key:"kontak_telp",   label:"Nomor Telepon",  isLong:false },
      { key:"kontak_alamat", label:"Alamat",         isLong:false },
    ]},
  ];

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontSize:"1.7rem", fontWeight:800, color:DARK, marginBottom:".3rem" }}>Konten Beranda</h1>
          <p style={{ color:MUTED, fontSize:13 }}>Edit teks yang tampil di halaman utama pelanggan. Perubahan langsung terlihat setelah Save.</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ background:saving?MUTED:ACCENT, color:WHITE, border:"none", padding:".7rem 1.75rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?"wait":"pointer", fontFamily:"inherit" }}>
          {saving ? "Menyimpan..." : "💾 Simpan Semua"}
        </button>
      </div>

      {/* ── BARU: Gambar Hero (banner atas beranda) ──────────────────── */}
      <Card style={{ marginBottom:"1rem" }}>
        <SectionTitle>🖼️ Gambar Hero (Banner Atas Beranda)</SectionTitle>
        <p style={{ fontSize:12, color:MUTED, marginBottom:"1rem", marginTop:"-.5rem" }}>
          Gambar besar yang tampil di bagian paling atas halaman beranda. Kosongkan jika ingin pakai default (gradient).
        </p>
        <ImageUploader
          value={settings.hero_image || null}
          valueUrl={settings.hero_image_url || null}
          folder="hero"
          onChange={(path, url) => {
            setSettings(s => ({
              ...s,
              hero_image:     path || "",
              hero_image_url: url  || "",
            }));
          }}
          onError={(msg) => showToast({ type:"error", msg })}
          height={220}
        />
        <p style={{ fontSize:11, color:MUTED, marginTop:8 }}>
          💡 Rekomendasi: gambar landscape rasio 16:9, resolusi minimal 1600x900px. Maksimal 5MB.
          Setelah upload, klik "💾 Simpan Semua" agar gambar tersimpan ke beranda.
        </p>
      </Card>
      {/* ───────────────────────────────────────────────────────────────── */}

      {sections.map(section => (
        <Card key={section.title} style={{ marginBottom:"1rem" }}>
          <SectionTitle>{section.title}</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:section.fields.length > 2 ? "1fr 1fr" : "1fr", gap:"1rem" }}>
            {section.fields.map(f => (
              <Field key={f.key} label={f.label.toUpperCase()} full={f.isLong || section.fields.length <= 2}>
                {f.isLong ? (
                  <textarea rows={3} style={{ ...inputStyle(), resize:"vertical", fontFamily:"inherit" }} value={settings[f.key] || ""} onChange={e=>update(f.key, e.target.value)}/>
                ) : (
                  <input style={inputStyle()} value={settings[f.key] || ""} onChange={e=>update(f.key, e.target.value)}/>
                )}
              </Field>
            ))}
          </div>
        </Card>
      ))}

      <div style={{ position:"sticky", bottom:0, background:WHITE, padding:"1rem", borderRadius:10, border:`1px solid ${BORDER}`, display:"flex", justifyContent:"flex-end", gap:".75rem" }}>
        <button onClick={handleSave} disabled={saving} style={{ background:saving?MUTED:ACCENT, color:WHITE, border:"none", padding:".7rem 2rem", borderRadius:8, fontSize:13, fontWeight:700, cursor:saving?"wait":"pointer", fontFamily:"inherit" }}>
          {saving ? "Menyimpan..." : "💾 Simpan Semua Perubahan"}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── */
/*  Main AdminApp                                           */
/* ──────────────────────────────────────────────────────── */

export default function AdminApp() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState("dashboard");
  const [toast,   setToast]   = useState(null);

  // Auto-login saat refresh
  useEffect(() => {
    const init = async () => {
      if (getToken()) {
        try {
          const u = await authAPI.me();
          if (u.is_admin) setUser(u);
        } catch { /* token invalid → fall through */ }
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
    setPage("dashboard");
  };

  const handleProfileUpdate = useCallback((updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  }, []);

  const showToast = useCallback((t) => setToast(t), []);

  // Inject font + animation CSS
  useEffect(() => {
    const id = "ima-admin-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    const css = "ima-admin-css";
    if (!document.getElementById(css)) {
      const s = document.createElement("style");
      s.id = css;
      s.textContent = `
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;margin:0;padding:0;}
        #root{width:100%;min-height:100vh;}
        @keyframes slideUp {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
        input:focus,select:focus,textarea:focus{border-color:${ACCENT}!important;}
      `;
      document.head.appendChild(s);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:BG, fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:48, height:48, background:ACCENT, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:WHITE, margin:"0 auto 1rem" }}>IMA</div>
          <p style={{ color:MUTED, fontSize:13 }}>Memuat admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onSuccess={setUser}/>;
  }

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"'DM Sans',sans-serif" }}>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
      <Sidebar active={page} onChange={setPage} onLogout={handleLogout} user={user}/>
      <main style={{ marginLeft:SIDEBAR_W, padding:"2rem 2.5rem", minHeight:"100vh" }}>
        {page === "dashboard"  && <DashboardPage/>}
        {page === "orders"     && <OrdersPage   showToast={showToast}/>}
        {page === "services"   && <ServicesPage showToast={showToast}/>}
        {page === "jadwal"     && <JadwalPage   showToast={showToast}/>}
        {page === "portofolio" && <PortofolioAdminPage showToast={showToast}/>}
        {page === "beranda"    && <BerandaSettingsPage showToast={showToast}/>}
        {page === "users"      && <UsersPage/>}
        {page === "reports"    && <ReportsPage/>}
        {page === "profile"    && <AdminProfilePage user={user} onProfileUpdate={handleProfileUpdate} onLogout={handleLogout} showToast={showToast}/>}
      </main>
    </div>
  );
}