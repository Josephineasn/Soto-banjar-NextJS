"use client";

import React from "react";

export default function Location() {
    return (
        <section
        id="lokasi"
        style={{
            background: "#FAF6EE",
            padding: "90px 24px 70px",
            borderTop: "2px solid #E8D1A7",
        }}
        >
        <div style={{ maxWidth: "1220px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div
                style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#9D9167",
                color: "#FAF6EE",
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                padding: "6px 18px",
                borderRadius: "30px",
                marginBottom: "12px",
                letterSpacing: "0.8px",
                }}
            >
                KUNJUNGI RUMAH MAKAN
            </div>
            <h2
                style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#734F31",
                margin: "0 0 10px 0",
                }}
            >
                Lokasi & Jam Operasional
            </h2>
            <p
                style={{
                fontSize: "15px",
                color: "#9D9167",
                margin: 0,
                fontWeight: "600",
                }}
            >
                Datang langsung untuk menikmati sajian hangat di tempat yang nyaman dan asri.
            </p>
            </div>

            <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                gap: "35px",
                alignItems: "stretch",
            }}
            >
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Alamat */}
                <div
                style={{
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #E8D1A7",
                    borderRadius: "22px",
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(115, 79, 49, 0.05)",
                    display: "flex",
                    gap: "18px",
                    alignItems: "flex-start",
                }}
                >
                <div>
                    <h4
                    style={{
                        margin: "0 0 6px",
                        fontSize: "16px",
                        fontWeight: "900",
                        color: "#734F31",
                    }}
                    >
                    Alamat Restoran
                    </h4>
                    <p
                    style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#9D9167",
                        lineHeight: "1.6",
                        fontWeight: "600",
                    }}
                    >
                    Wisma Atlet Tower 3, Kemayoran, Jakarta Pusat
                    </p>
                    <a
                    href="https://maps.google.com/?q=Wisma+Atlet+Tower+3+Kemayoran"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        display: "inline-block",
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#734F31",
                        fontWeight: "800",
                        textDecoration: "none",
                    }}
                    >
                    Buka di Google Maps
                    </a>
                </div>
                </div>

                {/* Jam Buka */}
                <div
                style={{
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #E8D1A7",
                    borderRadius: "22px",
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(115, 79, 49, 0.05)",
                    display: "flex",
                    gap: "18px",
                    alignItems: "flex-start",
                }}
                >
                <div style={{ width: "100%" }}>
                    <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                    }}
                    >
                    <h4
                        style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: "900",
                        color: "#734F31",
                        }}
                    >
                        Jam Buka
                    </h4>
                    <span
                        style={{
                        background: "#E8D1A7",
                        color: "#734F31",
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        }}
                    >
                        Buka Hari Ini
                    </span>
                    </div>
                    <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: "#734F31",
                        marginBottom: "6px",
                    }}
                    >
                    <span>Senin - Jumat:</span>
                    <strong style={{ color: "#734F31" }}>08.00 - 21.00 WIB</strong>
                    </div>
                    <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        color: "#734F31",
                    }}
                    >
                    <span>Sabtu - Minggu:</span>
                    <strong style={{ color: "#734F31" }}>07.30 - 22.00 WIB</strong>
                    </div>
                </div>
                </div>

                {/* Kontak */}
                <div
                style={{
                    backgroundColor: "#ffffff",
                    border: "1.5px solid #E8D1A7",
                    borderRadius: "22px",
                    padding: "24px",
                    boxShadow: "0 8px 24px rgba(115, 79, 49, 0.05)",
                    display: "flex",
                    gap: "18px",
                    alignItems: "flex-start",
                }}
                >
                <div>
                    <h4
                    style={{
                        margin: "0 0 6px",
                        fontSize: "16px",
                        fontWeight: "900",
                        color: "#734F31",
                    }}
                    >
                    Kontak & Reservasi
                    </h4>
                    <p
                    style={{
                        margin: "0 0 4px",
                        fontSize: "14px",
                        color: "#734F31",
                    }}
                    >
                    Telepon/WA: <strong style={{ color: "#734F31" }}>+62 812-3456-7890</strong>
                    </p>
                    <p
                    style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#9D9167",
                        fontWeight: "600",
                    }}
                    >
                    Email: info@sotobanjar-selera.id
                    </p>
                </div>
                </div>
            </div>

            {/* Google Maps Iframe */}
            <div
                style={{
                borderRadius: "24px",
                overflow: "hidden",
                border: "2px solid #E8D1A7",
                boxShadow: "0 12px 30px rgba(115, 79, 49, 0.08)",
                minHeight: "380px",
                background: "#fff",
                }}
            >
                <iframe
                title="Peta Lokasi Soto Banjar"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.862423377708!2d106.85764027498978!3d-6.149170293837943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f59239845bfd%3A0xc3cf27a9c35a8bc1!2sWisma%20Atlet%20Kemayoran%20Tower%203!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "380px", display: "block" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
            </div>
        </div>
        </section>
    );
}