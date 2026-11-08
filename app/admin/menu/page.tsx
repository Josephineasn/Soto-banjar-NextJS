"use client";

import React, { useEffect, useState } from "react";
import { MenuItem } from "@/types";

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("makanan");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [spicyLevel, setSpicyLevel] = useState("Tidak Pedas");
  const [calories, setCalories] = useState("");
  const [popular, setPopular] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadMenus() {
    try {
      setLoading(true);
      const res = await fetch("/api/menu", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMenus(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadMenus();
    });
  }, []);

  function handleStartEdit(item: MenuItem) {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category || "makanan");
    setPrice(String(item.price));
    setDescription(item.description || "");
    setImage(item.image || "");
    setSpicyLevel(item.spicyLevel || "Tidak Pedas");
    setCalories(
      item.calories
        ? String(item.calories).replace(/kkal/gi, "").trim()
        : ""
    );
    setPopular(Boolean(item.popular));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setName("");
    setCategory("makanan");
    setPrice("");
    setDescription("");
    setImage("");
    setSpicyLevel("Tidak Pedas");
    setCalories("");
    setPopular(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;

    try {
      setSubmitting(true);
      const cleanCal = calories
        ? Number(String(calories).replace(/[^0-9]/g, ""))
        : null;

      const payload = {
        name: name.trim(),
        category,
        price: Number(price),
        description: description.trim(),
        image:
          image.trim() ||
          "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg",
        spicyLevel,
        calories: cleanCal,
        popular,
      };

      if (editingId !== null) {
        // Mode UPDATE (Edit Menu)
        const res = await fetch(`/api/menu/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert("Menu berhasil diperbarui!");
          handleCancelEdit();
          await loadMenus();
        } else {
          const altRes = await fetch("/api/menu", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editingId, ...payload }),
          });
          if (altRes.ok) {
            alert("Menu berhasil diperbarui!");
            handleCancelEdit();
            await loadMenus();
          } else {
            alert("Gagal memperbarui menu.");
          }
        }
      } else {
        // Mode TAMBAH BARU
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert("Menu baru berhasil disimpan!");
          handleCancelEdit();
          await loadMenus();
        } else {
          alert("Gagal menambahkan menu baru.");
        }
      }
    } catch {
      alert("Terjadi kendala jaringan saat menyimpan menu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus menu ini dari daftar restoran?")) return;
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await loadMenus();
      } else {
        alert("Gagal menghapus menu.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "#734F31",
            margin: "0 0 6px",
            fontFamily: "serif",
          }}
        >
          Kelola Menu Sajian
        </h2>
        <p style={{ fontSize: "13px", color: "#9D9167", margin: 0 }}>
          Tambah sajian baru, sesuaikan harga, tingkat kepedasan, atau ubah detail menu.
        </p>
      </div>

      {/* Form Input / Edit */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          border: "1.5px solid #E8D1A7",
          padding: "24px",
          boxShadow: "0 4px 15px rgba(115, 79, 49, 0.04)",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px",
            fontSize: "16px",
            fontWeight: "800",
            color: "#734F31",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#734F31" strokeWidth={2}>
            <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {editingId !== null ? `Sunting Data Menu (#${editingId})` : "Tambah Menu Baru"}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                Nama Menu
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Soto Banjar Spesial"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
              >
                <option value="makanan">Makanan</option>
                <option value="cemilan">Cemilan</option>
                <option value="pendamping">Pendamping</option>
                <option value="minuman">Minuman</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                Harga (Rp)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="35000"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                Tingkat Kepedasan
              </label>
              <input
                type="text"
                value={spicyLevel}
                onChange={(e) => setSpicyLevel(e.target.value)}
                placeholder="Tidak Pedas / Sedang / Pedas"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                Estimasi Kalori (Angka dalam kkal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="Contoh: 350"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                URL Gambar Foto Menu
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
              Deskripsi Sajian
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan keunikan rempah dan isian menu..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box", resize: "none" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              id="popular"
              checked={popular}
              onChange={(e) => setPopular(e.target.checked)}
              style={{ cursor: "pointer", accentColor: "#734F31" }}
            />
            <label htmlFor="popular" style={{ fontSize: "12px", fontWeight: "700", color: "#734F31", cursor: "pointer" }}>
              Tandai sebagai Menu Favorit / Rekomendasi Restoran
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 22px",
                backgroundColor: "#734F31",
                color: "#FAF6EE",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "800",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? "Menyimpan..."
                : editingId !== null
                ? "Simpan Perubahan Menu"
                : "Simpan Menu Baru"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#FAF6EE",
                  color: "#734F31",
                  border: "1px solid #E8D1A7",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Daftar Menu */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          border: "1.5px solid #E8D1A7",
          padding: "24px",
          boxShadow: "0 4px 15px rgba(115, 79, 49, 0.04)",
        }}
      >
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#734F31" }}>
          Daftar Menu Aktif ({menus.length})
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9D9167", fontSize: "13px" }}>
            Memuat menu...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #E8D1A7", color: "#9D9167" }}>
                  <th style={{ padding: "12px 10px", width: "60px" }}>FOTO</th>
                  <th style={{ padding: "12px 10px" }}>NAMA MENU</th>
                  <th style={{ padding: "12px 10px" }}>KATEGORI</th>
                  <th style={{ padding: "12px 10px" }}>KEPEDASAN</th>
                  <th style={{ padding: "12px 10px" }}>KALORI</th>
                  <th style={{ padding: "12px 10px" }}>HARGA</th>
                  <th style={{ padding: "12px 10px", textAlign: "right" }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((item) => {
                  const cleanCalories = item.calories
                    ? `${String(item.calories).replace(/kkal/gi, "").trim()} kkal`
                    : "-";

                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #FAF6EE", color: "#2E1C14" }}>
                      <td style={{ padding: "10px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid #E8D1A7",
                          }}
                        />
                      </td>
                      <td style={{ padding: "10px" }}>
                        <strong style={{ display: "block", color: "#734F31" }}>{item.name}</strong>
                        {item.popular && (
                          <span style={{ fontSize: "10px", backgroundColor: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>
                            Rekomendasi
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "10px", textTransform: "capitalize", color: "#64748B" }}>
                        {item.category}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ backgroundColor: "#FAF6EE", border: "1px solid #E8D1A7", color: "#734F31", fontSize: "11px", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                          {item.spicyLevel || "Tidak Pedas"}
                        </span>
                      </td>
                      <td style={{ padding: "10px", color: "#64748B", fontWeight: "600" }}>
                        {cleanCalories}
                      </td>
                      <td style={{ padding: "10px", fontWeight: "800", color: "#734F31", whiteSpace: "nowrap" }}>
                        Rp {item.price.toLocaleString("id-ID")}
                      </td>
                      <td style={{ padding: "10px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          style={{
                            padding: "5px 12px",
                            backgroundColor: "#FAF6EE",
                            color: "#734F31",
                            border: "1px solid #E8D1A7",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                            marginRight: "6px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          style={{
                            padding: "5px 12px",
                            backgroundColor: "#FEF2F2",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}