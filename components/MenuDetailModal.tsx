"use client";
import { MenuItem } from "@/types";

interface MenuDetailModalProps {
    item: MenuItem | null;
    onClose: () => void;
    onAddToCart: (item: MenuItem) => void;
}

type DetailMenuWithBadge = MenuItem & {
    spicyLevel?: string;
    spiceLevel?: string;
    badge?: string | null;
    badgeColor?: string | null;
    isRecommended?: boolean;
};

const MENU_BADGE_MAP_KEY = "soto_menu_badge_map";

// Palet warna badge pada modal detail menu
const MODAL_BADGE_PALETTE: Record<string, { background: string; color: string }> = {
    amber: { background: "#D97706", color: "#FFFFFF" },
    red: { background: "#DC2626", color: "#FFFFFF" },
    brown: { background: "#2A1A11", color: "#EFE3C8" },
    green: { background: "#15803D", color: "#FFFFFF" },
    blue: { background: "#1D4ED8", color: "#FFFFFF" },
    purple: { background: "#7E22CE", color: "#FFFFFF" },
    pink: { background: "#DB2777", color: "#FFFFFF" },
};

// Membaca badge dan warna custom
function readDetailSavedBadge(
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

// Mengecek apakah teks badge menandakan stok habis
function isDetailSoldOut(badgeText: string): boolean {
    const n = badgeText.trim().toLowerCase();
    return n === "sold out" || n === "habis";
}

// Menentukan warna background dan teks badge
function getDetailBadgeStyle(
    badgeText: string,
    badgeColor?: string | null
): { background: string; color: string } {
    const key = String(badgeColor ?? "").trim().toLowerCase();
    if (key && MODAL_BADGE_PALETTE[key]) {
        return MODAL_BADGE_PALETTE[key];
    }
    const lower = badgeText.trim().toLowerCase();
    if (lower === "sold out" || lower === "habis" || lower.includes("pedas")) {
        return MODAL_BADGE_PALETTE.red;
    }
    if (
        lower.includes("rekomendasi") ||
        lower.includes("best") ||
        lower.includes("terlaris")
    ) {
        return MODAL_BADGE_PALETTE.amber;
    }
    return MODAL_BADGE_PALETTE.brown;
}

export default function MenuDetailModal({
    item,
    onClose,
    onAddToCart,
}: MenuDetailModalProps) {
    if (!item) return null;

    const extendedItem = item as DetailMenuWithBadge;
    const savedBadgeEntry = readDetailSavedBadge(item.id);

    const activeBadge = String(
        extendedItem.badge ??
            savedBadgeEntry?.badge ??
            (item.available === false
                ? "Sold Out"
                : item.popular || extendedItem.isRecommended
                ? "Rekomendasi"
                : "")
    ).trim();

    const activeBadgeColor =
        extendedItem.badgeColor ?? savedBadgeEntry?.badgeColor ?? "amber";

    // Menentukan status ketersediaan menu dan warna badge aktif
    const isAvailable =
        item.available !== false && !isDetailSoldOut(activeBadge);
    const badgeColors = getDetailBadgeStyle(activeBadge, activeBadgeColor);

    const spiceText =
        extendedItem.spicyLevel || extendedItem.spiceLevel || "Tidak Pedas";

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "16px",
                zIndex: 1000,
                overflowY: "auto",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    maxWidth: "440px",
                    width: "100%",
                    maxHeight: "calc(100vh - 32px)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    border: "2px solid #f59e0b",
                    boxShadow: "0 16px 36px rgba(0,0,0,0.28)",
                    margin: "auto",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        position: "relative",
                        height: "clamp(140px, 24vh, 195px)",
                        flexShrink: 0,
                    }}
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

                    {activeBadge ? (
                        <span
                            style={{
                                position: "absolute",
                                top: "12px",
                                left: "12px",
                                background: badgeColors.background,
                                color: badgeColors.color,
                                padding: "4px 10px",
                                borderRadius: "10px",
                                fontSize: "11px",
                                fontWeight: "900",
                                textTransform: "uppercase",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                            }}
                        >
                            {activeBadge}
                        </span>
                    ) : null}

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup detail menu"
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "rgba(0,0,0,0.65)",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ✕
                    </button>
                </div>

                <div
                    style={{
                        padding: "16px 18px 18px",
                        overflowY: "auto",
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "6px",
                            gap: "8px",
                        }}
                    >
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
                        <span
                            style={{ fontSize: "12px", fontWeight: "bold", color: "#44403c" }}
                        >
                            ★ {item.rating} • {item.calories || "350 kkal"}
                        </span>
                    </div>

                    <h3
                        style={{
                            margin: "6px 0",
                            fontSize: "19px",
                            color: isAvailable ? "#1c1917" : "#78716c",
                            fontWeight: "800",
                        }}
                    >
                        {item.name}
                    </h3>

                    <p
                        style={{
                            fontSize: "12.5px",
                            color: "#78716c",
                            margin: "0 0 14px",
                            lineHeight: "1.5",
                        }}
                    >
                        {item.description}
                    </p>

                    <div
                        style={{
                            background: "#fffbeb",
                            padding: "12px",
                            borderRadius: "10px",
                            marginBottom: "14px",
                            border: "1px solid #fed7aa",
                            fontSize: "11.5px",
                            lineHeight: "1.5",
                        }}
                    >
                        <div style={{ marginBottom: "6px" }}>
                            <span
                                style={{
                                    fontWeight: "bold",
                                    color: "#78350f",
                                    display: "block",
                                }}
                            >
                                Racikan Rempah Khas:
                            </span>
                            <span style={{ color: "#ea580c", fontWeight: "600" }}>
                                {Array.isArray(item.spices)
                                    ? item.spices.join(" • ")
                                    : String(item.spices || "").trim().length > 0
                                    ? String(item.spices)
                                    : "Kayu Manis • Kapulaga • Cengkeh • Pekak • Pala"}
                            </span>
                        </div>

                        <div
                            style={{
                                borderTop: "1px dashed #fcd34d",
                                paddingTop: "6px",
                                marginBottom: "6px",
                            }}
                        >
                            <span style={{ fontWeight: "bold", color: "#78350f" }}>
                                Tingkat Kepedasan / Rasa:{" "}
                            </span>
                            <span
                                style={{
                                    background: "#ffedd5",
                                    color: "#c2410c",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    fontWeight: "700",
                                }}
                            >
                                {spiceText}
                            </span>
                        </div>

                        <div
                            style={{ borderTop: "1px dashed #fcd34d", paddingTop: "6px" }}
                        >
                            <span style={{ fontWeight: "bold", color: "#78350f" }}>
                                Standar Kemasan:{" "}
                            </span>
                            <span style={{ color: "#451a03" }}>
                                {item.packagingInfo ||
                                    "Kemasan pouch tahan panas & anti-tumpah"}
                            </span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderTop: "1px solid #fef3c7",
                            paddingTop: "12px",
                            gap: "12px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <span
                                style={{
                                    fontSize: "10px",
                                    color: "#a8a29e",
                                    display: "block",
                                    fontWeight: "bold",
                                }}
                            >
                                HARGA PORSI
                            </span>
                            <strong
                                style={{
                                    fontSize: "19px",
                                    color: isAvailable ? "#ea580c" : "#78716c",
                                }}
                            >
                                Rp {item.price.toLocaleString("id-ID")}
                            </strong>
                        </div>

                        <button
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                                if (isAvailable) {
                                    onAddToCart(item);
                                    onClose();
                                }
                            }}
                            style={{
                                background: isAvailable
                                    ? "linear-gradient(90deg, #ea580c, #f59e0b)"
                                    : "#d6d3d1",
                                color: isAvailable ? "#ffffff" : "#78716c",
                                border: "none",
                                padding: "10px 18px",
                                borderRadius: "12px",
                                fontWeight: "bold",
                                fontSize: "13px",
                                cursor: isAvailable ? "pointer" : "not-allowed",
                                boxShadow: isAvailable
                                    ? "0 3px 8px rgba(234,88,12,0.25)"
                                    : "none",
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