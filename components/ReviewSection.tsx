"use client";

export default function ReviewSection() {
    const reviews = [
        {
        name: "Marcello",
        text: "Kuahnya kental rempah kapulaganya berasa banget! Dikemas di pouch jadi pas nyampe rumah masih ngebul.",
        rating: 5,
        },
        {
        name: "Calvin Sihol",
        text: "Nasi kuning bumbu habang plus ikan haruan empuk, cemilan amparan tataknya legit manis gurih.",
        rating: 5,
        },
        {
        name: "Josephine Sherly",
        text: "Es limau kuitnya juara segarnya, packing rapi bersih dan kurirnya tepat waktu.",
        rating: 5,
        },
    ];

    return (
        <section
        style={{
            background: "linear-gradient(180deg, #fffdf7 0%, #fef3c7 100%)",
            padding: "40px 16px",
            borderTop: "1px solid #fed7aa",
        }}
        >
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#431407", margin: 0, fontFamily: "serif" }}>
            Ulasan Pelanggan Setia
            </h2>
            <p style={{ fontSize: "13px", color: "#78350f", margin: "4px 0 24px" }}>
            Pengalaman pecinta kuliner asli Banjar yang memesan secara online
            </p>

            <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
                textAlign: "left",
            }}
            >
            {reviews.map((rev, idx) => (
                <div
                key={idx}
                style={{
                    background: "#ffffff",
                    padding: "18px",
                    borderRadius: "16px",
                    border: "2px solid #fed7aa",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                >
                <div style={{ fontSize: "14px", marginBottom: "8px" }}>{"⭐".repeat(rev.rating)}</div>
                <p style={{ fontSize: "12px", color: "#451a03", lineHeight: "1.5", fontStyle: "italic", margin: "0 0 12px" }}>
                    &ldquo;{rev.text}&rdquo;
                </p>
                <strong style={{ fontSize: "12px", color: "#ea580c", display: "block" }}>— {rev.name}</strong>
                </div>
            ))}
            </div>
        </div>
        </section>
    );
    }