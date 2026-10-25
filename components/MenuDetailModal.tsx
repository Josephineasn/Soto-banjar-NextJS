"use client";
import { MenuItem } from "@/types";

interface MenuDetailModalProps {
    item: MenuItem | null;
    onClose: () => void;
    onAddToCart: (item: MenuItem) => void;
}

export default function MenuDetailModal({
    item,
    onClose,
    onAddToCart,
    }: MenuDetailModalProps) {
    if (!item) return null;

    // Cek stok
    const isAvailable = item.available !== false;

    return (
        <div
        style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "16px",
            zIndex: 60,
        }}
        >
        <div
            style={{
            background: "#ffffff",
            borderRadius: "20px",
            maxWidth: "430px",
            width: "100%",
            overflow: "hidden",
            border: "2px solid #f59e0b",
            boxShadow: "0 10px 25px rgba(0,0,0,0.18)",
            }}
        >
            <div style={{ position: "relative", height: "190px" }}>
            <img
                src={item.image}
                alt={item.name}
                style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: isAvailable ? "none" : "grayscale(85%)",
                }}
            />

            {/* Badge Habis / Terlaris */}
            {!isAvailable ? (
                <span
                style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "#ef4444",
                    color: "#ffffff",
                    padding: "4px 10px",
                    borderRadius: "10px",
                    fontSize: "11px",
                    fontWeight: "bold",
                }}
                >
                ❌ Sold Out
                </span>
            ) : item.popular ? (
                <span
                style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "linear-gradient(90deg, #ea580c, #f59e0b)",
                    color: "#ffffff",
                    padding: "4px 10px",
                    borderRadius: "10px",
                    fontSize: "11px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                }}
                >
                🔥 Popular
                </span>
            ) : null}

            {/* Tombol */}
            <button
                onClick={onClose}
                style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.6)",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                }}
            >
                ✕
            </button>
            </div>

            {/* Detail */}
            <div style={{ padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span
                style={{
                    fontSize: "10px",
                    background: "#ffedd5",
                    color: "#ea580c",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                }}
                >
                {item.category}
                </span>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "#44403c" }}>
                ⭐ {item.rating} • {item.calories || "350 kkal"}
                </span>
            </div>

            <h3 style={{ margin: "6px 0", fontSize: "19px", color: isAvailable ? "#1c1917" : "#78716c", fontWeight: "800" }}>
                {item.name}
            </h3>

            <p style={{ fontSize: "12px", color: "#78716c", margin: "0 0 14px", lineHeight: "1.5" }}>
                {item.description}
            </p>

            {/* Rempah & Info Packaging */}
            <div
                style={{
                background: "#fffbeb",
                padding: "12px",
                borderRadius: "10px",
                marginBottom: "16px",
                border: "1px solid #fed7aa",
                fontSize: "11px",
                lineHeight: "1.5",
                }}
            >
                <div style={{ marginBottom: "6px" }}>
                <span style={{ fontWeight: "bold", color: "#78350f", display: "block" }}>
                    🌿 Racikan Rempah Khas:
                </span>
                <span style={{ color: "#ea580c", fontWeight: "600" }}>
                    {item.spices && item.spices.length > 0 ? item.spices.join(" • ") : "Rempah Alami Nusantara"}
                </span>
                </div>

                <div style={{ borderTop: "1px dashed #fcd34d", paddingTop: "6px" }}>
                <span style={{ fontWeight: "bold", color: "#78350f" }}>📦 Standar Kemasan: </span>
                <span style={{ color: "#451a03" }}>{item.packagingInfo || "Kemasan pouch tahan panas & anti-tumpah"}</span>
                </div>
            </div>

            {/* Harga & Tombol Tambah */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #fef3c7", paddingTop: "12px" }}>
                <div>
                <span style={{ fontSize: "10px", color: "#a8a29e", display: "block", fontWeight: "bold" }}>HARGA PORSI</span>
                <strong style={{ fontSize: "19px", color: isAvailable ? "#ea580c" : "#78716c" }}>
                    Rp {item.price.toLocaleString("id-ID")}
                </strong>
                </div>

                <button
                disabled={!isAvailable}
                onClick={() => {
                    if (isAvailable) {
                    onAddToCart(item);
                    onClose();
                    }
                }}
                style={{
                    background: isAvailable ? "linear-gradient(90deg, #ea580c, #f59e0b)" : "#d6d3d1",
                    color: isAvailable ? "#ffffff" : "#78716c",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: isAvailable ? "pointer" : "not-allowed",
                    boxShadow: isAvailable ? "0 3px 8px rgba(234,88,12,0.25)" : "none",
                }}
                >
                {isAvailable ? "+ Masukkan Keranjang" : "Menu Habis"}
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}