"use client";
import { MenuItem } from "@/types";

interface MenuCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem) => void;
    onOpenDetail: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAddToCart, onOpenDetail }: MenuCardProps) {
    const isAvailable = item.available !== false;

    return (
        <div
        style={{
            background: "#ffffff",
            border: "1px solid #fde68a",
            borderRadius: "18px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            opacity: isAvailable ? 1 : 0.65,
            transition: "all 0.2s ease",
        }}
        >
        <div>
            <div
            style={{ position: "relative", height: "170px", cursor: "pointer", overflow: "hidden" }}
            onClick={() => onOpenDetail(item)}
            >
            <img
                src={item.image}
                alt={item.name}
                style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: isAvailable ? "none" : "grayscale(85%)",
                }}
            />

            {!isAvailable ? (
                <span
                style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "#ef4444",
                    color: "#ffffff",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "900",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                }}
                >
                ❌ Habis / Sold Out
                </span>
            ) : item.popular ? (
                <span
                style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "linear-gradient(90deg, #ea580c, #f59e0b)",
                    color: "#ffffff",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    fontSize: "10px",
                    fontWeight: "900",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    textTransform: "uppercase",
                }}
                >
                🔥 Terlaris
                </span>
            ) : null}

            {/* Badge Rating Kanan Atas */}
            <span
                style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(255,255,255,0.95)",
                padding: "2px 8px",
                borderRadius: "10px",
                fontSize: "11px",
                fontWeight: "bold",
                color: "#1c1917",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                ⭐ {item.rating}
            </span>
            </div>

            {/* Informasi Menu */}
            <div style={{ padding: "14px" }}>
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
            <h3
                onClick={() => onOpenDetail(item)}
                style={{
                fontSize: "16px",
                fontWeight: "bold",
                margin: "8px 0 4px",
                color: isAvailable ? "#292524" : "#78716c",
                cursor: "pointer",
                }}
            >
                {item.name}
            </h3>
            <p
                style={{
                fontSize: "12px",
                color: "#78716c",
                margin: "0 0 10px",
                lineHeight: "1.4",
                }}
            >
                {item.description}
            </p>
            </div>
        </div>

        {/* Footer & Button */}
        <div
            style={{
            padding: "12px 14px",
            borderTop: "1px solid #fef3c7",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: isAvailable ? "transparent" : "#fafaf9",
            }}
        >
            <strong style={{ color: isAvailable ? "#ea580c" : "#78716c", fontSize: "16px" }}>
            Rp {item.price.toLocaleString("id-ID")}
            </strong>

            <div style={{ display: "flex", gap: "6px" }}>
            <button
                onClick={() => onOpenDetail(item)}
                style={{
                background: "#fef3c7",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                fontSize: "11px",
                fontWeight: "bold",
                cursor: "pointer",
                color: "#78350f",
                }}
            >
                Detail
            </button>

            <button
                disabled={!isAvailable}
                onClick={() => onAddToCart(item)}
                style={{
                background: isAvailable ? "#ea580c" : "#d6d3d1",
                color: isAvailable ? "#ffffff" : "#78716c",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: isAvailable ? "pointer" : "not-allowed",
                boxShadow: isAvailable ? "0 2px 4px rgba(234,88,12,0.2)" : "none",
                }}
            >
                {isAvailable ? "+ Pesan" : "Habis"}
            </button>
            </div>
        </div>
        </div>
    );
}