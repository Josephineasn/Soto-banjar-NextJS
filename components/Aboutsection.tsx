"use client";

import React, { useEffect, useState } from "react";

export default function Aboutsection() {
  const [about, setAbout] = useState({
    aboutBadge: "FILOSOFI RASA",
    aboutTitle: "Warisan Cita Rasa Hangat dari Bumi Kalimantan",
    aboutHighlight: "Bumi Kalimantan",
    aboutParagraph1:
      "Soto Banjar Selera Nusantara berakar dari kecintaan kami melestarikan kuliner legendaris khas Banjarmasin. Kunci kelezatan sup kami terletak pada simfoni rempah aromatik pilihan: kayu manis, cengkeh, kapulaga, pala, dan bunga lawang yang ditumis harum dengan mentega berkualitas sebelum dipadukan ke dalam rebusan kaldu murni.",
    aboutParagraph2:
      "Kami hanya menggunakan 100% ayam kampung segar yang menghasilkan kaldu gurih alami tanpa bahan pengawet. Disajikan lengkap bersama ketupat lembut, perkedel kentang legit, suwiran ayam tebal, telur bebek rebus, serta kucuran perasan jeruk kuit khas yang harum menyegarkan.",
    feature1Title: "Ayam Kampung Asli",
    feature1Desc:
      "Daging manis alami berpadu kaldu gurih kaya nutrisi rempah.",
    feature2Title: "Jeruk Kuit Segar",
    feature2Desc: "Aroma sitrus khas Banjar yang autentik dan menyegarkan.",
    aboutImage:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80",
    aboutImageTitle: "100% Rempah Asli",
    aboutImageCaption: "Resep Turun-Temurun Kalimantan",
  });

  useEffect(() => {
    async function loadAbout() {
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.about) setAbout((prev) => ({ ...prev, ...data.about }));
          return;
        }
      } catch {
        // Fallback localStorage
      }
      try {
        const saved = localStorage.getItem("soto_site_content");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.about) setAbout((prev) => ({ ...prev, ...parsed.about }));
        }
      } catch {
        // Abaikan
      }
    }

    void loadAbout();
    window.addEventListener("soto-content-updated", loadAbout);
    return () => window.removeEventListener("soto-content-updated", loadAbout);
  }, []);

  function renderHighlightedText(text: string, highlight: string) {
    if (!highlight || !text.includes(highlight)) {
      return <span>{text}</span>;
    }
    const parts = text.split(highlight);
    return (
      <span>
        {parts[0]}
        <span style={{ color: "#EFE3C8" }}>{highlight}</span>
        {parts[1]}
      </span>
    );
  }

  return (
    <section
      id="tentang"
      style={{
        backgroundColor: "#FAF6EE",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1060px",
          margin: "0 auto",
          backgroundColor: "#362214",
          borderRadius: "28px",
          border: "2px solid #6D4C30",
          padding: "48px 44px",
          boxShadow: "0 22px 50px rgba(42, 26, 17, 0.22)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "44px",
            alignItems: "center",
          }}
        >
          {/* KIRI: Bingkai Foto Persegi Membulat + Badge Overlay Kanan Bawah */}
          <div
            style={{
              position: "relative",
              borderRadius: "22px",
              padding: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1.5px solid rgba(232, 209, 167, 0.3)",
            }}
          >
            <div
              style={{
                position: "relative",
                height: "330px",
                width: "100%",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={about.aboutImage}
                alt="Filosofi Soto Banjar"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {/* Kotak Overlay di Pojok Kanan Bawah Foto */}
              <div
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "14px",
                  left: "90px",
                  backgroundColor: "rgba(54, 34, 20, 0.92)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(232, 209, 167, 0.35)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.35)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    color: "#FAF6EE",
                    marginBottom: "2px",
                  }}
                >
                  {about.aboutImageTitle || "100% Rempah Asli"}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#D5C5B3",
                    fontWeight: 600,
                  }}
                >
                  {about.aboutImageCaption || "Resep Turun-Temurun Kalimantan"}
                </div>
              </div>
            </div>
          </div>

          {/* KANAN: Teks Filosofi Rasa & 2 Kotak Keunggulan */}
          <div>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(232, 209, 167, 0.4)",
                color: "#EFE3C8",
                fontSize: "11px",
                fontWeight: 800,
                padding: "5px 14px",
                borderRadius: "999px",
                letterSpacing: "0.5px",
                marginBottom: "14px",
              }}
            >
              {about.aboutBadge}
            </div>

            <h2
              style={{
                margin: "0 0 16px",
                fontSize: "clamp(26px, 3vw, 34px)",
                fontWeight: 900,
                color: "#FAF6EE",
                lineHeight: 1.22,
              }}
            >
              {renderHighlightedText(about.aboutTitle, about.aboutHighlight)}
            </h2>

            <p
              style={{
                margin: "0 0 14px",
                fontSize: "13.5px",
                color: "#D5C5B3",
                lineHeight: 1.75,
              }}
            >
              {about.aboutParagraph1}
            </p>

            <p
              style={{
                margin: "0 0 22px",
                fontSize: "13.5px",
                color: "#D5C5B3",
                lineHeight: 1.75,
              }}
            >
              {about.aboutParagraph2}
            </p>

            <div
              style={{
                borderTop: "1px solid rgba(232, 209, 167, 0.18)",
                paddingTop: "18px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "14px",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(232, 209, 167, 0.25)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                }}
              >
                <strong
                  style={{
                    fontSize: "13.5px",
                    color: "#FAF6EE",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {about.feature1Title}
                </strong>
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "#C4B29E",
                    lineHeight: 1.5,
                    display: "block",
                  }}
                >
                  {about.feature1Desc}
                </span>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(232, 209, 167, 0.25)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                }}
              >
                <strong
                  style={{
                    fontSize: "13.5px",
                    color: "#FAF6EE",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  {about.feature2Title}
                </strong>
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "#C4B29E",
                    lineHeight: 1.5,
                    display: "block",
                  }}
                >
                  {about.feature2Desc}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}