"use client";

import React, { useEffect, useState } from "react";

interface DeliveryAreaAdmin {
  id: number | string;
  name?: string;
  city?: string;
  price?: number;
  fee?: number;
  cost?: number;
}

export default function AdminOngkirPage() {
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryAreaAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCity, setNewCity] = useState("");
  const [newFee, setNewFee] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // State untuk Modal Edit
  const [editingArea, setEditingArea] = useState<DeliveryAreaAdmin | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    async function fetchAreas() {
    try {
      const res = await fetch("/api/delivery-areas", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as DeliveryAreaAdmin[];
        setDeliveryAreas(Array.isArray(data) ? data : []);
      }
    } catch {
      setErrorMsg("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  }

    void fetchAreas();
  }, []);


  async function handleAddArea(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newCity.trim() || !newFee) {
      setErrorMsg("Nama Wilayah dan Tarif Ongkir wajib diisi!");
      return;
    }

    const feeNum = Number(newFee);
    if (isNaN(feeNum) || feeNum < 0) {
      setErrorMsg("Tarif ongkir harus berupa angka yang valid.");
      return;
    }

    try {
      const res = await fetch("/api/delivery-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCity.trim(), price: feeNum }),
      });

      if (res.ok) {
        const created = (await res.json()) as DeliveryAreaAdmin;
        setDeliveryAreas((prev) => [...prev, created]);
        setNewCity("");
        setNewFee("");
        setSuccessMsg("Wilayah dan tarif ongkir berhasil disimpan ke database!");
      } else {
        const errJson = await res.json().catch(() => null);
        setErrorMsg(errJson?.error || "Gagal menyimpan ke database.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    }
  }

  async function handleDelete(id: number | string) {
    if (!confirm("Yakin ingin menghapus wilayah ini dari database?")) return;
    try {
      const res = await fetch(`/api/delivery-areas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeliveryAreas((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert("Gagal menghapus wilayah.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    }
  }

  function handleOpenEdit(area: DeliveryAreaAdmin) {
    setEditingArea(area);
    setEditName(area.name || area.city || "");
    setEditPrice(String(area.price ?? area.fee ?? area.cost ?? 0));
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingArea) return;

    try {
      const res = await fetch(`/api/delivery-areas/${editingArea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, price: Number(editPrice) }),
      });

      if (res.ok) {
        const updated = (await res.json()) as DeliveryAreaAdmin;
        setDeliveryAreas((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        setEditingArea(null);
      } else {
        const errJson = await res.json().catch(() => null);
        alert(errJson?.error || "Gagal memperbarui wilayah.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menyimpan perubahan.");
    }
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5DEC9",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 900, color: "#2A1A11" }}>
            Kelola Jangkauan Kurir & Tarif Ongkir
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}>
            Tambah, edit, dan atur tarif pengiriman wilayah yang terhubung ke database Prisma.
          </p>
        </div>
      </header>

      <div style={{ padding: "32px", flex: 1, maxWidth: "1200px" }}>
        {/* Form Tambah */}
        <form
          onSubmit={handleAddArea}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "24px",
            border: "1.5px solid #E5DEC9",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: "#2A1A11" }}>
            Tambah Wilayah Pengiriman Baru
          </h3>

          {errorMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "12.5px", fontWeight: 700 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#166534", fontSize: "12.5px", fontWeight: 800 }}>
              ✓ {successMsg}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "14px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#2A1A11", marginBottom: "6px" }}>
                Nama Wilayah / Kecamatan / Kota
              </label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Contoh: Cengkareng / Cibubur"
                required
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #D6C7B2", backgroundColor: "#FAF6EE", fontSize: "13.5px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#2A1A11", marginBottom: "6px" }}>
                Tarif Ongkir (Rp)
              </label>
              <input
                type="number"
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                placeholder="Contoh: 25000"
                required
                style={{ width: "100%", padding: "11px 14px", borderRadius: "12px", border: "1.5px solid #D6C7B2", backgroundColor: "#FAF6EE", fontSize: "13.5px", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              style={{ padding: "12px 24px", borderRadius: "12px", backgroundColor: "#2A1A11", color: "#EFE3C8", border: "none", fontSize: "13.5px", fontWeight: 900, cursor: "pointer", height: "46px" }}
            >
              Simpan Wilayah
            </button>
          </div>
        </form>

        {/* Daftar Wilayah dengan Tombol Edit & Hapus */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "20px", padding: "24px", border: "1.5px solid #E5DEC9", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 900, color: "#2A1A11" }}>
            Daftar Wilayah &amp; Tarif Aktif di Database Prisma
          </h3>

          {loading ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#6D4C30" }}>Memuat data...</div>
          ) : deliveryAreas.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#8A6B47" }}>Belum ada jangkauan kurir tersimpan.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
              {deliveryAreas.map((area) => {
                const cityName = area.name || area.city || "Wilayah";
                const feeValue = Number(area.price ?? area.fee ?? area.cost ?? 0);
                return (
                  <div
                    key={area.id}
                    style={{
                      backgroundColor: "#FDFBF7",
                      border: "1.5px solid #E5DEC9",
                      borderRadius: "14px",
                      padding: "16px 18px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#2A1A11" }}>{cityName}</div>
                      <div style={{ fontSize: "13px", fontWeight: 900, color: "#6D4C30", marginTop: "4px" }}>
                        Rp {feeValue.toLocaleString("id-ID")}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(area)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #D6C7B2",
                          backgroundColor: "#FFFFFF",
                          color: "#2A1A11",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(area.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #FECACA",
                          backgroundColor: "#FEF2F2",
                          color: "#DC2626",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* EDIT WILAYAH */}
      {editingArea && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "400px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: 900, color: "#2A1A11" }}>
              Edit Wilayah &amp; Tarif
            </h3>
            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#2A1A11", marginBottom: "6px" }}>
                  Nama Wilayah
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #D6C7B2", backgroundColor: "#FAF6EE", fontSize: "13.5px", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#2A1A11", marginBottom: "6px" }}>
                  Tarif Ongkir (Rp)
                </label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1.5px solid #D6C7B2", backgroundColor: "#FAF6EE", fontSize: "13.5px", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setEditingArea(null)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #D6C7B2", backgroundColor: "#FFFFFF", color: "#2A1A11", fontWeight: 800, cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#2A1A11", color: "#EFE3C8", fontWeight: 900, cursor: "pointer" }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}