/* ═══════════════════════════════════════════════════════════
   API SERVICE — IMA Creative Production
   Base URL: VITE_API_URL=http://localhost:8000/api
═══════════════════════════════════════════════════════════ */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/* ─── Token helpers ─────────────────────────────────────── */
/*
 * Pisahkan token storage berdasarkan path agar admin & pelanggan
 * bisa login bersamaan di Chrome yang sama tanpa bentrok.
 *   - /admin/*  pakai key `ima_token_admin`
 *   - lainnya  pakai key `ima_token_user`
 */
const ADMIN_TOKEN_KEY = "ima_token_admin";
const USER_TOKEN_KEY  = "ima_token_user";
const isAdminContext  = () => typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
const TOKEN_KEY       = () => isAdminContext() ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;

export const saveToken   = (t) => { try { localStorage.setItem(TOKEN_KEY(), t); } catch {} };
export const removeToken = ()  => { try { localStorage.removeItem(TOKEN_KEY()); } catch {} };
export const getToken    = ()  => { try { return localStorage.getItem(TOKEN_KEY()); } catch { return null; } };

// Untuk migrasi dari versi lama (single key)
try {
  const legacy = localStorage.getItem("ima_token");
  if (legacy && !localStorage.getItem(USER_TOKEN_KEY) && !localStorage.getItem(ADMIN_TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY(), legacy);
    localStorage.removeItem("ima_token");
  }
} catch {}

/* ─── Headers ───────────────────────────────────────────── */
function headers(auth = false) {
  const h = { "Content-Type": "application/json", "Accept": "application/json" };
  if (auth) {
    const t = getToken();
    if (t) h["Authorization"] = `Bearer ${t}`;
  }
  return h;
}

/* ─── Response handler ──────────────────────────────────── */
async function handle(res) {
  let json;
  try {
    json = await res.json();
  } catch {
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return {};
  }
  if (!res.ok) {
    // 401 = token expired/invalid → bersihkan
    if (res.status === 401) removeToken();
    const errMsg = json?.message || `Error ${res.status}`;
    const err = new Error(errMsg);
    err.status = res.status;
    err.errors = json?.errors;
    throw err;
  }
  return json;
}

/* ─── Base methods ──────────────────────────────────────── */
async function GET(path, auth = false) {
  return handle(await fetch(`${BASE_URL}${path}`, { headers: headers(auth) }));
}
async function POST(path, body, auth = false) {
  return handle(await fetch(`${BASE_URL}${path}`, {
    method: "POST", headers: headers(auth), body: JSON.stringify(body),
  }));
}
async function PUT(path, body, auth = false) {
  return handle(await fetch(`${BASE_URL}${path}`, {
    method: "PUT", headers: headers(auth), body: JSON.stringify(body),
  }));
}
async function DEL(path, auth = false) {
  return handle(await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers: headers(auth) }));
}

/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */
export const authAPI = {

  register: async ({ firstName, lastName, email, phone, company, password }) => {
    const res = await POST("/register", {
      nama:       `${firstName || ""} ${lastName || ""}`.trim(),
      email,
      password,
      no_telp:    phone,
      perusahaan: company,
    });
    if (res.data?.token) saveToken(res.data.token);
    return res.data?.user;
  },

  login: async ({ email, password }) => {
    const res = await POST("/login", { email, password });
    if (res.data?.token) saveToken(res.data.token);
    return res.data?.user;
  },

  logout: async () => {
    try { await POST("/logout", {}, true); } catch {} finally { removeToken(); }
  },

  /**
   * Lupa password — submit email.
   * Backend akan kirim email (lewat Mailtrap di dev) berisi link reset.
   * Selalu return success demi keamanan (anti email enumeration).
   */
  forgotPassword: async (email) => {
    return await POST("/forgot-password", { email });
  },

  /**
   * Reset password — submit token + password baru.
   * Token didapat dari URL query parameter saat user klik link di email.
   */
  resetPassword: async (payload) => {
    return await POST("/reset-password", payload);
  },

  /** Auto-login: dipanggil saat App mount kalau ada token */
  me: async () => {
    const res = await GET("/me", true);
    return res.data;
  },

  updateProfile: async ({ name, email, phone, company, alamat }) => {
    const body = {};
    if (name        !== undefined) body.nama = name;
    if (email       !== undefined) body.email = email;
    if (phone       !== undefined) body.no_telp = phone;
    if (company     !== undefined) body.perusahaan = company;
    if (alamat      !== undefined) body.alamat = alamat;
    const res = await PUT("/profile", body, true);
    return res.data;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const res = await PUT("/password", {
      current_password: currentPassword,
      new_password:     newPassword,
    }, true);
    return res;
  },
};

/* ══════════════════════════════════════════════════════════
   JASA
══════════════════════════════════════════════════════════ */
export const jasaAPI = {
  /** Public list (hanya yang tersedia) */
  getAll: async () => {
    const res = await GET("/jasa");
    return res.data || [];
  },
  /** Detail */
  getById: async (id) => {
    const res = await GET(`/jasa/${id}`);
    return res.data;
  },
  /** Admin: list semua (termasuk tidak_tersedia) */
  getAllAdmin: async () => {
    const res = await GET("/admin/jasa", true);
    return res.data || [];
  },
};

/* ══════════════════════════════════════════════════════════
   PEMESANAN
══════════════════════════════════════════════════════════ */
export const pemesananAPI = {

  getAll: async (status = "semua") => {
    const query = status && status !== "semua" ? `?status=${status}` : "";
    const res   = await GET(`/pemesanan${query}`, true);
    return res.data || [];
  },

  getById: async (id) => {
    const res = await GET(`/pemesanan/${id}`, true);
    return res.data;
  },

  /**
   * Buat pesanan baru.
   * p.serviceId   → id_jasa
   * p.paketId     → paket_id
   * p.paketLabel  → paket_label
   * p.paketPrice  → paket_price (server tetap re-calculate)
   * p.addonsObj   → { addonId: qty }
   * p.addonsList  → list addon dengan {id, name, price}
   * p.date        → "YYYY-MM-DD"
   * p.time        → "09:00"
   * p.name, p.phone, p.company, p.notes
   */
  create: async (p) => {
    const addonsArray = Object.entries(p.addonsObj || {})
      .filter(([, qty]) => qty > 0)
      .map(([addonId, qty]) => {
        const addonData = (p.addonsList || []).find(a => a.id === addonId);
        return {
          id:       addonId,
          name:     addonData?.name  || addonId,
          price:    addonData?.price || 0,
          quantity: qty,
        };
      });

    const res = await POST("/pemesanan", {
      id_jasa:           p.serviceId,
      paket_id:          p.paketId,
      paket_label:       p.paketLabel,
      paket_price:       p.paketPrice,   // diabaikan oleh server, tapi dikirim untuk audit
      addons:            addonsArray,
      tgl_pelaksanaan:   p.date,
      waktu_pelaksanaan: p.time,
      nama_pic:          p.name,
      telepon_pic:       p.phone,
      perusahaan:        p.company || "",
      catatan:           p.notes   || "",
    }, true);

    return res.data;
  },

  createPayment: async (idPemesanan) => {
    const res = await POST(`/pemesanan/${idPemesanan}/bayar`, {}, true);
    return res.data;
  },

  cancel: async (idPemesanan) => {
    const res = await POST(`/pemesanan/${idPemesanan}/cancel`, {}, true);
    return res.data;
  },

  getStatus: async (idPemesanan) => {
    const res = await GET(`/pemesanan/${idPemesanan}/status`, true);
    return res.data;
  },
};

/* ══════════════════════════════════════════════════════════
   PEMBAYARAN (Midtrans)
══════════════════════════════════════════════════════════ */
export const pembayaranAPI = {
  buatSnapToken: async (idPemesanan) => {
    const res = await POST(`/pemesanan/${idPemesanan}/bayar`, {}, true);
    return res.data;
  },
};

/* ══════════════════════════════════════════════════════════
   ADMIN
══════════════════════════════════════════════════════════ */
export const adminAPI = {

  dashboard: async () => {
    const res = await GET("/admin/dashboard", true);
    return res.data;
  },

  listPelanggan: async () => {
    const res = await GET("/admin/pelanggan", true);
    return res.data || [];
  },

  laporan: async (dari = "", sampai = "") => {
    const q = [];
    if (dari)   q.push(`dari=${dari}`);
    if (sampai) q.push(`sampai=${sampai}`);
    const res = await GET(`/admin/laporan${q.length ? "?" + q.join("&") : ""}`, true);
    return res.data;
  },

  updateStatusPesanan: async (idPemesanan, status) => {
    const res = await PUT(`/admin/pemesanan/${idPemesanan}/status`, { status_pesanan: status }, true);
    return res.data;
  },

  /** CRUD Jasa */
  createJasa: async (data) => {
    const res = await POST("/admin/jasa", data, true);
    return res.data;
  },
  updateJasa: async (id, data) => {
    const res = await PUT(`/admin/jasa/${id}`, data, true);
    return res.data;
  },
  deleteJasa: async (id) => {
    const res = await DEL(`/admin/jasa/${id}`, true);
    return res;
  },
  toggleJasa: async (id) => {
    const res = await POST(`/admin/jasa/${id}/toggle`, {}, true);
    return res.data;
  },

  /** Jadwal blocked dates (admin) */
  listBlockedDates: async (idJasa) => {
    const res = await GET(`/admin/jasa/${idJasa}/blocked`, true);
    return res.data || [];
  },
  blockDate: async (idJasa, payload) => {
    const res = await POST(`/admin/jasa/${idJasa}/block`, payload, true);
    return res.data;
  },
  unblockDate: async (idBlocked) => {
    const res = await DEL(`/admin/blocked/${idBlocked}`, true);
    return res;
  },

  /** CRUD Portofolio */
  createPortofolio: async (data) => {
    const res = await POST("/admin/portofolio", data, true);
    return res.data;
  },
  updatePortofolio: async (id, data) => {
    const res = await PUT(`/admin/portofolio/${id}`, data, true);
    return res.data;
  },
  deletePortofolio: async (id) => {
    const res = await DEL(`/admin/portofolio/${id}`, true);
    return res;
  },

  /** Update pengaturan (batch) */
  updatePengaturan: async (settings) => {
    const res = await PUT("/admin/pengaturan", { settings }, true);
    return res;
  },
};

/* ══════════════════════════════════════════════════════════
   JADWAL — cek ketersediaan tanggal jasa (publik)
══════════════════════════════════════════════════════════ */
export const jadwalAPI = {
  /**
   * Cek tanggal yang TIDAK tersedia untuk jasa tertentu di bulan tertentu.
   * @param {number} idJasa - ID jasa
   * @param {string} bulan  - Format YYYY-MM, default = bulan ini
   * @returns { unavailable_list: ['2026-05-10', ...], blocked_dates, booked_dates }
   */
  check: async (idJasa, bulan) => {
    const q = bulan ? `?bulan=${bulan}` : "";
    const res = await GET(`/jasa/${idJasa}/jadwal${q}`);
    return res.data;
  },
};

/* ══════════════════════════════════════════════════════════
   PORTOFOLIO (publik untuk lihat, admin untuk CRUD)
══════════════════════════════════════════════════════════ */
export const portofolioAPI = {
  getAll: async (featuredOnly = false) => {
    const res = await GET(`/portofolio${featuredOnly ? "?featured=1" : ""}`);
    return res.data || [];
  },
  get: async (id) => {
    const res = await GET(`/portofolio/${id}`);
    return res.data;
  },
};

/* ══════════════════════════════════════════════════════════
   PENGATURAN (publik baca, admin update)
══════════════════════════════════════════════════════════ */
export const pengaturanAPI = {
  /**
   * Returns key-value object of all settings.
   * Example: { hero_title: '...', stat_klien: '200+', ... }
   */
  getAll: async (grup = "") => {
    const res = await GET(`/pengaturan${grup ? "?grup=" + grup : ""}`);
    return res.data || {};
  },
};

/* ══════════════════════════════════════════════════════════
   HEALTH CHECK
══════════════════════════════════════════════════════════ */
export const ping = async () => {
  try { const res = await GET("/ping"); return res.status === "ok"; }
  catch { return false; }
};

/* ══════════════════════════════════════════════════════════
   UPLOAD GAMBAR (admin only)
   ══════════════════════════════════════════════════════════
   Endpoint:
     POST   /api/admin/upload  (multipart/form-data)
       body: { file: File, folder: 'jasa'|'portofolio'|'hero' }
     DELETE /api/admin/upload  (json)
       body: { path: 'uploads/...' }
   ══════════════════════════════════════════════════════════ */
export const uploadAPI = {
  /**
   * Upload satu file gambar ke backend Laravel.
   * Backend simpan ke storage/app/public/uploads/{folder}/.
   *
   * @param {File}   file   - File object dari <input type="file">
   * @param {string} folder - 'jasa' | 'portofolio' | 'hero'
   * @returns {Promise<{path: string, url: string}>}
   *
   * TIDAK menggunakan helper POST() biasa karena untuk multipart,
   * kita TIDAK boleh set Content-Type manual — browser harus
   * mengaturnya sendiri beserta boundary multipart.
   */
  upload: async (file, folder) => {
    if (!file)   throw new Error("File tidak boleh kosong");
    if (!folder) throw new Error("Folder harus diisi (jasa/portofolio/hero)");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const token = getToken();
    const h = { Accept: "application/json" };
    if (token) h["Authorization"] = `Bearer ${token}`;
    // PENTING: jangan set "Content-Type" — biarkan browser yang set
    // dengan boundary multipart yang benar.

    const res = await fetch(`${BASE_URL}/admin/upload`, {
      method:  "POST",
      headers: h,
      body:    formData,
    });

    const json = await handle(res);
    return json.data; // { path, url }
  },

  /**
   * Hapus file gambar dari storage.
   * Backend controller (UploadController::deleteFile) sudah auto-hapus
   * file lama saat update entity, jadi function ini opsional —
   * biasanya tidak perlu dipanggil manual.
   */
  delete: async (path) => {
    if (!path) return;
    const token = getToken();
    const h = {
      "Content-Type": "application/json",
      Accept:         "application/json",
    };
    if (token) h["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/admin/upload`, {
      method:  "DELETE",
      headers: h,
      body:    JSON.stringify({ path }),
    });
    return handle(res);
  },
};