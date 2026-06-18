import { BLUE, BLUE_L, YELLOW_L } from "./colors";


/* ══════════════════════════════════════════════════════════
   STATIC DATA — yang tidak butuh backend
══════════════════════════════════════════════════════════ */

export const NAV_LINKS = ["Beranda", "Portofolio", "Jasa", "Pemesanan"];

/** Preview ringkas di HomePage — fallback jika API jasa belum loaded */
export const SERVICES_FALLBACK = [
  { title: "Live Streaming",   icon: "📡", desc: "Produksi live streaming profesional untuk event korporat, konser, konferensi, dan acara khusus dengan kualitas broadcast." },
  { title: "Zoom Hybrid",      icon: "💻", desc: "Pengelolaan acara hybrid yang memadukan peserta fisik dan virtual secara seamless dengan teknologi terkini." },
  { title: "Video Production", icon: "🎬", desc: "Produksi video kreatif mulai dari konsep, shooting, hingga post-production untuk berbagai kebutuhan komersial." },
  { title: "Event Management", icon: "🎪", desc: "Manajemen event end-to-end dengan tim berpengalaman yang memastikan setiap detail terlaksana sempurna." },
];

export const VALUES = [
  { title: "Efektif & Efisiensi Solusi", icon: "⚡", desc: "Memberikan solusi utama dalam setiap jasa yang kami berikan, mengkaji sesuai kebutuhan untuk memberikan solusi yang lebih guna." },
  { title: "Kualitas & Profesionalisme", icon: "🏆", desc: "Setiap individu yang berpengalaman dan kompeten di bidangnya. Dengan tim yang handal dan profesionalisme tinggi." },
  { title: "Komitmen & Pelayanan",       icon: "🤝", desc: "Kami sangat menghargai setiap kerjasama yang dijalin. Memberikan komitmen sepenuhnya untuk hasil terbaik dan tepat waktu." },
];

export const PORTFOLIO_PREVIEW = [
  { label: "Corporate Summit — Pertamina", tag: "Live Event",  icon: "🎬", alt: false },
  { label: "Hybrid Conference — Pegadaian",tag: "Zoom Hybrid", icon: "📡", alt: true  },
  { label: "Music Festival Live",          tag: "Live Stream", icon: "🎵", alt: false },
  { label: "Sport Broadcasting — 2Play",   tag: "Broadcast",   icon: "📺", alt: true  },
];

export const ALL_PROJECTS = [
  { id:1, title:"Corporate Summit — Pertamina",  tag:"Live Event",      client:"Pertamina", year:"2024", gradient:"linear-gradient(135deg,#1a2a6c,#1B4FD8 60%,#23d5ab)", emoji:"🎬", span:"wide",   desc:"Produksi live streaming & multi-camera switching untuk Corporate Summit Pertamina dengan 2.000+ peserta nasional." },
  { id:2, title:"Gala Night PLN",                tag:"Event",           client:"PLN",       year:"2023", gradient:"linear-gradient(135deg,#f7971e,#ffd200)",              emoji:"🎪", span:"normal", desc:"Full production management Gala Dinner PLN Group — lighting, sound, streaming, dan dekorasi panggung." },
  { id:3, title:"Hybrid Conference — Pegadaian", tag:"Zoom Hybrid",     client:"Pegadaian", year:"2024", gradient:"linear-gradient(135deg,#11998e,#38ef7d)",              emoji:"💻", span:"normal", desc:"Rapat Nasional Pegadaian secara hybrid — menghubungkan kantor pusat dengan 50+ kantor cabang seluruh Indonesia." },
  { id:4, title:"Sport Broadcasting — 2Play",    tag:"Broadcast",       client:"2Play",     year:"2023", gradient:"linear-gradient(135deg,#c0392b,#8e44ad)",              emoji:"📺", span:"normal", desc:"Siaran langsung pertandingan sepak bola nasional dengan tim teknis berpengalaman & switching multi-kamera." },
  { id:5, title:"Product Launch — Pepsi",        tag:"Video Production",client:"Pepsi",     year:"2023", gradient:"linear-gradient(135deg,#0052cc,#2684ff)",              emoji:"🚀", span:"normal", desc:"Video produksi peluncuran Pepsi Indonesia edisi 125 tahun — dari konsep kreatif hingga post-production." },
  { id:6, title:"Music Festival Live",           tag:"Live Stream",     client:"Promotor",  year:"2024", gradient:"linear-gradient(135deg,#4c1d95,#7c3aed 60%,#ec4899)", emoji:"🎵", span:"wide",   desc:"Streaming live konser musik nasional — multi-kamera, sound engineering profesional, dan visual effects." },
  { id:7, title:"Annual Meeting — BRI",          tag:"Event",           client:"BRI",       year:"2024", gradient:"linear-gradient(135deg,#003F87,#1B4FD8)",              emoji:"🏦", span:"normal", desc:"RUPS Tahunan BRI dengan format hybrid, mencakup live streaming internal dan external untuk pemegang saham." },
  { id:8, title:"Tech Summit — Telkom",          tag:"Broadcast",       client:"Telkom",    year:"2023", gradient:"linear-gradient(135deg,#991b1b,#CC0000)",              emoji:"📡", span:"normal", desc:"Konferensi teknologi tahunan Telkom Indonesia dengan setup 4K broadcast dan distribusi streaming CDN." },
  { id:9, title:"Training Event — Mandiri",      tag:"Zoom Hybrid",     client:"Mandiri",   year:"2024", gradient:"linear-gradient(135deg,#003087,#0052cc)",              emoji:"🎓", span:"normal", desc:"Program pelatihan hybrid Bank Mandiri melibatkan lebih dari 500 peserta dari seluruh wilayah Indonesia." },
];

export const BUMN_CLIENTS = [
  { name:"Pertamina", color:"#E31E25", bg:"#FFF0F0", abbr:"PTM", sub:"Persero"   },
  { name:"PLN",       color:"#1B4FD8", bg:"#EEF2FF", abbr:"PLN", sub:"Persero"   },
  { name:"Pegadaian", color:"#00833E", bg:"#ECFDF5", abbr:"PGD", sub:"Persero"   },
  { name:"Telkom",    color:"#CC0000", bg:"#FFF0F0", abbr:"TLK", sub:"Indonesia" },
  { name:"BRI",       color:"#003F87", bg:"#EEF2FF", abbr:"BRI", sub:"Bank"      },
  { name:"BNI",       color:"#F37F20", bg:"#FFFBEB", abbr:"BNI", sub:"Bank"      },
  { name:"Mandiri",   color:"#003087", bg:"#EEF2FF", abbr:"BMD", sub:"Bank"      },
  { name:"Waskita",   color:"#0070C0", bg:"#EEF2FF", abbr:"WSK", sub:"Karya"     },
];

export const MONTHS    = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
export const DAYS_HDR  = ["MIN","SEN","SEL","RAB","KAM","JUM","SAB"];
export const TIME_SLOTS= ["07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00","19:00","20:00"];

/* ══════════════════════════════════════════════════════════
   STATUS CONFIG — sistem 7 display_status (sub_status_pesanan)
══════════════════════════════════════════════════════════ */
export const STATUS_CFG = {
  menunggu_pembayaran: { label: "Menunggu Pembayaran",      color: "#D97706", bg: YELLOW_L,   icon: "⏳" },
  dikonfirmasi:        { label: "Pesanan Dikonfirmasi",     color: BLUE,      bg: BLUE_L,     icon: "✅" },
  persiapan:           { label: "Tim Sedang Persiapan",     color: "#7C3AED", bg: "#EDE9FE",  icon: "🛠️" },
  berlangsung:         { label: "Acara Sedang Berlangsung", color: "#C026D3", bg: "#FAE8FF",  icon: "🎬" },
  acara_selesai:       { label: "Acara Selesai",            color: "#0E7490", bg: "#CFFAFE",  icon: "🏁" },
  selesai:             { label: "Pesanan Selesai",          color: "#059669", bg: "#ECFDF5",  icon: "🎉" },
  batal:               { label: "Dibatalkan",               color: "#DC2626", bg: "#FEF2F2",  icon: "❌" },
};

// Tombol yang muncul di modal "UBAH STATUS" (menunggu_pembayaran dikecualikan
// karena itu otomatis dari webhook Midtrans, bukan dipilih manual oleh admin)
export const ADMIN_STATUS_OPTIONS = ["dikonfirmasi", "persiapan", "berlangsung", "acara_selesai", "selesai", "batal"];

// Ubah display key (yang dipilih admin) jadi payload backend
export function mapDisplayToBackend(displayKey) {
  const subStatuses = ["dikonfirmasi", "persiapan", "berlangsung", "acara_selesai"];
  if (subStatuses.includes(displayKey)) {
    return { status_pesanan: "proses", sub_status_pesanan: displayKey };
  }
  if (displayKey === "selesai") return { status_pesanan: "selesai", sub_status_pesanan: null };
  if (displayKey === "batal")   return { status_pesanan: "batal",   sub_status_pesanan: null };
  return { status_pesanan: "menunggu", sub_status_pesanan: null };
}

// Baca display status dari order. Backend sudah menghitungnya di
// formatPemesanan() lewat computeDisplayStatus(), jadi tinggal pakai itu —
// fallback manual hanya untuk jaga-jaga kalau field belum ada.
export function getDisplayStatus(o) {
  if (o.display_status) return o.display_status;
  const status = o.status_pesanan ?? o.status;
  const sub    = o.sub_status_pesanan ?? o.sub_status;
  if (status === "batal")    return "batal";
  if (status === "selesai")  return "selesai";
  if (status === "menunggu") return o.pembayaran?.status_verifikasi === "success" ? "dikonfirmasi" : "menunggu_pembayaran";
  if (status === "proses")   return sub || "dikonfirmasi";
  return "menunggu_pembayaran";
}

export function fmt(n) { return "Rp " + Number(n || 0).toLocaleString("id-ID"); }

/**
 * Normalize jasa dari API menjadi shape yang dipakai komponen.
 * Backend sudah kirim dual-key, tapi tetap aman dirapikan di sini.
 */
export function normalizeJasa(j) {
  if (!j) return null;
  return {
    id:        j.id || j.id_jasa,
    id_jasa:   j.id_jasa || j.id,
    title:     j.title || j.nama_jasa,
    desc:      j.desc  || j.deskripsi,
    harga:     Number(j.harga || j.price || 0),
    status_tersedia: j.status_tersedia || "tersedia",
    icon:      j.icon  || j.emoji || "🎬",
    emoji:     j.emoji || j.icon  || "🎬",
    tag:       j.tag      || "Layanan",
    tagColor:  j.tagColor || j.tag_color || "#1B4FD8",
    imgBg:     j.imgBg    || j.img_bg    || "linear-gradient(135deg,#1a2a6c,#1B4FD8 60%,#23d5ab)",
    gambar:      j.gambar     || null,
    gambar_url:  j.gambar_url || null,
    features:  Array.isArray(j.features) ? j.features : [],
    packages:  Array.isArray(j.packages) ? j.packages : [],
    addons:    Array.isArray(j.addons)   ? j.addons   : [],
    addonLabel: j.addonLabel || j.addon_label || "Tambahan",
  };
}

/**
 * Normalize order dari API.
 */
export function normalizeOrder(o) {
  if (!o) return null;
  return {
    id:             o.id || o.kode_pemesanan,
    id_pemesanan:   o.id_pemesanan,
    kode:           o.kode_pemesanan || o.id,
    svc:            o.svc || o.details?.[0]?.id_jasa,
    svcName:        o.svcName || o.nama_jasa || o.details?.[0]?.nama_jasa || "-",
    paket:          o.paket || o.paket_label || o.details?.[0]?.paket_label || "-",
    date:           o.date || "-",
    time:           o.time || o.waktu_pelaksanaan || "-",
    total:          Number(o.total || o.total_harga || 0),
    status:         o.status || o.status_pesanan || "menunggu",
    sub_status:     o.sub_status || o.sub_status_pesanan || null,
    display_status: o.display_status || null,
    company:        o.company || o.perusahaan || "-",
    nama_pic:       o.nama_pic || o.name,
    telepon_pic:    o.telepon_pic || o.phone,
    catatan:        o.catatan || o.notes,
    details:        o.details || [],
    pembayaran:     o.pembayaran || null,
    customer:       o.customer || null,
    tgl_pelaksanaan_raw: o.tgl_pelaksanaan_raw,
  };
}