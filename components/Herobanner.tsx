"use client";

interface HeroBannerProps {
    onOrderNow: () => void;
}

export default function Herobanner({ onOrderNow }: HeroBannerProps) {
    return (
        <section
        style={{
            background: "linear-gradient(180deg, #fef3c7 0%, #fffdf7 100%)",
            padding: "46px 20px",
            borderBottom: "1px solid #fed7aa",
        }}
        >
        <div
            style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
            alignItems: "center",
            }}
        >
            <div>
            <span
                style={{
                background: "#ea580c",
                color: "#fff",
                padding: "4px 14px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "900",
                display: "inline-block",
                marginBottom: "12px",
                }}
            >
                🔥 Khusus Layanan Pesan Antar Online (Delivery)
            </span>
            <h1
                style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#431407",
                margin: "0 0 12px",
                fontFamily: "serif",
                lineHeight: "1.2",
                }}
            >
                Hangatnya Rempah Asli, <br />
                <span style={{ color: "#ea580c" }}>Soto Banjar Sampai Depan Pintu</span>
            </h1>
            <p
                style={{
                fontSize: "14px",
                color: "#78350f",
                lineHeight: "1.6",
                margin: "0 0 24px",
                }}
            >
                Dibuat dari ayam kampung pilihan dan rebusan rempah kapulaga murni. Kuah dipisah dalam kemasan pouch tahan bocor & panas agar rasa tetap nikmat saat disantap.
            </p>

            <button
                onClick={onOrderNow}
                style={{
                background: "linear-gradient(90deg, #ea580c, #f59e0b)",
                color: "#fff",
                border: "none",
                padding: "12px 26px",
                borderRadius: "14px",
                fontWeight: "900",
                cursor: "pointer",
                fontSize: "14px",
                boxShadow: "0 4px 12px rgba(234,88,12,0.3)",
                }}
            >
                Pilih Menu & Pesan Sekarang ➔
            </button>
            </div>

            <div
            style={{
                borderRadius: "24px",
                overflow: "hidden",
                border: "4px solid #f59e0b",
                boxShadow: "0 10px 25px rgba(234,88,12,0.2)",
            }}
            >
            <img
                src="https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
                alt="Soto Banjar"
                style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
            />
            </div>
        </div>
        </section>
    );
}