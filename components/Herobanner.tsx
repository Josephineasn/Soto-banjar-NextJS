"use client";

interface HeroBannerProps {
    onOrderNow: () => void;
}

    export default function Herobanner({ onOrderNow }: HeroBannerProps) {
    const scrollToAbout = () => {
        document
        .getElementById("tentang-kami")
        ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
        <section
            style={{
            backgroundColor: "#734F31",
            color: "#FAF6EE",
            padding: "65px 24px 75px",
            position: "relative",
            backgroundImage:
                "radial-gradient(rgba(232, 209, 167, 0.15) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            }}
        >
            <div
            style={{
                maxWidth: "1240px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "50px",
                alignItems: "center",
            }}
            >
            <div>
                <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "rgba(232, 209, 167, 0.2)",
                    border: "1.5px solid #E8D1A7",
                    color: "#E8D1A7",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "800",
                    marginBottom: "20px",
                    letterSpacing: "0.4px",
                }}
                >
                <span>🛵</span> Khusus Pesan Online • Area Jabodetabek
                </div>

                <h1
                style={{
                    fontSize: "44px",
                    fontWeight: "900",
                    lineHeight: "1.18",
                    color: "#E8D1A7",
                    margin: "0 0 18px",
                    letterSpacing: "-0.5px",
                }}
                >
                Keharuman Rempah <br />
                Autentik Khas Banjar <br />
                <span style={{ color: "#FAF6EE" }}>Langsung ke Rumahmu</span>
                </h1>

                <p
                style={{
                    fontSize: "14px",
                    lineHeight: "1.8",
                    color: "#E8D1A7",
                    margin: "0 0 32px",
                    maxWidth: "520px",
                    opacity: 0.95,
                }}
                >
                Pesan Soto Banjar hangat kaldu ayam kampung murni berpadu kayu
                manis, kapulaga, cengkeh, dan bunga lawang khas Kalimantan Selatan.
                Dikemas higienis, anti tumpah, dan cepat sampai tujuan.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <button
                    type="button"
                    onClick={onOrderNow}
                    style={{
                    background: "#9D9167",
                    color: "#FAF6EE",
                    border: "none",
                    padding: "13px 26px",
                    borderRadius: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    fontSize: "14px",
                    boxShadow: "0 6px 18px rgba(157, 145, 103, 0.4)",
                    transition: "all 0.2s ease",
                    }}
                >
                    Pesan Sekarang ➔
                </button>

                <button
                    type="button"
                    onClick={scrollToAbout}
                    style={{
                    background: "transparent",
                    color: "#E8D1A7",
                    border: "1.5px solid #E8D1A7",
                    padding: "13px 24px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    }}
                >
                    Tentang Kami
                </button>
                </div>
            </div>

            <div
                style={{
                position: "relative",
                width: "100%",
                maxWidth: "520px",
                margin: "0 auto",
                }}
            >
                <div
                style={{
                    borderRadius: "26px",
                    overflow: "hidden",
                    border: "4px solid #E8D1A7",
                    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                }}
                >
                <img
                    src="https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
                    alt="Soto Banjar Otentik"
                    style={{
                    width: "100%",
                    height: "330px",
                    objectFit: "cover",
                    display: "block",
                    }}
                />
                </div>
            </div>
            </div>
        </section>

        {/* 3 Fitur Unggulan */}
        <div
            style={{
            backgroundColor: "#FAF6EE",
            borderBottom: "1.5px solid #E8D1A7",
            padding: "18px 24px",
            }}
        >
            <div
            style={{
                maxWidth: "1240px",
                margin: "0 auto",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
                fontSize: "13px",
                fontWeight: "700",
                color: "#734F31",
            }}
            >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>🛡️</span>
                <span>Packaging Food-Grade & Anti Tumpah</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>🛵</span>
                <span>Layanan Antar Seluruh Jabodetabek</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "18px" }}>⏱️</span>
                <span>Estimasi Pengantaran 30 - 45 Menit</span>
            </div>
            </div>
        </div>
        </>
    );
}