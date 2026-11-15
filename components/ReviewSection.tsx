"use client";

import React, { useEffect, useMemo, useState } from "react";

interface ReviewItem {
  id: number | string;
  name: string;
  customerName?: string;
  city?: string;
  area?: string;
  rating: number;
  comment: string;
  reply?: string | null;
  adminReply?: string | null;
  showOnWebsite?: boolean;
  createdAt?: string;
}

interface ReviewSectionProps {
  currentUser?: { name: string; role: string } | null;
  onRequireAuth?: () => void;
}

export default function ReviewSection({
  currentUser,
  onRequireAuth,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [starFilter, setStarFilter] = useState<number | "ALL">("ALL");
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // State Modal Tulis Ulasan
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [cityInput, setCityInput] = useState<string>("Jakarta Selatan");
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // State Notifikasi Berhasil Kirim (Menunggu Acc Admin)
  const [submitNotice, setSubmitNotice] = useState<boolean>(false);

  function formatDisplayDate(dateStr?: string): string {
    if (!dateStr) return "Hari ini";
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      return dateStr; // Biarkan teks seperti "Hari ini", "2 hari lalu", dll.
    }
    return parsed.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function loadReviews() {
      try {
        // Hanya mengambil ulasan yang sudah disetujui admin (?public=true)
        const res = await fetch("/api/reviews?public=true", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const raw: unknown = await res.json();
        if (Array.isArray(raw) && isMounted) {
          const approvedList: ReviewItem[] = (raw as ReviewItem[])
            .filter((r) => r.showOnWebsite !== false)
            .map((r, idx) => ({
              id: r.id ?? idx + 1,
              name: r.name || r.customerName || "Pelanggan Setia",
              city: r.city || r.area || "Jakarta Selatan",
              rating: Number(r.rating ?? 5),
              comment: r.comment || "",
              reply: r.reply || r.adminReply || null,
              createdAt: formatDisplayDate(r.createdAt),
            }));

          setReviews(approvedList);
        }
      } catch {
        // Abaikan jika gagal memuat
      }
    }

    void loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    if (starFilter === "ALL") return reviews;
    return reviews.filter((r) => Math.round(r.rating) === starFilter);
  }, [reviews, starFilter]);

  const total = filteredReviews.length;
  const safeIndex = total > 0 ? ((activeIndex % total) + total) % total : 0;

  function handleSelectStar(star: number | "ALL") {
    setStarFilter(star);
    setActiveIndex(0);
  }

  function handlePrev() {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }

  function handleNext() {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }

  function getRelativePosition(
    index: number
  ): "center" | "left" | "right" | "hidden" {
    if (total === 0) return "hidden";
    if (index === safeIndex) return "center";
    if (total === 1) return "hidden";

    const leftIdx = (safeIndex - 1 + total) % total;
    const rightIdx = (safeIndex + 1) % total;

    if (index === leftIdx) return "left";
    if (index === rightIdx && total >= 3) return "right";
    return "hidden";
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth?.();
      return;
    }
    if (!commentInput.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: currentUser.name,
        customerName: currentUser.name,
        city: cityInput,
        rating: ratingInput,
        comment: commentInput.trim(),
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // TIDAK langsung dimasukkan ke state `reviews` di layar customer,
        // karena harus di-acc oleh Admin terlebih dahulu.
        setCommentInput("");
        setRatingInput(5);
        setModalOpen(false);
        setSubmitNotice(true);
      }
    } catch {
      // Abaikan
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="ulasan"
      style={{
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "56px 24px",
      }}
    >
      {/* Header Ulasan */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <div>
          <span
            style={{
              display: "inline-block",
              backgroundColor: "#EFE6D5",
              color: "#734F31",
              padding: "5px 14px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 900,
              letterSpacing: "0.6px",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            KATA MEREKA
          </span>
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "34px",
              fontWeight: 900,
              color: "#3E2723",
              fontFamily: "Georgia, serif",
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
          onClick={() => {
            if (!currentUser) {
              onRequireAuth?.();
            } else {
              setModalOpen(true);
            }
          }}
          style={{
            padding: "12px 22px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#A47E53",
            color: "#FFFFFF",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(164, 126, 83, 0.3)",
          }}
        >
          ✎ Tulis Ulasan Anda
        </button>
      </div>

      {/* Bar Filter Bintang */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1.5px solid #E8D1A7",
        }}
      >
        <button
          type="button"
          onClick={() => handleSelectStar("ALL")}
          style={{
            padding: "8px 16px",
            borderRadius: "30px",
            border:
              starFilter === "ALL"
                ? "1.5px solid #734F31"
                : "1px solid #D6C7B2",
            backgroundColor: starFilter === "ALL" ? "#734F31" : "#FFFFFF",
            color: starFilter === "ALL" ? "#FFFFFF" : "#432818",
            fontSize: "12px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Semua ({reviews.length})
        </button>

        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter(
            (r) => Math.round(r.rating) === star
          ).length;
          const active = starFilter === star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => handleSelectStar(star)}
              style={{
                padding: "8px 15px",
                borderRadius: "30px",
                border: active ? "1.5px solid #D97706" : "1px solid #D6C7B2",
                backgroundColor: active ? "#FEF3C7" : "#FFFFFF",
                color: active ? "#92400E" : "#432818",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span style={{ color: "#F59E0B" }}>★</span>
              <span>{star}</span>
              <span style={{ fontSize: "11px", opacity: 0.75 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* STAGE CAROUSEL */}
      {filteredReviews.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px dashed #D6C7B2",
            color: "#734F31",
            fontWeight: 700,
          }}
        >
          {starFilter === "ALL"
            ? "Belum ada ulasan yang ditampilkan."
            : `Belum ada ulasan untuk filter bintang ${starFilter}.`}
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            height: "390px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "10px 0",
          }}
        >
          {/* TOMBOL GESER KIRI */}
          {total > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Ulasan Sebelumnya"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 45,
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid #E8D1A7",
                backgroundColor: "#734F31",
                color: "#FAF6EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 8px 22px rgba(67, 40, 24, 0.28)",
                transition: "all 0.2s ease",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* KOTAK-KOTAK ULASAN */}
          {filteredReviews.map((rev, idx) => {
            const pos = getRelativePosition(idx);
            if (pos === "hidden") return null;

            const isCenter = pos === "center";
            const isLeft = pos === "left";

            const translateX = isCenter ? "0%" : isLeft ? "-84%" : "84%";
            const scale = isCenter ? 1.05 : 0.82;
            const opacity = isCenter ? 1 : 0.58;
            const zIndex = isCenter ? 30 : 15;

            return (
              <div
                key={`${rev.id}-${idx}`}
                onClick={() => {
                  if (pos === "left") handlePrev();
                  if (pos === "right") handleNext();
                }}
                style={{
                  position: "absolute",
                  width: "100%",
                  maxWidth: "420px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "24px",
                  padding: "26px",
                  border: isCenter
                    ? "2px solid #9D9167"
                    : "1px solid #EAE3D5",
                  boxShadow: isCenter
                    ? "0 22px 45px rgba(67, 40, 24, 0.16)"
                    : "0 8px 20px rgba(0, 0, 0, 0.05)",
                  transform: `translateX(${translateX}) scale(${scale})`,
                  opacity,
                  zIndex,
                  cursor: isCenter ? "default" : "pointer",
                  transition:
                    "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: "290px",
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
                    <div
                      style={{
                        color: "#F59E0B",
                        fontSize: "16px",
                        letterSpacing: "2px",
                      }}
                    >
                      {"★".repeat(Math.max(1, Math.min(5, rev.rating)))}
                      <span style={{ color: "#E2E8F0" }}>
                        {"★".repeat(5 - Math.max(1, Math.min(5, rev.rating)))}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#94A3B8",
                        fontWeight: 600,
                      }}
                    >
                      {rev.createdAt || "Hari ini"}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: "0 0 18px",
                      fontSize: isCenter ? "14.5px" : "13.5px",
                      lineHeight: 1.65,
                      color: "#1E293B",
                      fontWeight: isCenter ? 500 : 400,
                    }}
                  >
                    &ldquo;{rev.comment}&rdquo;
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
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: "#162A22",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "14px",
                      }}
                    >
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 800,
                          color: "#0F172A",
                        }}
                      >
                        {rev.name}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                        📍 {rev.city || "Jakarta"}
                      </div>
                    </div>
                  </div>

                  {rev.reply && (
                    <div
                      style={{
                        marginTop: "12px",
                        backgroundColor: "#F8FAFC",
                        borderLeft: "3.5px solid #198754",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        fontSize: "12px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#15803D",
                          marginBottom: "2px",
                        }}
                      >
                        ↳ Respon Pemilik Restoran:
                      </div>
                      <div style={{ color: "#475569" }}>{rev.reply}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* TOMBOL GESER KANAN */}
          {total > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Ulasan Selanjutnya"
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 45,
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid #E8D1A7",
                backgroundColor: "#734F31",
                color: "#FAF6EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 8px 22px rgba(67, 40, 24, 0.28)",
                transition: "all 0.2s ease",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Indikator Dot di Bawah */}
      {total > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "14px",
          }}
        >
          {filteredReviews.map((rev, i) => (
            <button
              key={`${rev.id}-dot-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              style={{
                width: safeIndex === i ? "28px" : "9px",
                height: "9px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: safeIndex === i ? "#734F31" : "#D6C7B2",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              title={`Ulasan ${rev.name}`}
            />
          ))}
        </div>
      )}

      {/* Modal Form Tulis Ulasan */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <form
            onSubmit={handleSubmitReview}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#FFFFFF",
              borderRadius: "22px",
              padding: "26px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "19px",
                fontWeight: 900,
                color: "#432818",
              }}
            >
              Bagikan Ulasan Anda
            </h3>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "6px",
                }}
              >
                Pilih Rating Bintang
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRatingInput(num)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      borderRadius: "10px",
                      border:
                        ratingInput >= num
                          ? "1.5px solid #F59E0B"
                          : "1px solid #CBD5E1",
                      backgroundColor:
                        ratingInput >= num ? "#FEF3C7" : "#FFFFFF",
                      color: ratingInput >= num ? "#D97706" : "#64748B",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {num} ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "6px",
                }}
              >
                Kota / Wilayah Anda
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 800,
                  marginBottom: "6px",
                }}
              >
                Komentar Ulasan
              </label>
              <textarea
                rows={3}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Ceritakan pengalaman rasa dan layanan pengiriman kami..."
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  backgroundColor: "#FFFFFF",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#734F31",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {submitting ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pemberitahuan Menunggu Persetujuan Admin */}
      {submitNotice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
            zIndex: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSubmitNotice(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "380px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "24px",
              textAlign: "center",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#DCFCE7",
                color: "#166534",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                fontSize: "22px",
                fontWeight: 900,
              }}
            >
              ✓
            </div>
            <h4
              style={{
                margin: "0 0 6px",
                fontSize: "17px",
                fontWeight: 900,
                color: "#2A1A11",
              }}
            >
              Ulasan Terkirim!
            </h4>
            <p
              style={{
                margin: "0 0 18px",
                fontSize: "13px",
                color: "#6D4C30",
                lineHeight: 1.5,
              }}
            >
              Terima kasih atas ulasan Anda. Ulasan telah dikirim ke Admin dan akan tampil di halaman utama setelah disetujui.
            </p>
            <button
              type="button"
              onClick={() => setSubmitNotice(false)}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#734F31",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </section>
  );
}