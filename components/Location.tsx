"use client";

import React from "react";

export default function LocationSection() {
    return (
        <>
        <section
            id="lokasi"
            style={{
            backgroundColor: "#fffdf7",
            padding: "80px 24px 60px",
            }}
        >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "45px" }}>
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
                Kunjungi Rumah Makan
                </div>
                <h2
                style={{
                    fontSize: "32px",
                    fontWeight: "900",
                    color: "#292524",
                    margin: "0 0 8px 0",
                }}
                >
                Lokasi & Jam Operasional
                </h2>
                <p style={{ fontSize: "14px", color: "#78716c", margin: 0 }}>
                Datang langsung untuk menikmati sajian hangat di tempat yang nyaman dan asri.
                </p>
            </div>

            {/* Informasi & Peta */}
            <div
                style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "30px",
                alignItems: "stretch",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Alamat */}
                <div
                    style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #fef3c7",
                    borderRadius: "18px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    }}
                >
                    <div
                    style={{
                        backgroundColor: "#ffedd5",
                        color: "#ea580c",
                        padding: "10px",
                        borderRadius: "12px",
                        fontSize: "20px",
                    }}
                    >
                    📍
                    </div>
                    <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "800", color: "#292524" }}>
                        Alamat Restoran
                    </h4>
                    <p style={{ margin: 0, fontSize: "13px", color: "#78716c", lineHeight: "1.6" }}>
                        Wisma Atlet Tower 3, Kemayoran, Jakarta Pusat
                    </p>
                    </div>
                </div>

                {/* Jam Buka */}
                <div
                    style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #fef3c7",
                    borderRadius: "18px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    }}
                >
                    <div
                    style={{
                        backgroundColor: "#ffedd5",
                        color: "#ea580c",
                        padding: "10px",
                        borderRadius: "12px",
                        fontSize: "20px",
                    }}
                    >
                    🕒
                    </div>
                    <div style={{ width: "100%" }}>
                    <h4 style={{ margin: "0 0 10px", fontSize: "15px", fontWeight: "800", color: "#292524" }}>
                        Jam Buka
                    </h4>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#78716c", marginBottom: "6px" }}>
                        <span>Senin - Jumat:</span>
                        <strong style={{ color: "#292524" }}>08.00 - 21.00 WIB</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#78716c" }}>
                        <span>Sabtu - Minggu:</span>
                        <strong style={{ color: "#292524" }}>07.30 - 22.00 WIB</strong>
                    </div>
                    </div>
                </div>

                {/* Kontak */}
                <div
                    style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #fef3c7",
                    borderRadius: "18px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    }}
                >
                    <div
                    style={{
                        backgroundColor: "#ffedd5",
                        color: "#ea580c",
                        padding: "10px",
                        borderRadius: "12px",
                        fontSize: "20px",
                    }}
                    >
                    📞
                    </div>
                    <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "800", color: "#292524" }}>
                        Kontak & Reservasi
                    </h4>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#78716c" }}>
                        Telepon/WA: <strong style={{ color: "#292524" }}>+62 812-3456-7890</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#78716c" }}>
                        Email: info@sotobanjar-selera.id
                    </p>
                    </div>
                </div>
                </div>

                {/* Google Maps */}
                <div
                style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid #fef3c7",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                    minHeight: "360px",
                }}
                >
                <iframe
                    title="Peta Lokasi Soto Banjar"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.862423377708!2d106.85764027498978!3d-6.149170293837943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f59239845bfd%3A0xc3cf27a9c35a8bc1!2sWisma%20Atlet%20Kemayoran%20Tower%203!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "360px", display: "block" }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
                </div>
            </div>
            </div>
        </section>

        {/* Footer */}
        <footer
            style={{
            backgroundColor: "#1c2b23",
            color: "#ffffff",
            padding: "50px 24px 25px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
        >
            <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "35px",
                paddingBottom: "35px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
            >
            {/* Profil */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "24px" }}>🍲</span>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", color: "#ffffff" }}>
                    Soto Banjar Selera
                </h3>
                </div>
                <p style={{ fontSize: "12px", color: "#95ad9e", lineHeight: "1.7", margin: 0 }}>
                Menyajikan kehangatan resep asli Kalimantan Selatan dengan kebersihan dan kualitas rasa terbaik.
                </p>
            </div>

            {/* Tautan Cepat */}
            <div>
                <h4 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: "800", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Tautan Cepat
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "12px", lineHeight: "2.2", color: "#95ad9e" }}>
                <li><a href="#" style={{ color: "inherit", textDecoration: "none" }}>Beranda</a></li>
                <li><a href="#menu" style={{ color: "inherit", textDecoration: "none" }}>Daftar Menu</a></li>
                <li><a href="#tentang-kami" style={{ color: "inherit", textDecoration: "none" }}>Tentang Kami</a></li>
                <li><a href="#faq" style={{ color: "inherit", textDecoration: "none" }}>Tanya Jawab (FAQ)</a></li>
                <li><a href="#lokasi" style={{ color: "inherit", textDecoration: "none" }}>Lokasi & Kontak</a></li>
                </ul>
            </div>

            {/* Jam Layanan */}
            <div>
                <h4 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: "800", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Jam Layanan
                </h4>
                <div style={{ fontSize: "12px", color: "#95ad9e", lineHeight: "1.8" }}>
                <p style={{ margin: "0 0 4px" }}>Senin - Minggu:</p>
                <strong style={{ color: "#ffffff", display: "block", marginBottom: "8px" }}>08:00 - 21:00 WIB</strong>
                <p style={{ margin: 0, fontSize: "11px", color: "#6b8b78" }}>
                    Menerima Pesanan Catering & Acara
                </p>
                </div>
            </div>

            {/* Ikuti Kami */}
            <div>
                <h4 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: "800", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Ikuti Kami
                </h4>
                <div style={{ display: "flex", gap: "10px" }}>
                {["📷", "📘", "🎵"].map((icon, idx) => (
                    <div
                    key={idx}
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "14px",
                    }}
                    >
                    {icon}
                    </div>
                ))}
                </div>
            </div>
            </div>

            <div style={{ maxWidth: "1200px", margin: "20px auto 0", textAlign: "center", fontSize: "11px", color: "#6b8b78" }}>
            © 2026 Soto Banjar Selera Nusantara. All rights reserved.
            </div>
        </footer>
        </>
    );
}