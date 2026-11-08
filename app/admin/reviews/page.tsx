"use client";

import React, { useEffect, useState } from "react";

interface ReviewItem {
    id: string;
    name: string;
    city: string;
    rating: number;
    comment: string;
    reply?: string | null;
    timeAgo?: string;
    createdAt?: string;
}

    const defaultSampleReviews: ReviewItem[] = [
    {
        id: "sample-1",
        name: "Marcello Kwandinata",
        city: "Jakarta Utara",
        rating: 5,
        timeAgo: "Hari ini",
        comment:
        "Makanan nya enak sekali dan minuman nya juga segar harganya sangat worth it",
    },
    {
        id: "sample-2",
        name: "Marcello Kwandinata",
        city: "Jakarta barat",
        rating: 5,
        timeAgo: "Hari ini",
        comment:
        "Soto nya enak sekali dan dagingnya empuk beserta hidangan penutupnya itu sangat worth it dengan harga segitu",
    },
    {
        id: "sample-3",
        name: "Josephine Sherly",
        city: "Jakarta Selatan",
        rating: 5,
        timeAgo: "2 hari lalu",
        comment:
        "Kuah kaldunya beneran wangi kayu manis dan kapulaga asli Banjar. Pas sampai di rumah masih panas banget dan kuahnya dipisah rapi, ga tumpah sama sekali!",
        reply:
        "Terima kasih banyak Kak! Kami selalu memisahkan kuah panas dalam wadah kedap agar rasa rempahnya tetap maksimal.",
    },
    {
        id: "sample-4",
        name: "Calvin Marcello",
        city: "Tangerang Kota",
        rating: 5,
        timeAgo: "Seminggu lalu",
        comment:
        "Porsi ayamnya melimpah, telur bebek rebusnya gurih berpadu pas dengan perkedel kentang. Pengiriman ke Tangerang cepet banget cuma 35 menitan.",
    },
    {
        id: "sample-5",
        name: "Gading Sihol",
        city: "Jakarta Utara",
        rating: 5,
        timeAgo: "2 minggu lalu",
        comment:
        "Rasa autentik nostalgia waktu tugas di Kalsel. Kemasan food grade-nya higienis dan jeruk kuitnya segar banget buat es jeruknya!",
        reply:
        "Wah senang bisa mengobati rindu cita rasa Kalimantan Selatan, Dok! Ditunggu pesanan berikutnya.",
    },
    ];

    export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<ReviewItem[]>(defaultSampleReviews);
    const [loading, setLoading] = useState(true);
    const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState<{ [id: string]: string }>({});

    async function loadReviews() {
        try {
        setLoading(true);
        const res = await fetch("/api/reviews", { cache: "no-store" });
        if (res.ok) {
            const dbReviews: ReviewItem[] = await res.json();
            if (Array.isArray(dbReviews) && dbReviews.length > 0) {
            setReviews([...dbReviews, ...defaultSampleReviews]);
            } else {
            setReviews(defaultSampleReviews);
            }
        } else {
            setReviews(defaultSampleReviews);
        }
        } catch (err) {
        console.error("Gagal memuat ulasan:", err);
        setReviews(defaultSampleReviews);
        } finally {
        setLoading(false);
        }
    }

    useEffect(() => {
        queueMicrotask(() => {
        void loadReviews();
        });
    }, []);

    async function handleSendReply(id: string) {
        const text = replyInput[id]?.trim();
        if (!text) return;

        if (id.startsWith("sample-")) {
        setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, reply: text } : r))
        );
        setActiveReplyId(null);
        return;
        }

        try {
        const res = await fetch("/api/reviews", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, reply: text }),
        });

        if (res.ok) {
            setReviews((prev) =>
            prev.map((r) => (r.id === id ? { ...r, reply: text } : r))
            );
            setActiveReplyId(null);
        } else {
            alert("Gagal menyimpan balasan ulasan.");
        }
        } catch {
        alert("Terjadi kendala saat mengirim balasan.");
        }
    }

    async function handleDeleteReview(id: string) {
        if (!confirm("Hapus ulasan pelanggan ini secara permanen?")) return;

        if (id.startsWith("sample-")) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        return;
        }

        try {
        const res = await fetch(`/api/reviews?id=${id}`, { method: "DELETE" });
        if (res.ok) {
            setReviews((prev) => prev.filter((r) => r.id !== id));
        } else {
            alert("Gagal menghapus ulasan.");
        }
        } catch {
        alert("Terjadi kendala saat menghapus ulasan.");
        }
    }

    return (
        <div>
        <div style={{ marginBottom: "24px" }}>
            <h2
            style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "#1E293B",
                margin: "0 0 6px",
                fontFamily: "serif",
            }}
            >
            Kelola Ulasan Pelanggan
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
            Pantau ulasan dari customer dan berikan balasan resmi restoran.
            </p>
        </div>

        <div
            style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "26px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            }}
        >
            <div style={{ marginBottom: "22px" }}>
            <h3
                style={{
                margin: "0 0 4px",
                fontSize: "16px",
                fontWeight: "800",
                color: "#1E293B",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth={2}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Kelola &amp; Balas Ulasan Pelanggan
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
                Baca ulasan customer dan kirimkan respon resmi restoran yang langsung tampil di website.
            </p>
            </div>

            {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: "13px" }}>
                Memuat daftar testimoni...
            </div>
            ) : reviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: "13px" }}>
                Belum ada ulasan customer yang masuk.
            </div>
            ) : (
            <div
                style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
                }}
            >
                {reviews.map((rev) => (
                <div
                    key={rev.id}
                    style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "14px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                >
                    <div>
                    {/* Rating Stars */}
                    <div
                        style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                        }}
                    >
                        <div style={{ color: "#F59E0B", fontSize: "15px", letterSpacing: "2px" }}>
                        {"★".repeat(rev.rating || 5)}
                        </div>
                        <span
                        style={{
                            fontSize: "10px",
                            color: "#64748B",
                            backgroundColor: "#F1F5F9",
                            padding: "2px 8px",
                            borderRadius: "10px",
                        }}
                        >
                        {rev.timeAgo || "Hari ini"}
                        </span>
                    </div>

                    {/* Isi Review */}
                    <p
                        style={{
                        fontSize: "13px",
                        color: "#475569",
                        lineHeight: "1.6",
                        margin: "0 0 16px",
                        fontStyle: "italic",
                        }}
                    >
                        &ldquo;{rev.comment}&rdquo;
                    </p>

                    {/* Identitas Customer */}
                    <div style={{ marginBottom: "14px" }}>
                        <strong style={{ fontSize: "13px", color: "#0F172A", display: "block" }}>
                        {rev.name}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>
                        {rev.city || "Jakarta"}
                        </span>
                    </div>

                    {/* Balasan */}
                    {rev.reply && (
                        <div
                        style={{
                            backgroundColor: "#F8FAFC",
                            borderLeft: "3px solid #1E293B",
                            padding: "10px 12px",
                            borderRadius: "0 8px 8px 0",
                            fontSize: "11px",
                            marginBottom: "14px",
                        }}
                        >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <strong style={{ color: "#0F172A", display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <polyline points="9 10 4 15 9 20" />
                                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                            </svg>
                            Balasan Anda (Restoran):
                            </strong>
                            <button
                            type="button"
                            onClick={() => {
                                setActiveReplyId(rev.id);
                                setReplyInput({ ...replyInput, [rev.id]: rev.reply || "" });
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#64748B",
                                fontSize: "10px",
                                cursor: "pointer",
                                textDecoration: "underline",
                            }}
                            >
                            Edit Balasan
                            </button>
                        </div>
                        <span style={{ color: "#475569", lineHeight: "1.5" }}>{rev.reply}</span>
                        </div>
                    )}

                    {/* Form Input Balasan */}
                    {activeReplyId === rev.id && (
                        <div style={{ marginBottom: "14px" }}>
                        <textarea
                            rows={2}
                            placeholder="Ketik balasan resmi dari restoran..."
                            value={replyInput[rev.id] || ""}
                            onChange={(e) =>
                            setReplyInput({ ...replyInput, [rev.id]: e.target.value })
                            }
                            style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "8px",
                            border: "1px solid #CBD5E1",
                            fontSize: "12px",
                            color: "#1E293B",
                            outline: "none",
                            boxSizing: "border-box",
                            }}
                        />
                        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                            <button
                            type="button"
                            onClick={() => handleSendReply(rev.id)}
                            style={{
                                padding: "6px 12px",
                                backgroundColor: "#166534",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "700",
                                cursor: "pointer",
                            }}
                            >
                            Simpan Balasan
                            </button>
                            <button
                            type="button"
                            onClick={() => setActiveReplyId(null)}
                            style={{
                                padding: "6px 10px",
                                backgroundColor: "#F1F5F9",
                                color: "#475569",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "11px",
                                cursor: "pointer",
                            }}
                            >
                            Batal
                            </button>
                        </div>
                        </div>
                    )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #F1F5F9", paddingTop: "12px" }}>
                    <button
                        type="button"
                        onClick={() => {
                        setActiveReplyId(rev.id);
                        setReplyInput({ ...replyInput, [rev.id]: rev.reply || "" });
                        }}
                        style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        backgroundColor: "#1E293B",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        }}
                    >
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="9 10 4 15 9 20" />
                        <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                        </svg>
                        <span>{rev.reply ? "Edit Balasan" : "Balas Ulasan Ini"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        style={{
                        padding: "8px 14px",
                        backgroundColor: "#DC2626",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        }}
                    >
                        Hapus Ulasan
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
}