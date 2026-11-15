"use client";

import React, { useEffect, useState } from "react";

interface ReviewRecord {
  id: number | string;
  rating: number;
  comment: string;
  customerName?: string;
  name?: string;
  city?: string;
  createdAt?: string;
  adminReply?: string;
  reply?: string;
  showOnWebsite?: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [starFilter, setStarFilter] = useState<string>("ALL");

  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [replyText, setReplyText] = useState<string>("");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/reviews", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as ReviewRecord[];
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Gagal memuat ulasan:", err);
      } finally {
        setLoading(false);
      }
    }

    void fetchReviews();
  }, []);

  function formatReviewDate(dateStr?: string): string {
    if (!dateStr) return "Baru saja";
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      return dateStr; // Kembalikan teks seperti "Hari ini", "2 hari lalu" apa adanya
    }
    return parsed.toLocaleDateString("id-ID");
  }

  async function handleSaveReply(id: number | string) {
    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyText, reply: replyText }),
      });
    } catch {
      // Tetap update state UI meskipun item berasal dari INITIAL_REVIEWS statis
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, adminReply: replyText, reply: replyText } : r
      )
    );
    setEditingId(null);
    setReplyText("");
  }

  async function handleToggleWebDisplay(id: number | string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, showOnWebsite: newStatus } : r))
    );

    try {
      await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnWebsite: newStatus }),
      });
    } catch {
      // Abaikan jika ID statis
    }
  }

  async function handleDeleteReview(id: number | string) {
    if (!confirm("Yakin ingin menghapus ulasan ini?")) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));

    try {
      await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
      });
    } catch {
      // Abaikan jika ID statis
    }
  }

  const filteredReviews = reviews.filter((rev) => {
    if (starFilter === "ALL") return true;
    return Number(rev.rating) === Number(starFilter);
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#FAF6EE" }}>
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
            Kelola Ulasan Pelanggan
          </h1>
          <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#6D4C30" }}>
            Pantau ulasan dari customer, berikan balasan resmi, dan pilih ulasan untuk ditampilkan di web.
          </p>
        </div>
      </header>

      <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "24px",
            border: "1.5px solid #E5DEC9",
            boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 900, color: "#2A1A11" }}>
                Kelola &amp; Balas Ulasan Pelanggan
              </h3>
              <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6D4C30" }}>
                Baca ulasan customer dan kirimkan respon resmi restoran yang langsung tampil di website.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#6D4C30" }}>Filter Bintang:</span>
              <select
                value={starFilter}
                onChange={(e) => setStarFilter(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">Semua Bintang ({reviews.length})</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                <option value="3">⭐⭐⭐ (3 Bintang)</option>
                <option value="2">⭐⭐ (2 Bintang)</option>
                <option value="1">⭐ (1 Bintang)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6D4C30", fontWeight: 700 }}>
              Memuat ulasan pelanggan...
            </div>
          ) : filteredReviews.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#8A6B47", fontWeight: 700 }}>
              Tidak ada ulasan dalam kategori bintang ini.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {filteredReviews.map((rev) => {
                const ratingNum = Number(rev.rating) || 5;
                const starsString = "⭐".repeat(ratingNum);
                const isShow = rev.showOnWebsite ?? true;
                const displayAuthor = rev.customerName || rev.name || "Pelanggan";
                const displayReply = rev.adminReply || rev.reply || "";

                return (
                  <div
                    key={rev.id}
                    style={{
                      backgroundColor: "#FCFBF7",
                      borderRadius: "16px",
                      padding: "20px",
                      border: "1.5px solid #E5DEC9",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", letterSpacing: "1px" }}>{starsString}</span>
                        <span style={{ fontSize: "11px", color: "#8A6B47", fontWeight: 700, backgroundColor: "#F4EFE6", padding: "3px 8px", borderRadius: "12px" }}>
                          {formatReviewDate(rev.createdAt)}
                        </span>
                      </div>

                      <p style={{ margin: "0 0 12px", fontSize: "13.5px", fontStyle: "italic", color: "#2A1A11", lineHeight: 1.5 }}>
                        &ldquo;{rev.comment}&rdquo;
                      </p>

                      <div style={{ fontWeight: 900, fontSize: "13.5px", color: "#2A1A11" }}>
                        {displayAuthor}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#6D4C30" }}>
                        {rev.city || "Jakarta"}
                      </div>

                      {displayReply && editingId !== rev.id && (
                        <div
                          style={{
                            marginTop: "12px",
                            backgroundColor: "#F4EFE6",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            borderLeft: "3px solid #2A1A11",
                            fontSize: "12px",
                          }}
                        >
                          <div style={{ fontWeight: 800, color: "#2A1A11", marginBottom: "3px" }}>
                            ↩ Balasan Anda (Restoran):
                          </div>
                          <div style={{ color: "#432818", lineHeight: 1.4 }}>{displayReply}</div>
                        </div>
                      )}

                      {editingId === rev.id && (
                        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Tulis balasan resmi restoran..."
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "8px",
                              border: "1.5px solid #2A1A11",
                              backgroundColor: "#FFFFFF",
                              fontSize: "12.5px",
                            }}
                          />
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => void handleSaveReply(rev.id)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#166534",
                                color: "#FFFFFF",
                                fontSize: "12px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #CBD5E1",
                                backgroundColor: "#FFFFFF",
                                color: "#475569",
                                fontSize: "12px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: "1px solid #E5DEC9", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 800, color: "#2A1A11" }}>
                        <input
                          type="checkbox"
                          checked={isShow}
                          onChange={() => void handleToggleWebDisplay(rev.id, isShow)}
                          style={{ width: "16px", height: "16px", accentColor: "#166534", cursor: "pointer" }}
                        />
                        <span>Tampilkan di Web Customer</span>
                      </label>

                      <div style={{ display: "flex", gap: "8px" }}>
                        {editingId !== rev.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(rev.id);
                              setReplyText(displayReply);
                            }}
                            style={{
                              flex: 1,
                              padding: "8px 10px",
                              borderRadius: "8px",
                              border: "none",
                              backgroundColor: "#1E293B",
                              color: "#FFFFFF",
                              fontSize: "12px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            {displayReply ? "↩ Edit Balasan" : "↩ Balas Ulasan Ini"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleDeleteReview(rev.id)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#DC2626",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Hapus Ulasan
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}