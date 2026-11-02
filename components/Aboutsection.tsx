"use client";

import React from "react";

export default function AboutSection() {
    return (
        <section
        id="tentang-kami"
        style={{
            backgroundColor: "#182c23",
            color: "#ffffff",
            padding: "80px 24px",
        }}
        >
        <div
            style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "50px",
            alignItems: "center",
            }}
        >
            <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto" }}>
            <div
                style={{
                borderRadius: "28px",
                overflow: "hidden",
                border: "6px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
                aspectRatio: "4/3",
                }}
            >
                <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                alt="Soto Banjar Otentik"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
            </div>

            {/* Floating Badge */}
            <div
                style={{
                position: "absolute",
                bottom: "-20px",
                right: "20px",
                backgroundColor: "#223c31",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "16px",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                }}
            >
                <span style={{ fontSize: "24px" }}>🥣</span>
                <div>
                <h4 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#ffffff" }}>
                    100% Rempah Asli
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#95ad9e" }}>
                    Resep Turun-Temurun Kalimantan
                </p>
                </div>
            </div>
            </div>

            <div>
            <div
                style={{
                display: "inline-block",
                background: "rgba(234, 88, 12, 0.15)",
                border: "1px solid #ea580c",
                color: "#fb923c",
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase",
                padding: "5px 14px",
                borderRadius: "20px",
                marginBottom: "16px",
                letterSpacing: "0.5px",
                }}
            >
                🍴 Filosofi Rasa
            </div>

            <h2
                style={{
                fontSize: "34px",
                fontWeight: "900",
                lineHeight: "1.25",
                color: "#ffffff",
                marginBottom: "18px",
                }}
            >
                Warisan Cita Rasa Hangat dari <br />
                <span style={{ color: "#f97316" }}>Bumi Kalimantan</span>
            </h2>

            <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#c2d1c7", marginBottom: "14px" }}>
                Soto Banjar Selera Nusantara berakar dari kecintaan kami melestarikan kuliner legendaris khas Banjarmasin. Kunci kelezatan sup kami terletak pada simfoni rempah aromatik pilihan: kayu manis, cengkeh, kapulaga, pala, dan bunga lawang yang ditumis harum dengan mentega berkualitas sebelum dipadukan ke dalam rebusan kaldu murni.
            </p>

            <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#c2d1c7", marginBottom: "30px" }}>
                Kami hanya menggunakan 100% ayam kampung segar yang menghasilkan kaldu gurih alami tanpa bahan pengawet. Disajikan lengkap bersama ketupat lembut, perkedel kentang legit, suwiran ayam tebal, telur bebek rebus, serta kucuran perasan jeruk kuit khas yang harum menyegarkan.
            </p>

            {/* Kotak Highlight Bawah */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "14px",
                    padding: "16px",
                }}
                >
                <h4 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>
                    Ayam Kampung Asli
                </h4>
                <p style={{ margin: 0, fontSize: "11px", color: "#95ad9e", lineHeight: "1.5" }}>
                    Daging manis alami berpadu kaldu gurih kaya nutrisi rempah.
                </p>
                </div>

                <div
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "14px",
                    padding: "16px",
                }}
                >
                <h4 style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#ffffff" }}>
                    Jeruk Kuit Segar
                </h4>
                <p style={{ margin: 0, fontSize: "11px", color: "#95ad9e", lineHeight: "1.5" }}>
                    Aroma sitrus khas Banjar yang autentik dan menyegarkan.
                </p>
                </div>
            </div>
            </div>
        </div>
        </section>
    );
}