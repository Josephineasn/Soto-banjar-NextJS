"use client";
import React, { useState } from "react";
import { MenuItem } from "@/types";

interface MenuCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem) => void;
    onOrder: (item: MenuItem) => void;
    onOpenDetail: (item: MenuItem) => void;
}

    export default function MenuCard({
    item,
    onAddToCart,
    onOrder,
    onOpenDetail,
    }: MenuCardProps) {
    const isAvailable = item.available !== false;
    const [isAdded, setIsAdded] = useState(false);

    const handleCartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        onAddToCart(item);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1000);
    };

    const handleOrderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAvailable) return;
        onOrder(item);
    };

    return (
        <div
        style={{
            background: "#FFFFFF",
            border: "1px solid #EFE6D8",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 6px 18px rgba(62, 39, 35, 0.04)",
            opacity: isAvailable ? 1 : 0.65,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        >
        <div>
            <div
            style={{
                position: "relative",
                height: "180px",
                cursor: "pointer",
                overflow: "hidden",
            }}
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
                    top: "12px",
                    left: "12px",
                    background: "#DC2626",
                    color: "#ffffff",
                    padding: "4px 10px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: "900",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
                >
                Habis / Sold Out
                </span>
            ) : item.popular ? (
                <span
                style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "linear-gradient(135deg, #B45309, #D97706)",
                    color: "#ffffff",
                    padding: "4px 12px",
                    borderRadius: "10px",
                    fontSize: "10px",
                    fontWeight: "900",
                    boxShadow: "0 2px 8px rgba(180, 83, 9, 0.35)",
                    textTransform: "uppercase",
                }}
                >
                🔥 Terlaris
                </span>
            ) : null}

            <span
                style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "rgba(255, 255, 255, 0.95)",
                padding: "3px 8px",
                borderRadius: "8px",
                fontSize: "11px",
                fontWeight: "bold",
                color: "#3E2723",
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
            >
                ⭐ {item.rating}
            </span>
            </div>

            {/* Informasi Menu */}
            <div style={{ padding: "18px" }}>
            <span
                style={{
                fontSize: "10px",
                background: "#FEF3C7",
                color: "#92400E",
                padding: "4px 8px",
                borderRadius: "6px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                }}
            >
                {item.category}
            </span>
            <h3
                onClick={() => onOpenDetail(item)}
                style={{
                fontSize: "17px",
                fontWeight: "800",
                margin: "10px 0 6px",
                color: isAvailable ? "#2E1C14" : "#9E9E9E",
                cursor: "pointer",
                }}
            >
                {item.name}
            </h3>
            <p
                style={{
                fontSize: "13px",
                color: "#6D4C41",
                margin: "0 0 12px",
                lineHeight: "1.5",
                }}
            >
                {item.description}
            </p>
            </div>
        </div>

        {/* Footer */}
        <div
            style={{
            padding: "14px 18px",
            borderTop: "1px solid #F3EDE2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: isAvailable ? "#FAF6EE" : "#F5F5F5",
            }}
        >
            <strong
            style={{
                color: isAvailable ? "#B45309" : "#9E9E9E",
                fontSize: "16px",
                fontWeight: "900",
            }}
            >
            Rp {item.price.toLocaleString("id-ID")}
            </strong>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Tombol Detail */}
            <button
                type="button"
                onClick={() => onOpenDetail(item)}
                style={{
                background: "#FFFFFF",
                border: "1px solid #E5D9C5",
                borderRadius: "8px",
                padding: "7px 11px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                color: "#6D4C41",
                }}
            >
                Detail
            </button>

            {/* Tombol Tambah Keranjang */}
            <button
                type="button"
                disabled={!isAvailable}
                onClick={handleCartClick}
                title="Tambah ke Keranjang"
                style={{
                background: isAdded ? "#10B981" : "#FFFFFF",
                color: isAdded ? "#FFFFFF" : "#B45309",
                border: `1.5px solid ${isAdded ? "#10B981" : "#D97706"}`,
                borderRadius: "8px",
                padding: "6px 9px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isAvailable ? "pointer" : "not-allowed",
                transition: "all 0.15s ease",
                }}
            >
                {isAdded ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
                ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                )}
            </button>

            {/* Tombol Pesan */}
            <button
                type="button"
                disabled={!isAvailable}
                onClick={handleOrderClick}
                style={{
                background: isAvailable
                    ? "linear-gradient(135deg, #B45309, #D97706)"
                    : "#CCCCCC",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: "800",
                cursor: isAvailable ? "pointer" : "not-allowed",
                boxShadow: isAvailable ? "0 2px 6px rgba(180, 83, 9, 0.25)" : "none",
                }}
            >
                {isAvailable ? "+ Pesan" : "Habis"}
            </button>
            </div>
        </div>
        </div>
    );
}