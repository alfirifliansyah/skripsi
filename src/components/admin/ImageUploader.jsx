import { useRef, useState } from "react";
import { uploadAPI } from "../../services/api";

/**
 * ImageUploader — komponen reusable untuk upload gambar.
 *
 * Props:
 *   value     : string | null   — path gambar saat ini (mis. "uploads/jasa/xyz.jpg")
 *   valueUrl  : string | null   — URL gambar saat ini (untuk preview); bisa kosong jika value null
 *   folder    : "jasa" | "portofolio" | "hero" — folder target di backend
 *   onChange  : (newPath: string|null, newUrl: string|null) => void
 *   onError?  : (msg: string) => void   — callback saat upload gagal
 *   height?   : number  — tinggi preview area (default 200)
 *
 * Contoh pemakaian:
 *   <ImageUploader
 *     value={form.gambar}
 *     valueUrl={form.gambar_url}
 *     folder="jasa"
 *     onChange={(path, url) => setForm({...form, gambar: path, gambar_url: url})}
 *     onError={(msg) => showToast({ type:"error", msg })}
 *   />
 */
export default function ImageUploader({
  value,
  valueUrl,
  folder,
  onChange,
  onError = () => {},
  height = 200,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver]   = useState(false);

  // Style helper
  const COLORS = {
    accent:  "#1B4FD8",
    accentL: "#E8EEFB",
    border:  "#E5EAF5",
    muted:   "#6B7591",
    dark:    "#0F1B3D",
    danger:  "#DC2626",
    dangerL: "#FEF2F2",
  };

  const validateFile = (file) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return "Format file harus JPG, PNG, atau WEBP";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "Ukuran file maksimal 5MB";
    }
    return null;
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const err = validateFile(file);
    if (err) { onError(err); return; }

    setUploading(true);
    try {
      const { path, url } = await uploadAPI.upload(file, folder);
      onChange(path, url);
    } catch (e) {
      onError(e?.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset input agar bisa upload file yang sama lagi setelah dihapus
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = async () => {
    if (!value) return;
    if (!window.confirm("Hapus gambar ini? (Gambar akan dihapus dari server saat kamu klik Simpan)")) return;
    // Tidak langsung delete file di server — biar controller backend yang handle saat user klik Simpan
    // Cukup clear di form
    onChange(null, null);
  };

  // ── State 1: Sudah ada gambar → tampilkan preview + tombol ganti/hapus ──
  if (valueUrl) {
    return (
      <div style={{
        position: "relative",
        height,
        borderRadius: 10,
        overflow: "hidden",
        border: `1.5px solid ${COLORS.border}`,
        background: "#F8FAFD",
      }}>
        <img
          src={valueUrl}
          alt="Preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            e.target.style.display = "none";
            onError("Gambar tidak bisa dimuat (URL bermasalah)");
          }}
        />
        {/* Overlay tombol di pojok */}
        <div style={{
          position: "absolute",
          top: 10, right: 10,
          display: "flex", gap: 6,
        }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              background: "rgba(255,255,255,.95)",
              border: "none",
              padding: ".4rem .75rem",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.accent,
              cursor: uploading ? "wait" : "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 6px rgba(0,0,0,.15)",
            }}
          >
            {uploading ? "⏳ Upload..." : "🔄 Ganti"}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            style={{
              background: "rgba(255,255,255,.95)",
              border: "none",
              padding: ".4rem .75rem",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.danger,
              cursor: uploading ? "wait" : "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 6px rgba(0,0,0,.15)",
            }}
          >
            🗑️ Hapus
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    );
  }

  // ── State 2: Belum ada gambar → tampilkan dropzone ──
  return (
    <div
      onClick={() => !uploading && fileInputRef.current?.click()}
      onDragEnter={e => { e.preventDefault(); setDragOver(true); }}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={e => { e.preventDefault(); setDragOver(false); }}
      onDrop={handleDrop}
      style={{
        height,
        borderRadius: 10,
        border: `2px dashed ${dragOver ? COLORS.accent : COLORS.border}`,
        background: dragOver ? COLORS.accentL : "#F8FAFD",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: uploading ? "wait" : "pointer",
        transition: "all .2s",
        padding: "1rem",
        textAlign: "center",
      }}
    >
      {uploading ? (
        <>
          <div style={{ fontSize: 32, marginBottom: 8, animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
          <p style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600 }}>Mengupload gambar...</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.dark, marginBottom: 4 }}>
            Klik atau drag gambar ke sini
          </p>
          <p style={{ fontSize: 12, color: COLORS.muted }}>
            JPG, PNG, atau WEBP · Maks 5MB
          </p>
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
}