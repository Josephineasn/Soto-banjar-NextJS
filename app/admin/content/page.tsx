"use client";

import React, { useState } from "react";

interface FaqItem {
    id: number;
    q: string;
    a: string;
}

    export default function AdminContentPage() {
    const [activeTab, setActiveTab] = useState<"banner" | "about" | "faq">("faq");

    // Benner Header
    const [badgeTagline, setBadgeTagline] = useState("Khusus Pesan Online • Area Jabodetabek");
    const [heroTitle, setHeroTitle] = useState("Keharuman Rempah Autentik Khas Banjar Langsung ke Rumahmu");
    const [highlightWord, setHighlightWord] = useState("Khas Banjar");
    const [heroSubtitle, setHeroSubtitle] = useState(
        "Pesan Soto Banjar hangat kaldu ayam kampung murni berpadu kayu manis, kapulaga, cengkeh, dan bunga lawang khas Kalimantan Selatan. Dikemas higienis, anti tumpah, dan cepat sampai tujuan."
    );
    const [heroImage, setHeroImage] = useState(
        "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
    );

    // Filosofi Rasa
    const [aboutBadge, setAboutBadge] = useState("FILOSOFI RASA");
    const [aboutTitle, setAboutTitle] = useState("Warisan Cita Rasa Hangat dari Bumi Kalimantan");
    const [aboutHighlight, setAboutHighlight] = useState("Bumi Kalimantan");
    const [aboutParagraph1, setAboutParagraph1] = useState(
        "Soto Banjar Selera Nusantara berakar dari kecintaan kami melestarikan kuliner legendaris khas Banjarmasin. Kunci kelezatan sup kami terletak pada simfoni rempah aromatik pilihan: kayu manis, cengkeh, kapulaga, pala, dan bunga lawang yang ditumis harum dengan mentega berkualitas sebelum dipadukan ke dalam rebusan kaldu murni."
    );
    const [aboutParagraph2, setAboutParagraph2] = useState(
        "Kami hanya menggunakan 100% ayam kampung segar yang menghasilkan kaldu gurih alami tanpa bahan pengawet. Disajikan lengkap bersama ketupat lembut, perkedel kentang legit, suwiran ayam tebal, telur bebek rebus, serta kucuran perasan jeruk kuit khas yang harum menyegarkan."
    );
    const [feature1Title, setFeature1Title] = useState("Ayam Kampung Asli");
    const [feature1Desc, setFeature1Desc] = useState("Daging manis alami berpadu kaldu gurih kaya nutrisi rempah.");
    const [feature2Title, setFeature2Title] = useState("Jeruk Kuit Segar");
    const [feature2Desc, setFeature2Desc] = useState("Aroma sitrus khas Banjar yang autentik dan menyegarkan.");
    const [aboutImage, setAboutImage] = useState(
        "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
    );

    // FAQ
    const [faqBadge, setFaqBadge] = useState("TANYA JAWAB");
    const [faqMainTitle, setFaqMainTitle] = useState("Pertanyaan Umum (FAQ)");
    const [faqDesc, setFaqDesc] = useState("Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?");
    const [faqs, setFaqs] = useState<FaqItem[]>([
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
    ]);

    // Live Preview
    const [openFaqIds, setOpenFaqIds] = useState<{ [id: number]: boolean }>({
        1: true,
        2: true,
        3: true,
        4: true,
    });

    const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
    const [faqInputQ, setFaqInputQ] = useState("");
    const [faqInputA, setFaqInputA] = useState("");

    function toggleFaqPreview(id: number) {
        setOpenFaqIds((prev) => ({
        ...prev,
        [id]: !prev[id],
        }));
    }

    function renderHighlightedText(text: string, highlight: string) {
        if (!highlight || !text.includes(highlight)) {
        return <span>{text}</span>;
        }
        const parts = text.split(highlight);
        return (
        <span>
            {parts[0]}
            <span style={{ color: "#E8D1A7" }}>{highlight}</span>
            {parts[1]}
        </span>
        );
    }

    function handleSaveAll(e: React.FormEvent) {
        e.preventDefault();
        const data = {
        banner: { badgeTagline, heroTitle, highlightWord, heroSubtitle, heroImage },
        about: { aboutBadge, aboutTitle, aboutHighlight, aboutParagraph1, aboutParagraph2, feature1Title, feature1Desc, feature2Title, feature2Desc, aboutImage },
        faq: { faqBadge, faqMainTitle, faqDesc, faqs },
        };
        localStorage.setItem("soto_site_content", JSON.stringify(data));
        alert("Semua perubahan konten web berhasil disimpan!");
    }

    function handleResetDefault() {
        if (confirm("Kembalikan konten ke pengaturan awal?")) {
        setBadgeTagline("Khusus Pesan Online • Area Jabodetabek");
        setHeroTitle("Keharuman Rempah Autentik Khas Banjar Langsung ke Rumahmu");
        setHighlightWord("Khas Banjar");
        setHeroSubtitle(
            "Pesan Soto Banjar hangat kaldu ayam kampung murni berpadu kayu manis, kapulaga, cengkeh, dan bunga lawang khas Kalimantan Selatan. Dikemas higienis, anti tumpah, dan cepat sampai tujuan."
        );
        setAboutBadge("FILOSOFI RASA");
        setAboutTitle("Warisan Cita Rasa Hangat dari Bumi Kalimantan");
        setAboutHighlight("Bumi Kalimantan");
        setFaqBadge("TANYA JAWAB");
        setFaqMainTitle("Pertanyaan Umum (FAQ)");
        setFaqDesc("Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?");
        alert("Konten berhasil di-reset ke default.");
        }
    }

    function handleAddOrEditFaq(e: React.FormEvent) {
        e.preventDefault();
        if (!faqInputQ.trim() || !faqInputA.trim()) return;

        if (editingFaqId !== null) {
        setFaqs((prev) =>
            prev.map((item) => (item.id === editingFaqId ? { ...item, q: faqInputQ, a: faqInputA } : item))
        );
        setEditingFaqId(null);
        } else {
        const newId = faqs.length > 0 ? Math.max(...faqs.map((f) => f.id)) + 1 : 1;
        setFaqs([...faqs, { id: newId, q: faqInputQ, a: faqInputA }]);
        setOpenFaqIds((prev) => ({ ...prev, [newId]: true }));
        }
        setFaqInputQ("");
        setFaqInputA("");
    }

    function handleDeleteFaq(id: number) {
        if (confirm("Hapus pertanyaan ini dari daftar FAQ?")) {
        setFaqs(faqs.filter((f) => f.id !== id));
        }
    }

    function handleStartEditFaq(f: FaqItem) {
        setEditingFaqId(f.id);
        setFaqInputQ(f.q);
        setFaqInputA(f.a);
    }

    return (
        <div style={{ paddingBottom: "60px" }}>
        {/* Header Halaman */}
        <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#734F31", margin: "0 0 6px", fontFamily: "serif" }}>
            Edit Header &amp; Konten Web
            </h2>
            <p style={{ fontSize: "13px", color: "#9D9167", margin: 0, fontWeight: "500" }}>
            Ubah kalimat banner hero, cerita cita rasa, serta daftar tanya jawab (FAQ).
            </p>
        </div>

        <div
            style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px solid #E8D1A7",
            padding: "28px",
            boxShadow: "0 6px 25px rgba(115, 79, 49, 0.05)",
            }}
        >
            <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "900", color: "#734F31", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#734F31" strokeWidth={2}>
                <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Pengaturan Konten Halaman Web Customer
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#9D9167" }}>
                Sesuaikan kalimat hero banner, cerita tentang cita rasa, dan daftar tanya jawab (FAQ).
            </p>
            </div>

            {/* Tombol Tab Navigasi */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "26px", flexWrap: "wrap" }}>
            <button
                type="button"
                onClick={() => setActiveTab("banner")}
                style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border: activeTab === "banner" ? "1.5px solid #734F31" : "1px solid #E8D1A7",
                backgroundColor: activeTab === "banner" ? "#734F31" : "#FAF6EE",
                color: activeTab === "banner" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                }}
            >
                1. Banner Header
            </button>

            <button
                type="button"
                onClick={() => setActiveTab("about")}
                style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border: activeTab === "about" ? "1.5px solid #734F31" : "1px solid #E8D1A7",
                backgroundColor: activeTab === "about" ? "#734F31" : "#FAF6EE",
                color: activeTab === "about" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                }}
            >
                2. Cerita Tentang Kami (Filosofi Rasa)
            </button>

            <button
                type="button"
                onClick={() => setActiveTab("faq")}
                style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border: activeTab === "faq" ? "1.5px solid #734F31" : "1px solid #E8D1A7",
                backgroundColor: activeTab === "faq" ? "#734F31" : "#FAF6EE",
                color: activeTab === "faq" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
                }}
            >
                3. Tanya Jawab (FAQ)
            </button>
            </div>

            {/* TAB 1: BANNER HEADER */}
            {activeTab === "banner" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "28px" }}>
                <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "8px" }}>
                    Live Preview: Banner Header Customer
                </span>
                <div
                    style={{
                    backgroundColor: "#734F31",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 12px 30px rgba(115, 79, 49, 0.2)",
                    border: "1.5px solid #E8D1A7",
                    }}
                >
                    <div style={{ backgroundColor: "#2E1C14", padding: "8px 14px", display: "flex", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                    </div>

                    <div style={{ padding: "26px 22px" }}>
                    <div
                        style={{
                        display: "inline-block",
                        backgroundColor: "rgba(250, 246, 238, 0.15)",
                        border: "1px solid rgba(232, 209, 167, 0.4)",
                        color: "#FAF6EE",
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        marginBottom: "14px",
                        }}
                    >
                        {badgeTagline}
                    </div>

                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "900", color: "#FAF6EE", lineHeight: "1.35", fontFamily: "serif" }}>
                            {renderHighlightedText(heroTitle, highlightWord)}
                        </h4>
                        <p style={{ margin: "0 0 16px", fontSize: "11px", color: "#E8D1A7", lineHeight: "1.6" }}>
                            {heroSubtitle}
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <span style={{ backgroundColor: "#E8D1A7", color: "#734F31", fontSize: "11px", fontWeight: "900", padding: "6px 14px", borderRadius: "8px" }}>
                            Pesan Sekarang &rarr;
                            </span>
                            <span style={{ border: "1px solid #FAF6EE", color: "#FAF6EE", fontSize: "11px", fontWeight: "700", padding: "6px 12px", borderRadius: "8px" }}>
                            Tentang Kami
                            </span>
                        </div>
                        </div>

                        <div style={{ width: "100px", flexShrink: 0 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={heroImage}
                            alt="Hero Preview"
                            style={{ width: "100px", height: "100px", borderRadius: "12px", objectFit: "cover", border: "1.5px solid #E8D1A7" }}
                        />
                        </div>
                    </div>
                    </div>
                </div>
                </div>

                <div>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "14px" }}>
                    Form Sunting Banner Header
                </span>
                <form onSubmit={handleSaveAll} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Tagline Badge Atas
                    </label>
                    <input
                        type="text"
                        value={badgeTagline}
                        onChange={(e) => setBadgeTagline(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>

                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Judul Utama Banner (Header Title)
                    </label>
                    <input
                        type="text"
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>

                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Kata yang di-highlight (Cokelat / Emas)
                    </label>
                    <input
                        type="text"
                        value={highlightWord}
                        onChange={(e) => setHighlightWord(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>

                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Deskripsi Lengkap (Lead Subtitle)
                    </label>
                    <textarea
                        rows={3}
                        value={heroSubtitle}
                        onChange={(e) => setHeroSubtitle(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box", resize: "none" }}
                    />
                    </div>

                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        URL Gambar Banner Hero
                    </label>
                    <input
                        type="url"
                        value={heroImage}
                        onChange={(e) => setHeroImage(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                    <button
                        type="submit"
                        style={{ padding: "10px 20px", backgroundColor: "#734F31", color: "#FAF6EE", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                        Simpan Header
                    </button>
                    <button
                        type="button"
                        onClick={handleResetDefault}
                        style={{ padding: "10px 16px", backgroundColor: "#FAF6EE", color: "#734F31", border: "1px solid #E8D1A7", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                        Reset ke Default
                    </button>
                    </div>
                </form>
                </div>
            </div>
            )}

            {/* TAB 2: CERITA TENTANG KAMI - FILOSOFI RASA */}
            {activeTab === "about" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#734F31" }}>
                    Live Preview: Tampilan Section Tentang Kami (Filosofi Rasa)
                    </span>
                    <span style={{ fontSize: "10px", backgroundColor: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: "800" }}>
                    Live Preview Aktif
                    </span>
                </div>

                <div
                    style={{
                    backgroundColor: "#2E1C14",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1.5px solid #E8D1A7",
                    boxShadow: "0 10px 30px rgba(46, 28, 20, 0.25)",
                    }}
                >
                    <div style={{ backgroundColor: "#1A0F0A", padding: "8px 14px", display: "flex", gap: "6px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                    </div>

                    <div style={{ padding: "30px 24px", display: "grid", gridTemplateColumns: "auto 1fr", gap: "24px", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ width: "160px", height: "160px", borderRadius: "50%", overflow: "hidden", border: "3px solid #E8D1A7", margin: "0 auto 8px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={aboutImage}
                            alt="Filosofi Soto"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        </div>
                        <span style={{ fontSize: "11px", color: "#E8D1A7", fontWeight: "700" }}>
                        Resep Turun-Temurun
                        </span>
                    </div>

                    <div>
                        <div style={{ display: "inline-block", backgroundColor: "rgba(232, 209, 167, 0.2)", border: "1px solid #E8D1A7", color: "#E8D1A7", fontSize: "10px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", marginBottom: "8px" }}>
                        {aboutBadge}
                        </div>

                        <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "900", color: "#FAF6EE", fontFamily: "serif" }}>
                        {renderHighlightedText(aboutTitle, aboutHighlight)}
                        </h3>

                        <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#D4C5B9", lineHeight: "1.6" }}>
                        {aboutParagraph1}
                        </p>
                        <p style={{ margin: "0 0 16px", fontSize: "11px", color: "#D4C5B9", lineHeight: "1.6" }}>
                        {aboutParagraph2}
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(232, 209, 167, 0.3)", borderRadius: "10px", padding: "10px 12px" }}>
                            <strong style={{ fontSize: "11px", color: "#E8D1A7", display: "block", marginBottom: "3px" }}>
                            {feature1Title}
                            </strong>
                            <span style={{ fontSize: "10px", color: "#D4C5B9", lineHeight: "1.4", display: "block" }}>
                            {feature1Desc}
                            </span>
                        </div>

                        <div style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", border: "1px solid rgba(232, 209, 167, 0.3)", borderRadius: "10px", padding: "10px 12px" }}>
                            <strong style={{ fontSize: "11px", color: "#E8D1A7", display: "block", marginBottom: "3px" }}>
                            {feature2Title}
                            </strong>
                            <span style={{ fontSize: "10px", color: "#D4C5B9", lineHeight: "1.4", display: "block" }}>
                            {feature2Desc}
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

                <div style={{ backgroundColor: "#FAF6EE", borderRadius: "14px", border: "1px solid #E8D1A7", padding: "22px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "4px" }}>
                    Form Sunting Section Tentang Kami
                </span>
                <p style={{ fontSize: "11px", color: "#9D9167", margin: "0 0 16px" }}>
                    Ubah teks, dua kotak keunggulan rasa, serta foto banner Tentang Kami di bawah ini.
                </p>

                <form onSubmit={handleSaveAll} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Badge Tagline Atas
                        </label>
                        <input
                        type="text"
                        value={aboutBadge}
                        onChange={(e) => setAboutBadge(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Kata yang di-highlight (Cokelat / Emas)
                        </label>
                        <input
                        type="text"
                        value={aboutHighlight}
                        onChange={(e) => setAboutHighlight(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    </div>

                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Judul Utama Tentang Kami
                    </label>
                    <input
                        type="text"
                        value={aboutTitle}
                        onChange={(e) => setAboutTitle(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Paragraf 1 (Cerita Cita Rasa &amp; Rempah)
                        </label>
                        <textarea
                        rows={5}
                        value={aboutParagraph1}
                        onChange={(e) => setAboutParagraph1(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "11px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Paragraf 2 (Kualitas Ayam &amp; Pelengkap)
                        </label>
                        <textarea
                        rows={5}
                        value={aboutParagraph2}
                        onChange={(e) => setAboutParagraph2(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "11px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Judul Kotak 1 &amp; Deskripsi
                        </label>
                        <input
                        type="text"
                        value={feature1Title}
                        onChange={(e) => setFeature1Title(e.target.value)}
                        placeholder="Judul Kotak 1"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "11px", marginBottom: "6px", boxSizing: "border-box" }}
                        />
                        <input
                        type="text"
                        value={feature1Desc}
                        onChange={(e) => setFeature1Desc(e.target.value)}
                        placeholder="Deskripsi Singkat"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "11px", boxSizing: "border-box" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Judul Kotak 2 &amp; Deskripsi
                        </label>
                        <input
                        type="text"
                        value={feature2Title}
                        onChange={(e) => setFeature2Title(e.target.value)}
                        placeholder="Judul Kotak 2"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "11px", marginBottom: "6px", boxSizing: "border-box" }}
                        />
                        <input
                        type="text"
                        value={feature2Desc}
                        onChange={(e) => setFeature2Desc(e.target.value)}
                        placeholder="Deskripsi Singkat"
                        style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "11px", boxSizing: "border-box" }}
                        />
                    </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <button
                        type="submit"
                        style={{ padding: "10px 22px", backgroundColor: "#734F31", color: "#FAF6EE", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                        Simpan Perubahan Cerita
                    </button>
                    <button
                        type="button"
                        onClick={handleResetDefault}
                        style={{ padding: "10px 16px", backgroundColor: "#FAF6EE", color: "#734F31", border: "1px solid #E8D1A7", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                        Reset ke Default
                    </button>
                    </div>
                </form>
                </div>
            </div>
            )}

            {/* TAB 3: TANYA JAWAB (FAQ)    */}
            {activeTab === "faq" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#734F31", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    Live Preview: Tampilan Section Tanya Jawab (FAQ)
                    </span>
                    <span style={{ fontSize: "10px", backgroundColor: "#DCFCE7", color: "#166534", padding: "2px 8px", borderRadius: "10px", fontWeight: "800" }}>
                    Live Preview Aktif
                    </span>
                </div>
                <p style={{ fontSize: "12px", color: "#64748B", margin: "0 0 12px" }}>
                    Pratinjau visual penuh dan interaktif sesuai tampilan asli di halaman web customer.
                </p>

                {/* Browser Window Mockup */}
                <div
                    style={{
                    backgroundColor: "#FAF6EE",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1.5px solid #E8D1A7",
                    boxShadow: "0 12px 35px rgba(115, 79, 49, 0.08)",
                    }}
                >
                    {/* Browser Top Bar Gelap */}
                    <div
                    style={{
                        backgroundColor: "#16231C",
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                    >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#EF4444" }} />
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#94A3B8" }}>
                        <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                    </div>
                    </div>

                    {/* Konten Live Preview Section FAQ */}
                    <div style={{ padding: "30px 24px" }}>
                    <div
                        style={{
                        display: "inline-block",
                        backgroundColor: "rgba(232, 209, 167, 0.35)",
                        border: "1px solid #E8D1A7",
                        color: "#734F31",
                        fontSize: "10px",
                        fontWeight: "900",
                        padding: "3px 12px",
                        borderRadius: "20px",
                        letterSpacing: "0.5px",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        }}
                    >
                        {faqBadge}
                    </div>

                    <h3
                        style={{
                        margin: "0 0 6px",
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#1E293B",
                        fontFamily: "serif",
                        }}
                    >
                        {faqMainTitle}
                    </h3>

                    <p style={{ margin: "0 0 22px", fontSize: "12px", color: "#64748B" }}>
                        {faqDesc}
                    </p>

                    {/* List Kartu Akordeon Pertanyaan & Jawaban */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {faqs.map((f) => {
                        const isOpen = openFaqIds[f.id] ?? true;
                        return (
                            <div
                            key={f.id}
                            style={{
                                backgroundColor: "#FFFFFF",
                                borderRadius: "12px",
                                border: "1px solid #E2E8F0",
                                overflow: "hidden",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                            }}
                            >
                            {/* Header Pertanyaan */}
                            <button
                                type="button"
                                onClick={() => toggleFaqPreview(f.id)}
                                style={{
                                width: "100%",
                                padding: "14px 18px",
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
                                    fontSize: "13px",
                                    fontWeight: "800",
                                    color: "#0F172A",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                                >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: "#0F172A" }}>
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                                </svg>
                                {f.q}
                                </span>
                                <span style={{ color: "#64748B", fontSize: "14px", fontWeight: "bold" }}>
                                {isOpen ? "∧" : "∨"}
                                </span>
                            </button>

                            {isOpen && (
                                <div
                                style={{
                                    padding: "0 18px 16px 41px",
                                    fontSize: "12px",
                                    color: "#64748B",
                                    lineHeight: "1.6",
                                }}
                                >
                                {f.a}
                                </div>
                            )}
                            </div>
                        );
                        })}
                    </div>
                    </div>
                </div>
                </div>

                <div style={{ backgroundColor: "#FAF6EE", borderRadius: "14px", border: "1px solid #E8D1A7", padding: "22px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "4px" }}>
                    Form Sunting Section &amp; Daftar Pertanyaan FAQ
                </span>
                <p style={{ fontSize: "11px", color: "#9D9167", margin: "0 0 16px" }}>
                    Ubah judul, deskripsi, serta kelola butir pertanyaan dan jawaban FAQ di bawah ini.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Badge Tagline Section FAQ
                    </label>
                    <input
                        type="text"
                        value={faqBadge}
                        onChange={(e) => setFaqBadge(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>

                    <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                        Judul Utama FAQ
                    </label>
                    <input
                        type="text"
                        value={faqMainTitle}
                        onChange={(e) => setFaqMainTitle(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#734F31", marginBottom: "4px" }}>
                    Deskripsi Singkat FAQ
                    </label>
                    <textarea
                    rows={2}
                    value={faqDesc}
                    onChange={(e) => setFaqDesc(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FFFFFF", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box", resize: "none" }}
                    />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                    type="button"
                    onClick={handleSaveAll}
                    style={{ padding: "9px 20px", backgroundColor: "#734F31", color: "#FAF6EE", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                    Simpan Header FAQ
                    </button>
                    <button
                    type="button"
                    onClick={handleResetDefault}
                    style={{ padding: "9px 16px", backgroundColor: "#FAF6EE", color: "#734F31", border: "1px solid #E8D1A7", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                    Reset FAQ ke Default
                    </button>
                </div>
                </div>

                {/* FORM INPUT TAMBAH / EDIT */}
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1.5px solid #E8D1A7", padding: "20px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#734F31", display: "block", marginBottom: "12px" }}>
                    {editingFaqId !== null ? `Sunting Pertanyaan #${editingFaqId}` : "+ Tambah Butir FAQ Baru"}
                </span>

                <form onSubmit={handleAddOrEditFaq} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                    <input
                        type="text"
                        required
                        placeholder="Tuliskan pertanyaan (misal: Apakah kuah soto dikirim terpisah?)"
                        value={faqInputQ}
                        onChange={(e) => setFaqInputQ(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box" }}
                    />
                    </div>
                    <div>
                    <textarea
                        required
                        rows={2}
                        placeholder="Tuliskan jawaban penjelasan..."
                        value={faqInputA}
                        onChange={(e) => setFaqInputA(e.target.value)}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E8D1A7", backgroundColor: "#FAF6EE", fontSize: "12px", color: "#734F31", outline: "none", boxSizing: "border-box", resize: "none" }}
                    />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        type="submit"
                        style={{ padding: "8px 18px", backgroundColor: "#734F31", color: "#FAF6EE", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                    >
                        {editingFaqId !== null ? "Simpan Perubahan FAQ" : "Tambahkan ke Daftar FAQ"}
                    </button>
                    {editingFaqId !== null && (
                        <button
                        type="button"
                        onClick={() => {
                            setEditingFaqId(null);
                            setFaqInputQ("");
                            setFaqInputA("");
                        }}
                        style={{ padding: "8px 14px", backgroundColor: "#FAF6EE", color: "#734F31", border: "1px solid #E8D1A7", borderRadius: "8px", fontSize: "12px", cursor: "pointer" }}
                        >
                        Batal
                        </button>
                    )}
                    </div>
                </form>
                </div>

                {/* PERTANYAAN FAQ */}
                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1.5px solid #E8D1A7", padding: "20px" }}>
                <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "900", color: "#734F31" }}>
                    Daftar Butir Pertanyaan FAQ Aktif ({faqs.length})
                </h4>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1.5px solid #E8D1A7", color: "#9D9167" }}>
                        <th style={{ padding: "10px 8px", width: "35px" }}>No</th>
                        <th style={{ padding: "10px 12px", width: "260px" }}>Pertanyaan</th>
                        <th style={{ padding: "10px 12px" }}>Jawaban</th>
                        <th style={{ padding: "10px 12px", textAlign: "right", width: "140px" }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faqs.map((f, idx) => (
                        <tr key={f.id} style={{ borderBottom: "1px solid #FAF6EE", color: "#734F31" }}>
                            <td style={{ padding: "12px 8px", fontWeight: "800", color: "#9D9167" }}>
                            {idx + 1}
                            </td>
                            <td style={{ padding: "12px 12px", fontWeight: "800", color: "#734F31" }}>
                            {f.q}
                            </td>
                            <td style={{ padding: "12px 12px", color: "#64748B", lineHeight: "1.5" }}>
                            {f.a}
                            </td>
                            <td style={{ padding: "12px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                            <button
                                type="button"
                                onClick={() => handleStartEditFaq(f)}
                                style={{
                                padding: "5px 12px",
                                backgroundColor: "#FAF6EE",
                                border: "1px solid #E8D1A7",
                                color: "#734F31",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "800",
                                cursor: "pointer",
                                marginRight: "6px",
                                }}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteFaq(f.id)}
                                style={{
                                padding: "5px 12px",
                                backgroundColor: "#FEF2F2",
                                border: "1px solid #FECACA",
                                color: "#DC2626",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: "800",
                                cursor: "pointer",
                                }}
                            >
                                Hapus
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            </div>
            )}
        </div>
        </div>
    );
}