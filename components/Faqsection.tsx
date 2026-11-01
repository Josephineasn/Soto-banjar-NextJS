"use client";

import React, { useState } from "react";

interface FaqItem {
    question: string;
    answer: string;
}

    const faqs: FaqItem[] = [
    {
        question: "Apakah kuah soto dikirim terpisah agar tidak tumpah?",
        answer:
        "Ya, kuah kaldu rempah dikemas khusus menggunakan mangkuk/standing pouch tahan panas berlapis rapat yang disegel rapi terpisah dari ketupat, suwiran ayam, dan perkedel untuk menjaga kesegaran dan menghindari tumpah di jalan.",
    },
    {
        question: "Berapa lama waktu pengantaran di wilayah Jabodetabek?",
        answer:
        "Untuk pengiriman instan rata-rata tiba dalam 30 - 60 menit setelah pesanan selesai dimasak. Kami bermitra dengan kurir instan dan sameday terpercaya untuk memastikan hidangan tiba dalam keadaan tetap hangat.",
    },
    {
        question: "Apakah seluruh menu dijamin 100% Halal?",
        answer:
        "Seluruh bahan baku yang kami olah, mulai dari ayam kampung pilihan, telur bebek, sayuran, hingga bumbu rempah dapur telah bersertifikasi halal dan diproses dengan standar higienis tinggi tanpa bahan pengawet.",
    },
    {
        question: "Metode pembayaran apa saja yang didukung?",
        answer:
        "Kami menerima pembayaran otomatis melalui QRIS (GoPay, OVO, Dana, ShopeePay, BCA, dll.), Virtual Account Bank, dan opsi Transfer Bank langsung.",
    },
    ];

    export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Default item pertama terbuka

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section
        id="faq"
        style={{
            backgroundColor: "#fffdfa",
            padding: "80px 24px",
        }}
        >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Header Section */}
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
                style={{
                display: "inline-block",
                background: "#ffedd5",
                color: "#c2410c",
                fontSize: "11px",
                fontWeight: "800",
                textTransform: "uppercase",
                padding: "4px 14px",
                borderRadius: "20px",
                marginBottom: "12px",
                letterSpacing: "0.5px",
                }}
            >
                Tanya Jawab
            </div>
            <h2
                style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#292524",
                margin: "0 0 8px 0",
                }}
            >
                Pertanyaan Umum (FAQ)
            </h2>
            <p style={{ fontSize: "14px", color: "#78716c", margin: 0 }}>
                Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?
            </p>
            </div>

            {/* Daftar Accordion */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                <div
                    key={index}
                    style={{
                    backgroundColor: "#ffffff",
                    border: isOpen ? "1px solid #fed7aa" : "1px solid #f3f4f6",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: isOpen
                        ? "0 6px 18px rgba(234, 88, 12, 0.06)"
                        : "0 2px 6px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.25s ease",
                    }}
                >
                    <button
                    type="button"
                    onClick={() => toggleAccordion(index)}
                    style={{
                        width: "100%",
                        padding: "18px 22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: isOpen ? "#fffaf5" : "#ffffff",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        gap: "12px",
                    }}
                    >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundColor: "#ffedd5",
                            color: "#ea580c",
                            fontSize: "12px",
                            fontWeight: "800",
                        }}
                        >
                        ?
                        </span>
                        <span
                        style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            color: isOpen ? "#ea580c" : "#292524",
                        }}
                        >
                        {faq.question}
                        </span>
                    </div>
                    <span
                        style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        color: "#9ca3af",
                        fontSize: "16px",
                        }}
                    >
                        ▼
                    </span>
                    </button>

                    {isOpen && (
                    <div
                        style={{
                        padding: "0 22px 20px 56px",
                        fontSize: "13px",
                        lineHeight: "1.7",
                        color: "#57534e",
                        backgroundColor: "#fffaf5",
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