"use client";

import React from "react";

export default function Aboutsection() {
    return (
        <section
        id="tentang-kami"
        style={{
            backgroundColor: "#734F31",
            color: "#FAF6EE",
            padding: "90px 24px",
            borderTop: "3px solid #9D9167",
            borderBottom: "3px solid #9D9167",
        }}
        >
        <div
            style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "55px",
            alignItems: "center",
            }}
        >
            {/* Gambar & Label */}
            <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto" }}>
            <div
                style={{
                borderRadius: "28px",
                overflow: "hidden",
                border: "4px solid #E8D1A7",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                aspectRatio: "4/3",
                }}
            >
                <img
                src="https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
                alt="Soto Banjar Otentik"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
            </div>

            <div
                style={{
                position: "absolute",
                bottom: "-20px",
                right: "15px",
                backgroundColor: "#734F31",
                border: "1.5px solid #E8D1A7",
                borderRadius: "18px",
                padding: "14px 20px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
                }}
            >
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "900", color: "#E8D1A7" }}>
                100% Rempah Asli
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#FAF6EE" }}>
                Resep Turun-Temurun Kalimantan
                </p>
            </div>
            </div>

            {/* Narasi Filosofi */}
            <div>
            <div
                style={{
                display: "inline-block",
                background: "rgba(232, 209, 167, 0.2)",
                border: "1.5px solid #E8D1A7",
                color: "#E8D1A7",
                fontSize: "11px",
                fontWeight: "900",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: "30px",
                marginBottom: "18px",
                letterSpacing: "0.5px",
                }}
            >
                FILOSOFI RASA
            </div>

            <h2
                style={{
                fontSize: "36px",
                fontWeight: "900",
                lineHeight: "1.25",
                color: "#E8D1A7",
                marginBottom: "20px",
                }}
            >
                Warisan Cita Rasa Hangat dari <br />
                <span style={{ color: "#FAF6EE" }}>Bumi Kalimantan</span>
            </h2>

            <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#E8D1A7", marginBottom: "14px", opacity: 0.95 }}>
                Soto Banjar Selera Nusantara berakar dari kecintaan kami melestarikan kuliner legendaris khas Banjarmasin. Kunci kelezatan sup kami terletak pada simfoni rempah aromatik pilihan: kayu manis, cengkeh, kapulaga, pala, dan bunga lawang yang ditumis harum dengan mentega berkualitas sebelum dipadukan ke dalam rebusan kaldu murni.
            </p>

            <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#E8D1A7", marginBottom: "32px", opacity: 0.95 }}>
                Kami hanya menggunakan 100% ayam kampung segar yang menghasilkan kaldu gurih alami tanpa bahan pengawet. Disajikan lengkap bersama ketupat lembut, perkedel kentang legit, suwiran ayam tebal, telur bebek rebus, serta kucuran perasan jeruk kuit khas yang harum menyegarkan.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div
                style={{
                    background: "rgba(232, 209, 167, 0.1)",
                    border: "1px solid #E8D1A7",
                    borderRadius: "16px",
                    padding: "18px",
                }}
                >
                <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "800", color: "#E8D1A7" }}>
                    Ayam Kampung Asli
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#FAF6EE", lineHeight: "1.5" }}>
                    Daging manis alami berpadu kaldu gurih kaya nutrisi rempah.
                </p>
                </div>

                <div
                style={{
                    background: "rgba(232, 209, 167, 0.1)",
                    border: "1px solid #E8D1A7",
                    borderRadius: "16px",
                    padding: "18px",
                }}
                >
                <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "800", color: "#E8D1A7" }}>
                    Jeruk Kuit Segar
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#FAF6EE", lineHeight: "1.5" }}>
                    Aroma sitrus khas Banjar yang autentik dan menyegarkan.
                </p>
                </div>
            </div>
            </div>
        </div>
        </section>
    );
    }