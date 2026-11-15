"use client";

import React, { useEffect, useState } from "react";

interface FaqItem {
  id: number;
  q: string;
  a: string;
}

export default function Faqsection() {
  const [faqData, setFaqData] = useState<{
    faqBadge: string;
    faqMainTitle: string;
    faqDesc: string;
    faqs: FaqItem[];
  }>({
    faqBadge: "TANYA JAWAB",
    faqMainTitle: "Pertanyaan Umum (FAQ)",
    faqDesc:
      "Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?",
    faqs: [
      {
        id: 1,
        q: "Apakah kuah soto dikirim terpisah agar tidak tumpah?",
        a: "Ya, kuah kaldu rempah dikemas khusus menggunakan mangkuk/standing pouch tahan panas berlapis rapat yang disegel rapi terpisah dari ketupat, suwiran ayam, dan perkedel untuk menjaga kesegaran dan menghindari tumpah di jalan.",
      },
      {
        id: 2,
        q: "Berapa lama waktu pengantaran di wilayah Jabodetabek?",
        a: "Rata-rata pengantaran berkisar antara 30 hingga 45 menit tergantung jarak wilayah pengantaran. Kurir kami akan segera meluncur setelah dapur selesai menyiapkan pesanan Anda.",
      },
      {
        id: 3,
        q: "Apakah seluruh menu dijamin 100% Halal?",
        a: "Semua menu dijamin 100% Halal. Kami menggunakan ayam kampung segar pilihan, rempah alami Nusantara, dan telur bebek berkualitas tanpa bahan pengawet atau non-halal.",
      },
      {
        id: 4,
        q: "Metode pembayaran apa saja yang didukung?",
        a: "Kami melayani pembayaran melalui Virtual Account Bank (BCA, Mandiri) dan Saldo E-Wallet (GoPay, OVO, ShopeePay, DANA) yang diproses secara instan dan otomatis.",
      },
    ],
  });

  const [openIds, setOpenIds] = useState<{ [id: number]: boolean }>({
    1: true,
    2: false,
    3: false,
    4: false,
  });

  useEffect(() => {
    async function loadFaq() {
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.faq) setFaqData((prev) => ({ ...prev, ...data.faq }));
          return;
        }
      } catch {
        // Fallback localStorage
      }
      try {
        const saved = localStorage.getItem("soto_site_content");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.faq) setFaqData((prev) => ({ ...prev, ...parsed.faq }));
        }
      } catch {
        // Abaikan
      }
    }

    void loadFaq();
    window.addEventListener("soto-content-updated", loadFaq);
    return () => window.removeEventListener("soto-content-updated", loadFaq);
  }, []);

  return (
    <section
      id="faq"
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "60px 24px",
      }}
    >
      <div
        style={{
          display: "inline-block",
          backgroundColor: "rgba(232, 209, 167, 0.35)",
          border: "1px solid #E8D1A7",
          color: "#734F31",
          fontSize: "11px",
          fontWeight: "900",
          padding: "4px 14px",
          borderRadius: "20px",
          letterSpacing: "0.5px",
          marginBottom: "10px",
          textTransform: "uppercase",
        }}
      >
        {faqData.faqBadge}
      </div>

      <h2
        style={{
          margin: "0 0 8px",
          fontSize: "32px",
          fontWeight: "900",
          color: "#1E293B",
          fontFamily: "serif",
        }}
      >
        {faqData.faqMainTitle}
      </h2>

      <p style={{ margin: "0 0 28px", fontSize: "14.5px", color: "#64748B" }}>
        {faqData.faqDesc}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {faqData.faqs.map((f) => {
          const isOpen = openIds[f.id] ?? false;
          return (
            <div
              key={f.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
                boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenIds((prev) => ({ ...prev, [f.id]: !isOpen }))
                }
                style={{
                  width: "100%",
                  padding: "18px 22px",
                  backgroundColor: "#FFFFFF",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                  cursor: "pointer",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: "800",
                    color: "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ flexShrink: 0, color: "#734F31" }}
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                  </svg>
                  {f.q}
                </span>
                <span
                  style={{
                    color: "#64748B",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {isOpen ? "∧" : "∨"}
                </span>
              </button>

              {isOpen && (
                <div
                  style={{
                    padding: "0 22px 18px 50px",
                    fontSize: "14px",
                    color: "#64748B",
                    lineHeight: "1.65",
                  }}
                >
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}