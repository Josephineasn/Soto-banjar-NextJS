"use client";

import React, { useState } from "react";

const faqs = [
    {
        question: "Apakah kuah soto dikirim terpisah agar tidak tumpah?",
        answer:
        "Ya, kuah kaldu rempah dikemas khusus menggunakan standing pouch tahan panas food-grade berlapis rapat dan disegel terpisah dari ketupat, suwiran ayam kampung, dan perkedel untuk menjaga kesegaran serta rasa gurih optimal.",
    },
    {
        question: "Berapa lama waktu pengantaran di wilayah Jabodetabek?",
        answer:
        "Untuk kurir instan rata-rata tiba dalam 30 - 45 menit setelah pesanan selesai diracik. Kami memastikan setiap porsi dikemas higienis dengan thermal bag agar tiba dalam kondisi masih hangat siap santap.",
    },
    {
        question: "Apakah seluruh menu dijamin 100% Halal?",
        answer:
        "Seluruh bahan baku yang kami olah, mulai dari ayam kampung pilihan, telur bebek, sayuran segar, hingga bumbu rempah dapur telah bersertifikasi halal dan diproses dengan standar higienis tinggi tanpa bahan pengawet.",
    },
    {
        question: "Metode pembayaran apa saja yang didukung?",
        answer:
        "Kami menerima pembayaran otomatis melalui QRIS (GoPay, OVO, DANA, ShopeePay, BCA, dll.), Virtual Account Bank nasional, serta metode Transfer Bank langsung.",
    },
    ];

    export default function Faqsection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section
        id="faq"
        style={{
            backgroundColor: "#FAF6EE",
            padding: "90px 24px",
        }}
        >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "45px" }}>
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
                marginBottom: "12px",
                letterSpacing: "0.5px",
                }}
            >
                Tanya Jawab
            </div>
            <h2
                style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#734F31",
                margin: "0 0 10px 0",
                }}
            >
                Pertanyaan Umum (FAQ)
            </h2>
            <p style={{ fontSize: "15px", color: "#9D9167", margin: 0, fontWeight: "600" }}>
                Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?
            </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                <div
                    key={index}
                    style={{
                    backgroundColor: "#ffffff",
                    border: isOpen ? "2px solid #734F31" : "1.5px solid #E8D1A7",
                    borderLeft: isOpen ? "6px solid #734F31" : "1.5px solid #E8D1A7",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: isOpen
                        ? "0 10px 25px rgba(115, 79, 49, 0.08)"
                        : "0 3px 10px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.2s ease",
                    }}
                >
                    <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    style={{
                        width: "100%",
                        padding: "20px 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isOpen ? "#FAF6EE" : "#ffffff",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: "14px",
                    }}
                    >
                    <span
                        style={{
                        fontSize: "16px",
                        fontWeight: "800",
                        color: isOpen ? "#734F31" : "#4B382A",
                        }}
                    >
                        {faq.question}
                    </span>
                    <span
                        style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        color: "#9D9167",
                        fontSize: "14px",
                        fontWeight: "900",
                        flexShrink: 0,
                        }}
                    >
                        ▼
                    </span>
                    </button>

                    {isOpen && (
                    <div
                        style={{
                        padding: "0 24px 22px 24px",
                        fontSize: "14px",
                        lineHeight: "1.8",
                        color: "#734F31",
                        backgroundColor: "#FAF6EE",
                        borderTop: "1px dashed #E8D1A7",
                        }}
                    >
                        {faq.answer}
                    </div>
                    )}
                </div>
                );
            })}
            </div>
        </div>
        </section>
    );
}