"use client";

import React, { useEffect, useState } from "react";
import { MenuItem } from "@/types";

export interface MenuCardProps {
    item: MenuItem;
    onAddToCart: (item: MenuItem) => void;
    onOrder: (item: MenuItem) => void;
    onOpenDetail: (item: MenuItem) => void;
}

export type MenuFilterMeta = MenuItem & {
    spicyLevel?: string;
    spiceLevel?: string;
    levelPedas?: string;
    badge?: string | null;
    badgeColor?: string | null;
    isRecommended?: boolean;
};

const MENU_BADGE_MAP_KEY = "soto_menu_badge_map";

const CARD_BADGE_PALETTE: Record<string, { background: string; color: string }> = {
    amber: { background: "#D97706", color: "#FFFFFF" },
    red: { background: "#DC2626", color: "#FFFFFF" },
    brown: { background: "#2A1A11", color: "#EFE3C8" },
    green: { background: "#15803D", color: "#FFFFFF" },
    blue: { background: "#1D4ED8", color: "#FFFFFF" },
    purple: { background: "#7E22CE", color: "#FFFFFF" },
    pink: { background: "#DB2777", color: "#FFFFFF" },
};

export function getItemSpicyLevel(item: MenuItem): string {
    const raw = item as MenuFilterMeta;
    const text = String(
        raw.spicyLevel ?? raw.spiceLevel ?? raw.levelPedas ?? ""
    ).trim();
    return text || "Tidak Pedas";
}

export function matchesSpecificMenuFilter(
    item: MenuItem,
    options: {
        spicyFilter?: string;
        maxPrice?: number | null;
        minPrice?: number | null;
    }
): boolean {
    const spicyFilter = String(options.spicyFilter ?? "ALL").trim();
    if (spicyFilter && spicyFilter !== "ALL") {
        const itemSpicy = getItemSpicyLevel(item).toLowerCase();
        const targetSpicy = spicyFilter.toLowerCase();
        if (targetSpicy === "pedas") {
            if (!itemSpicy.includes("pedas") || itemSpicy.includes("tidak pedas")) {
                return false;
            }
        } else if (itemSpicy !== targetSpicy && !itemSpicy.includes(targetSpicy)) {
            return false;
        }
    }

    const priceVal = Number(item.price ?? 0);
    if (typeof options.minPrice === "number" && !Number.isNaN(options.minPrice)) {
        if (priceVal < options.minPrice) return false;
    }
    if (typeof options.maxPrice === "number" && !Number.isNaN(options.maxPrice)) {
        if (priceVal > options.maxPrice) return false;
    }

    return true;
}

// Mengambil data badge custom milik menu
function readSavedBadgeForCard(
    id: string | number
): { badge?: string; badgeColor?: string } | null {
    try {
        const raw = localStorage.getItem(MENU_BADGE_MAP_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Record<
            string,
            { badge?: string; badgeColor?: string }
        >;
        return parsed?.[String(id)] ?? null;
    } catch {
        return null;
    }
}

// Mengecek apakah teks badge menandakan stok habis sehingga tombol pesan harus dinonaktifkan
function isSoldOutCardBadge(badgeText: string): boolean {
    const n = badgeText.trim().toLowerCase();
    return n === "sold out" || n === "habis";
}

function getCardBadgeColors(
    badgeText: string,
    badgeColor?: string | null
): { background: string; color: string } {
    const key = String(badgeColor ?? "").trim().toLowerCase();
    if (key && CARD_BADGE_PALETTE[key]) {
        return CARD_BADGE_PALETTE[key];
    }
    const lower = badgeText.trim().toLowerCase();
    if (lower === "sold out" || lower === "habis" || lower.includes("pedas")) {
        return CARD_BADGE_PALETTE.red;
    }
    if (
        lower.includes("rekomendasi") ||
        lower.includes("best") ||
        lower.includes("terlaris")
    ) {
        return CARD_BADGE_PALETTE.amber;
    }
    return CARD_BADGE_PALETTE.brown;
}

export default function MenuCard({
    item,
    onAddToCart,
    onOrder,
    onOpenDetail,
}: MenuCardProps) {
    const rawItem = item as MenuFilterMeta;

    const [localOverride, setLocalOverride] = useState<{
        badge?: string;
        badgeColor?: string;
    } | null>(() => readSavedBadgeForCard(item.id));

    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        const syncLocal = () => {
            setLocalOverride(readSavedBadgeForCard(item.id));
        };
        syncLocal();
        window.addEventListener("soto-menu-updated", syncLocal);
        window.addEventListener("storage", syncLocal);
        return () => {
            window.removeEventListener("soto-menu-updated", syncLocal);
            window.removeEventListener("storage", syncLocal);
        };
    }, [item.id]);

    // Menentukan teks badge aktif, warna badge, dan status ketersediaan menu
    const activeBadge = String(
        rawItem.badge ??
            localOverride?.badge ??
            (item.available === false
                ? "Sold Out"
                : item.popular || rawItem.isRecommended
                ? "Rekomendasi"
                : "")
    ).trim();

    const activeBadgeColor =
        rawItem.badgeColor ?? localOverride?.badgeColor ?? "amber";

    const isAvailable =
        item.available !== false && !isSoldOutCardBadge(activeBadge);
    const badgeColors = getCardBadgeColors(activeBadge, activeBadgeColor);
    const spicyLabel = getItemSpicyLevel(item);

    // Menambahkan item ke keranjang
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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

                    {/* Menampilkan badge */}
                    {activeBadge ? (
                        <span
                            style={{
                                position: "absolute",
                                top: "12px",
                                left: "12px",
                                background: badgeColors.background,
                                color: badgeColors.color,
                                padding: "4px 12px",
                                borderRadius: "10px",
                                fontSize: "10px",
                                fontWeight: "900",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
                                textTransform: "uppercase",
                            }}
                        >
                            {activeBadge}
                        </span>
                    ) : null}

                    {/* Menampilkan rating menu */}
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

                {/* Bagian kategori, label tingkat kepedasan, nama menu, dan deskripsi */}
                <div style={{ padding: "18px" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "6px",
                            flexWrap: "wrap",
                        }}
                    >
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

                        <span
                            style={{
                                fontSize: "10px",
                                background: "#FAF6EE",
                                color: "#6D4C41",
                                border: "1px solid #E5D9C5",
                                padding: "3px 8px",
                                borderRadius: "6px",
                                fontWeight: "800",
                            }}
                        >
                            {spicyLabel}
                        </span>
                    </div>

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
                    padding: "12px 14px",
                    borderTop: "1px solid #F3EDE2",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: isAvailable ? "#FAF6EE" : "#F5F5F5",
                }}
            >
                <strong
                    style={{
                        color: isAvailable ? "#B45309" : "#9E9E9E",
                        fontSize: "14px",
                        fontWeight: "900",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    Rp {item.price.toLocaleString("id-ID")}
                </strong>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button
                        type="button"
                        onClick={() => onOpenDetail(item)}
                        style={{
                            background: "#FFFFFF",
                            border: "1px solid #E5D9C5",
                            borderRadius: "8px",
                            padding: "6px 8px",
                            fontSize: "11px",
                            fontWeight: "700",
                            cursor: "pointer",
                            color: "#6D4C41",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Detail
                    </button>

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
                            padding: "5px 7px",
                            fontSize: "11px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: isAvailable ? "pointer" : "not-allowed",
                            transition: "all 0.15s ease",
                            flexShrink: 0,
                        }}
                    >
                        {isAdded ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
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
                                width="14"
                                height="14"
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
                            padding: "6px 10px",
                            fontSize: "11px",
                            fontWeight: "800",
                            cursor: isAvailable ? "pointer" : "not-allowed",
                            boxShadow: isAvailable ? "0 2px 6px rgba(180, 83, 9, 0.25)" : "none",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                        }}
                    >
                        {isAvailable ? "+ Pesan" : "Habis"}
                    </button>
                </div>
            </div>
        </div>
    );
}