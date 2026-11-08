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
 }

    interface ReviewSectionProps {
    currentUser?: { name: string; role: string } | null;
    onRequireAuth?: () => void;
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

    export default function ReviewSection({
    currentUser,
    onRequireAuth,
    }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<ReviewItem[]>(defaultSampleReviews);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [authWarningOpen, setAuthWarningOpen] = useState(false);

    // Form State
    const [city, setCity] = useState("Jakarta Selatan");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

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
        } catch {
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

    function handleOpenReviewModal() {
        if (!currentUser) {
        setAuthWarningOpen(true);
        return;
        }
        setModalOpen(true);
    }

    async function handleSubmitReview(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser || !comment.trim()) return;

        try {
        setSubmitting(true);
        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            name: currentUser.name,
            city: city.trim() || "Jakarta",
            rating: Number(rating),
            comment: comment.trim(),
            }),
        });

        if (res.ok) {
            setComment("");
            setModalOpen(false);
            await loadReviews();
        } else {
            alert("Gagal mengirim ulasan.");
        }
        } catch {
        alert("Terjadi kendala jaringan saat mengirim ulasan.");
        } finally {
        setSubmitting(false);
        }
    }

    return (
        <section
        id="ulasan"
        style={{
            backgroundColor: "#FAF6EE",
            padding: "80px 24px 90px",
            fontFamily: "system-ui, -apple-system, sans-serif",
        }}
        >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "36px",
                flexWrap: "wrap",
                gap: "20px",
            }}
            >
            <div>
                <div
                style={{
                    display: "inline-block",
                    backgroundColor: "#E8D1A7",
                    color: "#734F31",
                    fontSize: "11px",
                    fontWeight: "800",
                    letterSpacing: "0.8px",
                    padding: "4px 14px",
                    borderRadius: "20px",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                }}
                >
                KATA MEREKA
                </div>
                <h2
                style={{
                    margin: "0 0 8px",
                    fontSize: "36px",
                    fontWeight: "900",
                    color: "#2E1C14",
                    fontFamily: "serif",
                }}
                >
                Ulasan Pelanggan
                </h2>
                <p style={{ margin: 0, fontSize: "14px", color: "#64748B" }}>
                Apa kata penikmat setia Soto Banjar Selera Nusantara.
                </p>
            </div>

            <button
                type="button"
                onClick={handleOpenReviewModal}
                style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#C28955",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(194, 137, 85, 0.35)",
                }}
            >
                <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>Tulis Ulasan Anda</span>
            </button>
            </div>

            {/* Grid Kartu Ulasan */}
            {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#9D9167" }}>
                Memuat ulasan pelanggan...
            </div>
            ) : (
            <div
                style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "22px",
                }}
            >
                {reviews.map((item) => {
                const initialLetter = item.name ? item.name.charAt(0).toUpperCase() : "U";

                return (
                    <div
                    key={item.id}
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: "16px",
                        border: "1px solid #E2E8F0",
                        padding: "24px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                    >
                    <div>
                        <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                        }}
                        >
                        <div style={{ color: "#F59E0B", fontSize: "16px", letterSpacing: "2px" }}>
                            {"★".repeat(item.rating || 5)}
                        </div>
                        <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: "600" }}>
                            {item.timeAgo || "Hari ini"}
                        </span>
                        </div>

                        <p style={{ fontSize: "13px", lineHeight: "1.7", color: "#475569", margin: "0 0 18px" }}>
                        &ldquo;{item.comment}&rdquo;
                        </p>
                    </div>

                    <div>
                        <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            borderTop: "1px solid #F1F5F9",
                            paddingTop: "14px",
                        }}
                        >
                        <div
                            style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            backgroundColor: "#16231C",
                            color: "#FAF6EE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "800",
                            flexShrink: 0,
                            }}
                        >
                            {initialLetter}
                        </div>
                        <div>
                            <strong style={{ fontSize: "13px", color: "#1E293B", display: "block" }}>
                            {item.name}
                            </strong>
                            <span style={{ fontSize: "11px", color: "#94A3B8", display: "flex", alignItems: "center", gap: "3px", marginTop: "3px" }}>
                            <span style={{ color: "#EF4444", fontSize: "10px" }}>📍</span>
                            {item.city}
                            </span>
                        </div>
                        </div>

                        {item.reply && (
                        <div
                            style={{
                            marginTop: "14px",
                            backgroundColor: "#F8FAFC",
                            borderLeft: "3px solid #166534",
                            borderRadius: "0 8px 8px 0",
                            padding: "10px 14px",
                            }}
                        >
                            <strong style={{ fontSize: "11px", color: "#166534", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                                <polyline points="9 10 4 15 9 20" />
                                <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                            </svg>
                            Respon Pemilik Restoran:
                            </strong>
                            <p style={{ margin: 0, fontSize: "11px", lineHeight: "1.5", color: "#475569" }}>
                            {item.reply}
                            </p>
                        </div>
                        )}
                    </div>
                    </div>
                );
                })}
            </div>
            )}
        </div>

        {/* Wajib Login */}
        {authWarningOpen && (
            <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.65)",
                zIndex: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
            onClick={() => setAuthWarningOpen(false)}
            >
            <div
                style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "#FFFFFF",
                borderRadius: "18px",
                padding: "28px",
                textAlign: "center",
                border: "1.5px solid #E8D1A7",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    backgroundColor: "#FEF3C7",
                    color: "#B45309",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                }}
                >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                </div>

                <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "900", color: "#1E293B" }}>
                Silakan Masuk / Buat Akun
                </h3>
                <p style={{ margin: "0 0 22px", fontSize: "13px", color: "#64748B", lineHeight: "1.6" }}>
                Hanya pelanggan yang telah masuk akun yang dapat <strong>memesan sajian</strong> dan <strong>memberikan ulasan</strong> cita rasa restoran.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                    type="button"
                    onClick={() => {
                    setAuthWarningOpen(false);
                    if (onRequireAuth) onRequireAuth();
                    }}
                    style={{
                    width: "100%",
                    padding: "11px",
                    backgroundColor: "#734F31",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    }}
                >
                    Masuk / Buat Akun Sekarang
                </button>
                <button
                    type="button"
                    onClick={() => setAuthWarningOpen(false)}
                    style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#F1F5F9",
                    color: "#64748B",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    }}
                >
                    Nanti Saja
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Modal Form Ulasan */}
        {modalOpen && currentUser && (
            <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.65)",
                zIndex: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
            onClick={() => setModalOpen(false)}
            >
            <div
                style={{
                width: "100%",
                maxWidth: "460px",
                backgroundColor: "#FFFFFF",
                borderRadius: "20px",
                padding: "28px",
                border: "1.5px solid #E8D1A7",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px",
                }}
                >
                <div>
                    <h4 style={{ margin: 0, fontSize: "19px", fontWeight: "900", color: "#2E1C14" }}>
                    Tulis Ulasan Anda
                    </h4>
                    <span style={{ fontSize: "12px", color: "#9D9167" }}>
                    Akun: <strong>{currentUser.name}</strong>
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{
                    background: "none",
                    border: "none",
                    fontSize: "18px",
                    color: "#64748B",
                    cursor: "pointer",
                    fontWeight: "bold",
                    }}
                >
                    ✕
                </button>
                </div>

                <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#734F31", marginBottom: "4px" }}>
                    Kota / Wilayah Pengiriman
                    </label>
                    <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan, Tangerang, Bekasi"
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FAF6EE",
                        fontSize: "13px",
                        color: "#2E1C14",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#734F31", marginBottom: "4px" }}>
                    Penilaian (Rating Bintang)
                    </label>
                    <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FAF6EE",
                        fontSize: "13px",
                        color: "#2E1C14",
                        fontWeight: "700",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
                    >
                    <option value={5}>★★★★★ (5 Bintang - Sangat Puas)</option>
                    <option value={4}>★★★★☆ (4 Bintang - Puas)</option>
                    <option value={3}>★★★☆☆ (3 Bintang - Cukup)</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#734F31", marginBottom: "4px" }}>
                    Ulasan Rasa, Pengemasan &amp; Layanan
                    </label>
                    <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ceritakan rasa kuah kaldu rempah, suwiran ayam, dan kondisi pesanan saat tiba..."
                    style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FAF6EE",
                        fontSize: "13px",
                        color: "#2E1C14",
                        outline: "none",
                        resize: "none",
                        boxSizing: "border-box",
                    }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#C28955",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: submitting ? "not-allowed" : "pointer",
                    marginTop: "6px",
                    boxShadow: "0 4px 12px rgba(194, 137, 85, 0.3)",
                    }}
                >
                    {submitting ? "Mengirim Ulasan..." : "Kirim Ulasan Sekarang"}
                </button>
                </form>
            </div>
            </div>
        )}
        </section>
    );
}