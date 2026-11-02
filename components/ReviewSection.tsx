"use client";

import React from "react";

const reviews = [
    {
        name: "Marcello",
        comment:
        "Kuahnya kental rempah kapulaganya berasa banget! Dikemas di pouch jadi pas nyampe rumah masih ngebul.",
        rating: 5,
    },
    {
        name: "Calvin Sihol",
        comment:
        "Nasi kuning bumbu habang plus ikan haruan empuk, cemilan amparan tataknya legit manis gurih.",
        rating: 5,
    },
    {
        name: "Josephine Sherly",
        comment:
        "Es limau kuitnya juara segarnya, packing rapi bersih dan kurirnya tepat waktu.",
        rating: 5,
    },
    ];

    export default function ReviewSection() {
    return (
        <section
        id="ulasan"
        style={{
            backgroundColor: "#F3EDE2",
            padding: "90px 24px",
            borderTop: "2px solid #E8D1A7",
            borderBottom: "2px solid #E8D1A7",
        }}
        >
        <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}>
            <div
            style={{
                display: "inline-block",
                background: "rgba(157, 145, 103, 0.2)",
                border: "1.5px solid #9D9167",
                color: "#734F31",
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: "30px",
                marginBottom: "14px",
                letterSpacing: "0.5px",
            }}
            >
            Kata Pelanggan
            </div>

            <h3
            style={{
                fontSize: "34px",
                fontWeight: "900",
                color: "#734F31",
                margin: "0 0 8px",
            }}
            >
            Ulasan Pelanggan Setia
            </h3>
            <p
            style={{
                fontSize: "15px",
                color: "#9D9167",
                margin: "0 0 50px",
                fontWeight: "600",
            }}
            >
            Pengalaman pecinta kuliner asli Banjar yang memesan secara online
            </p>

            {/* Kartu Ulasan */}
            <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "26px",
                textAlign: "left",
            }}
            >
            {reviews.map((rev, idx) => (
                <div
                key={idx}
                style={{
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #E8D1A7",
                    borderRadius: "20px",
                    padding: "26px",
                    boxShadow: "0 6px 20px rgba(115, 79, 49, 0.06)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
                >
                <div>
                    <div
                    style={{
                        color: "#D97706",
                        fontSize: "15px",
                        marginBottom: "14px",
                        letterSpacing: "3px",
                    }}
                    >
                    {"★".repeat(rev.rating)}
                    </div>
                    <p
                    style={{
                        fontSize: "14px",
                        lineHeight: "1.75",
                        color: "#734F31",
                        margin: "0 0 18px",
                        fontStyle: "italic",
                    }}
                    >
                    &ldquo;{rev.comment}&rdquo;
                    </p>
                </div>

                <div
                    style={{
                    borderTop: "1px dashed #E8D1A7",
                    paddingTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    }}
                >
                    <strong style={{ fontSize: "13px", color: "#734F31" }}>
                    {rev.name}
                    </strong>
                    <span style={{ fontSize: "11px", color: "#9D9167", fontWeight: "700" }}>
                    Pembeli Terverifikasi
                    </span>
                </div>
                </div>
            ))}
            </div>
        </div>
        </section>
    );
}