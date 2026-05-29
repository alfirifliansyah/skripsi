/**
 * STATUS DISPLAY — Konfigurasi 7 status pesanan yang dilihat user.
 *
 * Mapping dari backend (status_pesanan + sub_status_pesanan) ke key display:
 *
 *   Backend field "display_status" sudah dihitung di server,
 *   tapi helper getDisplayStatus() di sini sebagai fallback
 *   kalau response belum punya display_status (misal data lama).
 *
 * Pemakaian:
 *   import { STATUS_DISPLAY, getDisplayStatus } from "./status";
 *   const key = order.display_status || getDisplayStatus(order);
 *   const cfg = STATUS_DISPLAY[key];
 *   // cfg.label, cfg.color, cfg.bg, cfg.icon
 */

import { BLUE, BLUE_L, YELLOW_L } from "./colors";

/**
 * 7 status yang dilihat user di UI.
 * Urutan key di sini = urutan progression alami pesanan (untuk dropdown admin).
 */
export const STATUS_DISPLAY = {
  // Status awal — pesanan dibuat tapi belum bayar
  menunggu_pembayaran: {
    label:    "Menunggu Pembayaran",
    color:    "#D97706",
    bg:       YELLOW_L,
    icon:     "💳",
    order:    1,
  },

  // 4 sub-status dari status_pesanan='proses'
  dikonfirmasi: {
    label:    "Pesanan Dikonfirmasi",
    color:    "#2563EB",
    bg:       "#DBEAFE",
    icon:     "✓",
    order:    2,
  },
  persiapan: {
    label:    "Tim Sedang Persiapan",
    color:    BLUE,
    bg:       BLUE_L,
    icon:     "🛠️",
    order:    3,
  },
  berlangsung: {
    label:    "Acara Sedang Berlangsung",
    color:    "#7C3AED",
    bg:       "#EDE9FE",
    icon:     "📡",
    order:    4,
  },
  acara_selesai: {
    label:    "Acara Selesai",
    color:    "#0891B2",
    bg:       "#CFFAFE",
    icon:     "🎬",
    order:    5,
  },

  // Status akhir
  selesai: {
    label:    "File Dikirim / Pesanan Selesai",
    color:    "#059669",
    bg:       "#ECFDF5",
    icon:     "✅",
    order:    6,
  },
  batal: {
    label:    "Dibatalkan",
    color:    "#DC2626",
    bg:       "#FEF2F2",
    icon:     "❌",
    order:    99,
  },
};

/**
 * Hitung display_status di frontend (fallback kalau backend belum kirim).
 * Logika harus konsisten dengan computeDisplayStatus() di PemesananController.php
 */
export function getDisplayStatus(order) {
  if (!order) return "menunggu_pembayaran";

  // Backend sudah kirim → pakai itu langsung (paling akurat)
  if (order.display_status) return order.display_status;

  const status = order.status || order.status_pesanan;
  const sub    = order.sub_status || order.sub_status_pesanan;
  const payStatus = order.pembayaran?.status_verifikasi;

  if (status === "batal")   return "batal";
  if (status === "selesai") return "selesai";

  if (status === "menunggu") {
    if (payStatus === "success") return "dikonfirmasi";
    return "menunggu_pembayaran";
  }

  if (status === "proses") {
    return sub || "dikonfirmasi";
  }

  return "menunggu_pembayaran";
}

/**
 * Mapping balik: dari display_status ke pasangan (status_pesanan, sub_status_pesanan)
 * untuk dikirim ke backend saat admin ubah status.
 */
export function mapDisplayToBackend(displayKey) {
  switch (displayKey) {
    case "menunggu_pembayaran":
      return { status_pesanan: "menunggu", sub_status_pesanan: null };
    case "dikonfirmasi":
      return { status_pesanan: "proses",   sub_status_pesanan: "dikonfirmasi" };
    case "persiapan":
      return { status_pesanan: "proses",   sub_status_pesanan: "persiapan" };
    case "berlangsung":
      return { status_pesanan: "proses",   sub_status_pesanan: "berlangsung" };
    case "acara_selesai":
      return { status_pesanan: "proses",   sub_status_pesanan: "acara_selesai" };
    case "selesai":
      return { status_pesanan: "selesai",  sub_status_pesanan: null };
    case "batal":
      return { status_pesanan: "batal",    sub_status_pesanan: null };
    default:
      return { status_pesanan: "menunggu", sub_status_pesanan: null };
  }
}

/**
 * Urutan tampil di dropdown admin.
 * 'menunggu_pembayaran' di-skip karena admin tidak ngatur sub-status sebelum bayar.
 */
export const ADMIN_STATUS_OPTIONS = [
  "dikonfirmasi",
  "persiapan",
  "berlangsung",
  "acara_selesai",
  "selesai",
  "batal",
];

/**
 * Filter status di list pesanan — pakai 7 nilai display + 'semua'.
 */
export const FILTER_STATUS_OPTIONS = [
  "semua",
  "menunggu_pembayaran",
  "dikonfirmasi",
  "persiapan",
  "berlangsung",
  "acara_selesai",
  "selesai",
  "batal",
];