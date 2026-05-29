import { useState, useEffect } from "react";
import { BLUE, BLUE_L, BLUE_M, BG, WHITE, DARK, MUTED } from "../constants/colors";
import { fmt } from "../constants/data";
import { STATUS_DISPLAY, getDisplayStatus } from "../constants/status";
import { authAPI } from "../services/api";
import Navbar from "../components/layout/Navbar";
import Anim from "../components/ui/Anim";

export default function ProfilePage({
  user, onProfileUpdate,
  orders = [], jasaList = [],
  onBack, onGoJasa, onGoPemesanan, onGoPortfolio,
  onLogout, onLogin, onRegister,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [pwdSaving,setPwdSaving]= useState(false);
  const [toast,    setToast]    = useState(null);

  const [form, setForm] = useState({
    name:    user.name    || "",
    email:   user.email   || "",
    phone:   (user.phone && user.phone !== "-") ? user.phone : "",
    company: user.company || "",
    alamat:  user.alamat  || "",
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    setForm({
      name:    user.name    || "",
      email:   user.email   || "",
      phone:   (user.phone && user.phone !== "-") ? user.phone : "",
      company: user.company || "",
      alamat:  user.alamat  || "",
    });
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleNav = (link) => {
    if (link === "Beranda")    { onBack(); return; }
    if (link === "Jasa")       { onGoJasa(); return; }
    if (link === "Portofolio") { onGoPortfolio(); return; }
    if (link === "Pemesanan")  { onGoPemesanan(); return; }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await authAPI.updateProfile({
        name:    form.name,
        email:   form.email,
        phone:   form.phone,
        company: form.company,
        alamat:  form.alamat,
      });
      if (onProfileUpdate) onProfileUpdate(updated);
      setEditing(false);
      setToast({ type: "success", msg: "Profil berhasil diperbarui!" });
    } catch (e) {
      const errMsg = e.errors
        ? Object.values(e.errors).flat().join(", ")
        : (e.message || "Gagal menyimpan profil");
      setToast({ type: "error", msg: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setToast({ type: "error", msg: "Konfirmasi password tidak cocok" });
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setToast({ type: "error", msg: "Password baru minimal 6 karakter" });
      return;
    }
    setPwdSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPwd(false);
      setToast({ type: "success", msg: "Password berhasil diubah!" });
    } catch (e) {
      setToast({ type: "error", msg: e.message || "Gagal mengubah password" });
    } finally {
      setPwdSaving(false);
    }
  };

  const recentOrders = (orders || []).slice(0, 3);

  return (
    <div style={{ fontFamily:"'DM Sans','Segoe UI',sans-serif", background:BG, color:DARK, minHeight:"100vh" }}>
      <Navbar activeNav="" onNav={handleNav} onLogin={onLogin} onRegister={onRegister} scrolled={scrolled} user={user} onGoProfile={()=>{}} onLogout={onLogout}/>

      {toast && (
        <div style={{
          position:"fixed", top:84, right:24, zIndex:1200,
          background: toast.type==="success" ? "#059669" : "#DC2626",
          color: WHITE, padding:".85rem 1.5rem", borderRadius:10,
          fontSize:14, fontWeight:600, boxShadow:"0 12px 28px rgba(0,0,0,.18)",
          animation:"slideUp .25s ease",
          maxWidth: "calc(100vw - 48px)",
        }}>
          {toast.type==="success" ? "✅ " : "⚠️ "}{toast.msg}
        </div>
      )}

      <div className="section-pad" style={{ maxWidth:1920, margin:"0 auto", padding:"7rem 3rem 5rem" }}>
        <Anim>
          <button onClick={onBack} style={{ display:"inline-flex",alignItems:"center",gap:8,background:"none",border:"none",color:MUTED,fontSize:14,cursor:"pointer",fontFamily:"inherit",marginBottom:"2rem" }}>← Kembali ke Beranda</button>
        </Anim>

        {/* Profile Hero Card */}
        <Anim>
          <div style={{ background:WHITE, border:"1.5px solid #E5EAF5", borderRadius:20, overflow:"hidden", marginBottom:"1.5rem" }}>
            <div style={{ height:120, background:`linear-gradient(135deg,${BLUE},${BLUE_M} 60%,#23d5ab)`, position:"relative" }}>
              <div style={{ position:"absolute",bottom:-36,left:"2rem",width:72,height:72,borderRadius:"50%",background:BLUE,border:"4px solid white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:WHITE }}>
                {user.avatar || (user.name?.[0] || "U").toUpperCase()}
              </div>
            </div>
            <div className="card-pad" style={{ padding:"2.75rem 2rem 2rem" }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem" }}>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ fontWeight:800,fontSize:"clamp(1.3rem,3vw,1.6rem)",color:DARK,marginBottom:".25rem" }}>{user.name}</h2>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <span style={{ fontSize:13,color:MUTED, wordBreak:"break-all" }}>✉️ {user.email}</span>
                    {user.company && <span style={{ fontSize:12,background:BLUE_L,color:BLUE,fontWeight:700,padding:".2rem .75rem",borderRadius:100 }}>🏢 {user.company}</span>}
                    {user.is_admin && <span style={{ fontSize:12,background:"#FEF3C7",color:"#92400E",fontWeight:700,padding:".2rem .75rem",borderRadius:100 }}>⭐ ADMIN</span>}
                  </div>
                </div>
                <button onClick={()=>setEditing(v=>!v)} disabled={saving} style={{ background:editing?BG:BLUE_L,color:editing?MUTED:BLUE,border:`1.5px solid ${editing?"#E5EAF5":BLUE}33`,padding:".55rem 1.2rem",borderRadius:8,cursor:saving?"wait":"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit" }}>
                  {editing?"Batal":"✏️ Edit Profil"}
                </button>
              </div>

              {editing ? (
                <div style={{ marginTop:"1.5rem" }}>
                  <div className="grid-2-sm" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem" }}>
                    {[
                      ["name","Nama Lengkap","text",false],
                      ["email","Email","email",false],
                      ["phone","Nomor Telepon","tel",false],
                      ["company","Perusahaan","text",false],
                      ["alamat","Alamat","text",true],
                    ].map(([k, label, type, full]) => (
                      <div key={k} style={{ gridColumn: full ? "span 2" : "span 1" }}>
                        <label style={{ display:"block",fontSize:12,fontWeight:600,color:MUTED,marginBottom:6 }}>{label}</label>
                        <input
                          type={type}
                          value={form[k]}
                          onChange={e=>setForm({...form, [k]: e.target.value})}
                          style={{ width:"100%",padding:".7rem .9rem",border:"1.5px solid #D1D9EF",borderRadius:10,fontSize:14,fontFamily:"inherit",color:DARK,outline:"none" }}
                          onFocus={e=>e.target.style.borderColor=BLUE}
                          onBlur={e=>e.target.style.borderColor="#D1D9EF"}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="btn-group" style={{ display:"flex", gap:".75rem", marginTop:"1.25rem" }}>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      style={{ background:saving?"#A0AABF":BLUE,color:WHITE,border:"none",padding:".75rem 1.5rem",borderRadius:10,cursor:saving?"wait":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit" }}>
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button
                      onClick={()=>setEditing(false)}
                      disabled={saving}
                      style={{ background:WHITE,color:DARK,border:"1.5px solid #D1D9EF",padding:".75rem 1.5rem",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14,fontFamily:"inherit" }}>
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"1rem",marginTop:"1.5rem" }}>
                  {[
                    ["📞 Telepon", user.phone || "-"],
                    ["🏢 Perusahaan", user.company || "-"],
                    ["📍 Alamat", user.alamat || "-"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background:BG,borderRadius:12,padding:"1rem 1.25rem",border:"1px solid #E5EAF5" }}>
                      <div style={{ fontSize:11,color:MUTED,marginBottom:4,fontWeight:600,letterSpacing:".05em",textTransform:"uppercase" }}>{k}</div>
                      <div style={{ fontSize:14,fontWeight:600,color:DARK, wordBreak:"break-word" }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Anim>

        {/* Change Password */}
        <Anim>
          <div className="card-pad" style={{ background:WHITE,border:"1.5px solid #E5EAF5",borderRadius:18,padding:"1.5rem 2rem",marginBottom:"1.5rem" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem" }}>
              <div>
                <h3 style={{ fontWeight:700,fontSize:16,color:DARK,marginBottom:4 }}>🔐 Keamanan Akun</h3>
                <p style={{ fontSize:13,color:MUTED }}>Ubah password untuk menjaga keamanan akun Anda.</p>
              </div>
              <button
                onClick={()=>setShowPwd(v=>!v)}
                style={{ background:showPwd?BG:BLUE_L,color:showPwd?MUTED:BLUE,border:`1.5px solid ${showPwd?"#E5EAF5":BLUE+"33"}`,padding:".5rem 1.1rem",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit" }}>
                {showPwd ? "Tutup" : "Ubah Password"}
              </button>
            </div>
            {showPwd && (
              <div style={{ marginTop:"1.5rem",paddingTop:"1.5rem",borderTop:"1px solid #F1F5F9" }}>
                <div className="grid-3" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem" }}>
                  {[
                    ["currentPassword","Password Saat Ini"],
                    ["newPassword","Password Baru"],
                    ["confirmPassword","Konfirmasi Password Baru"],
                  ].map(([k, label]) => (
                    <div key={k}>
                      <label style={{ display:"block",fontSize:12,fontWeight:600,color:MUTED,marginBottom:6 }}>{label}</label>
                      <input
                        type="password"
                        value={pwdForm[k]}
                        onChange={e=>setPwdForm({...pwdForm, [k]: e.target.value})}
                        style={{ width:"100%",padding:".7rem .9rem",border:"1.5px solid #D1D9EF",borderRadius:10,fontSize:14,fontFamily:"inherit",color:DARK,outline:"none" }}
                        onFocus={e=>e.target.style.borderColor=BLUE}
                        onBlur={e=>e.target.style.borderColor="#D1D9EF"}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={pwdSaving || !pwdForm.currentPassword || !pwdForm.newPassword}
                  style={{ marginTop:"1.25rem",background:(pwdSaving||!pwdForm.currentPassword||!pwdForm.newPassword)?"#D1D9EF":BLUE,color:WHITE,border:"none",padding:".75rem 1.5rem",borderRadius:10,cursor:(pwdSaving||!pwdForm.currentPassword||!pwdForm.newPassword)?"not-allowed":"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit", width:"100%", maxWidth:280 }}>
                  {pwdSaving ? "Memproses..." : "Simpan Password Baru"}
                </button>
              </div>
            )}
          </div>
        </Anim>

        {/* Recent Orders */}
        <Anim>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem" }}>
            <h3 style={{ fontWeight:700,fontSize:18,color:DARK }}>📋 Pesanan Terbaru</h3>
            <button onClick={onGoPemesanan} style={{ background:"none",border:"none",color:BLUE,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>Lihat Semua →</button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="card-pad" style={{ background:WHITE,borderRadius:14,padding:"2.5rem",textAlign:"center",border:"1.5px solid #E5EAF5" }}>
              <div style={{ fontSize:36, marginBottom:".75rem" }}>📭</div>
              <p style={{ fontSize:13,color:MUTED,marginBottom:"1rem" }}>Belum ada pesanan</p>
              <button onClick={onGoJasa} style={{ background:BLUE,color:WHITE,border:"none",padding:".6rem 1.4rem",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>Pesan Sekarang</button>
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:".85rem", marginBottom:"2rem" }}>
              {recentOrders.map(ord => {
                const st  = STATUS_DISPLAY[getDisplayStatus(ord)] || STATUS_DISPLAY.menunggu_pembayaran;
                const svc = jasaList.find(s => s.id === ord.svc) || jasaList.find(s => s.id_jasa === ord.svc);
                return (
                  <div key={ord.id_pemesanan || ord.id} style={{ background:WHITE,border:"1.5px solid #E5EAF5",borderRadius:14,padding:"1.1rem 1.4rem",display:"flex",alignItems:"center",gap:"1rem",flexWrap:"wrap" }}>
                    <div style={{ width:48,height:48,borderRadius:10,background:svc?.imgBg||BLUE_L,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{svc?.emoji || "📋"}</div>
                    <div style={{ flex:"1 1 200px",minWidth:0 }}>
                      <div style={{ fontWeight:700,fontSize:14,color:DARK,marginBottom:2 }}>{ord.svcName}</div>
                      <div style={{ fontSize:12,color:MUTED }}>{ord.paket} · {ord.date}</div>
                    </div>
                    <div style={{ textAlign:"right",flexShrink:0 }}>
                      <div style={{ fontSize:13,fontWeight:700,color:BLUE,marginBottom:4 }}>{fmt(ord.total)}</div>
                      <span style={{ background:st.bg,color:st.color,fontSize:10,fontWeight:700,padding:".18rem .55rem",borderRadius:100 }}>{st.icon} {st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Anim>

        {/* Logout */}
        <Anim>
          <div className="card-pad" style={{ background:WHITE,border:"1.5px solid #FEE2E2",borderRadius:14,padding:"1.25rem 1.5rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem" }}>
            <div>
              <h4 style={{ fontWeight:700,fontSize:14,color:"#DC2626",marginBottom:".25rem" }}>Keluar dari Akun</h4>
              <p style={{ fontSize:13,color:MUTED }}>Anda akan diarahkan kembali ke halaman beranda.</p>
            </div>
            <button onClick={onLogout} style={{ background:"#DC2626",color:WHITE,border:"none",padding:".65rem 1.4rem",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>🚪 Logout</button>
          </div>
        </Anim>
      </div>

      <div className="footer-bottom section-pad" style={{ borderTop:"1px solid #E5EAF5", padding:"1.5rem 3rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12,color:MUTED }}>© 2024 PT. IMA Creative Production</span>
        <button onClick={onBack} style={{ background:"none",border:"none",color:BLUE,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>← Kembali ke Beranda</button>
      </div>
    </div>
  );
}