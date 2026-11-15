"use client";

import React, { useEffect, useState } from "react";

interface HerobannerProps {
  onOrderNow?: () => void;
}

interface RawMenuItem {
  id?: number | string;
  name?: string;
  price?: number;
  image?: string;
  sold?: number;
  soldCount?: number;
  totalSold?: number;
}

interface RawOrder {
  status?: string;
  items?: Array<{
    menuId?: number | string;
    name?: string;
    menuName?: string;
    quantity?: number;
    qty?: number;
    price?: number;
    image?: string;
    menu?: RawMenuItem;
  }>;
}

export default function Herobanner({ onOrderNow }: HerobannerProps) {
  const [banner, setBanner] = useState({
    statusBadge: "Dapur Delivery Buka",
    badgeTagline: "Khusus Pesan Online • Area Jabodetabek",
    heroTitle: "Keharuman Rempah Autentik Khas Banjar Langsung ke Rumahmu",
    highlightWord: "Khas Banjar",
    heroSubtitle:
      "Pesan Soto Banjar hangat kaldu ayam kampung murni berpadu kayu manis, kapulaga, cengkeh, dan bunga lawang khas Kalimantan Selatan. Dikemas higienis, anti tumpah, dan cepat sampai tujuan.",
    heroImage:
      "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg",
    featuredLabel: "MENU PALING LARIS • 1 PORSI TERJUAL",
    featuredTitle: "Ekstra Ketupat Lembut",
    featuredPrice: "Rp 10.000",
  });

  // State khusus untuk menu terlaris berdasarkan penjualan nyata (Foto, Nama, Harga, Porsi Terjual)
  const [topSeller, setTopSeller] = useState<{
    name: string;
    priceText: string;
    soldText: string;
    imageUrl: string;
  } | null>(null);

  useEffect(() => {
    async function loadBannerAndTopSales() {
      // 1. Muat teks Hero Banner dari pengaturan Admin (/api/site-content atau localStorage)
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.banner) {
            setBanner((prev) => ({ ...prev, ...data.banner }));
          }
        }
      } catch {
        try {
          const saved = localStorage.getItem("soto_site_content");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed?.banner) {
              setBanner((prev) => ({ ...prev, ...parsed.banner }));
            }
          }
        } catch {
          // Abaikan
        }
      }

      // 2. Hitung penjualan tertinggi dari /api/orders & ambil foto aslinya dari /api/menu
      try {
        const [menuRes, orderRes] = await Promise.all([
          fetch("/api/menu", { cache: "no-store" }).catch(() => null),
          fetch("/api/orders", { cache: "no-store" }).catch(() => null),
        ]);

        const menus: RawMenuItem[] =
          menuRes && menuRes.ok ? await menuRes.json() : [];
        const ordersData: unknown =
          orderRes && orderRes.ok ? await orderRes.json() : [];

        const ordersList: RawOrder[] = Array.isArray(ordersData)
          ? (ordersData as RawOrder[])
          : Array.isArray((ordersData as { orders?: RawOrder[] })?.orders)
          ? ((ordersData as { orders: RawOrder[] }).orders)
          : [];

        // Rekap jumlah porsi terjual per nama menu dari semua pesanan yang aktif / selesai
        const salesCountMap = new Map<string, number>();

        ordersList.forEach((ord) => {
          const st = String(ord.status || "").toUpperCase();
          if (st === "DIBATALKAN" || st === "CANCELLED") return;

          if (Array.isArray(ord.items)) {
            ord.items.forEach((it) => {
              const itemName = String(
                it.name || it.menuName || it.menu?.name || ""
              ).trim();
              const qty = Number(it.quantity ?? it.qty ?? 1);
              if (itemName && qty > 0) {
                const key = itemName.toLowerCase();
                salesCountMap.set(key, (salesCountMap.get(key) || 0) + qty);
              }
            });
          }
        });

        // Cek juga jika di objek menu sudah ada properti sold / soldCount
        menus.forEach((m) => {
          const key = String(m.name || "").trim().toLowerCase();
          const menuSold = Number(m.sold ?? m.soldCount ?? m.totalSold ?? 0);
          if (key && menuSold > (salesCountMap.get(key) || 0)) {
            salesCountMap.set(key, menuSold);
          }
        });

        let bestMenu: RawMenuItem | undefined;
        let maxSold = 0;

        if (salesCountMap.size > 0) {
          salesCountMap.forEach((qty, keyName) => {
            if (qty > maxSold) {
              const matched = menus.find(
                (m) => String(m.name || "").trim().toLowerCase() === keyName
              );
              if (matched) {
                maxSold = qty;
                bestMenu = matched;
              }
            }
          });
        }

        // Jika belum ada transaksi yang cocok, cari menu yang cocok dengan featuredTitle (misal "Ekstra Ketupat Lembut") atau menu pertama
        if (!bestMenu && menus.length > 0) {
          bestMenu =
            menus.find(
              (m) =>
                String(m.name || "")
                  .trim()
                  .toLowerCase() === "ekstra ketupat lembut"
            ) || menus[0];
          maxSold = 1;
        }

        if (bestMenu && bestMenu.name) {
          setTopSeller({
            name: bestMenu.name,
            priceText: `Rp ${Number(bestMenu.price || 10000).toLocaleString("id-ID")}`,
            soldText: `MENU PALING LARIS • ${maxSold} PORSI TERJUAL`,
            imageUrl:
              bestMenu.image ||
              "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg",
          });
        }
      } catch {
        // Gunakan default jika gagal fetch
      }
    }

    void loadBannerAndTopSales();
    window.addEventListener("soto-content-updated", loadBannerAndTopSales);
    return () =>
      window.removeEventListener("soto-content-updated", loadBannerAndTopSales);
  }, []);

  function renderHighlightedText(text: string, highlight: string) {
    if (!highlight || !text.includes(highlight)) {
      return <span>{text}</span>;
    }
    const parts = text.split(highlight);
    return (
      <span>
        {parts[0]}
        <span style={{ color: "#EFE3C8" }}>{highlight}</span>
        {parts[1]}
      </span>
    );
  }

  const displayImage = topSeller?.imageUrl || banner.heroImage;
  const displaySoldLabel = topSeller?.soldText || banner.featuredLabel;
  const displayMenuTitle = topSeller?.name || banner.featuredTitle;
  const displayMenuPrice = topSeller?.priceText || banner.featuredPrice;

  return (
    <section
      style={{
        background:
          "radial-gradient(circle at 75% 35%, #4A321F 0%, #2A1A11 65%, #21130C 100%)",
        color: "#FAF6EE",
        padding: "64px 24px 72px",
        borderBottom: "2px solid #6D4C30",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "48px",
          alignItems: "center",
        }}
      >
        {/* KIRI: Konten Teks, Tombol & Statistik */}
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(232, 209, 167, 0.35)",
                color: "#EFE3C8",
                fontSize: "11.5px",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "999px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#4ADE80",
                }}
              />
              <span>{banner.statusBadge || "Dapur Delivery Buka"}</span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(232, 209, 167, 0.35)",
                color: "#EFE3C8",
                fontSize: "11.5px",
                fontWeight: 800,
                padding: "6px 16px",
                borderRadius: "999px",
              }}
            >
              {banner.badgeTagline}
            </div>
          </div>

          <h1
            style={{
              margin: "0 0 18px",
              fontSize: "clamp(32px, 4.2vw, 48px)",
              fontWeight: 900,
              color: "#FAF6EE",
              lineHeight: 1.18,
              letterSpacing: "-0.5px",
            }}
          >
            {renderHighlightedText(banner.heroTitle, banner.highlightWord)}
          </h1>

          <p
            style={{
              margin: "0 0 28px",
              fontSize: "14.5px",
              color: "#D5C5B3",
              lineHeight: 1.7,
              maxWidth: "540px",
            }}
          >
            {banner.heroSubtitle}
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "32px",
            }}
          >
            <button
              type="button"
              onClick={onOrderNow}
              style={{
                backgroundColor: "#F5EFE4",
                color: "#2A1A11",
                fontSize: "13.5px",
                fontWeight: 900,
                padding: "13px 24px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 22px rgba(0, 0, 0, 0.25)",
              }}
            >
              <span>🍲</span>
              <span>Pesan Sajian Sekarang &rarr;</span>
            </button>

            <a
              href="#tentang"
              style={{
                textDecoration: "none",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(232, 209, 167, 0.35)",
                color: "#EFE3C8",
                fontSize: "13.5px",
                fontWeight: 800,
                padding: "13px 22px",
                borderRadius: "12px",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Kisah Resep Kami
            </a>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(232, 209, 167, 0.2)",
              paddingTop: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(95px, 145px))",
              gap: "16px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "#FAF6EE",
                }}
              >
                100%
              </div>
              <div style={{ fontSize: "11.5px", color: "#B8A692" }}>
                Rempah Asli Banjar
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "#FAF6EE",
                }}
              >
                4.9 &#9733;
              </div>
              <div style={{ fontSize: "11.5px", color: "#B8A692" }}>
                Rating Pelanggan
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: 900,
                  color: "#FAF6EE",
                }}
              >
                20++
              </div>
              <div style={{ fontSize: "11.5px", color: "#B8A692" }}>
                Menu Pilihan
              </div>
            </div>
          </div>
        </div>

        {/* KANAN: Foto Menu Terlaris & Kartu Informasi Penjualan */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            width: "100%",
            maxWidth: "470px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "300px",
              borderRadius: "20px",
              overflow: "hidden",
              border: "2px solid #8A6B47",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={displayMenuTitle}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: "rgba(42, 26, 17, 0.85)",
              border: "1.5px solid #8A6B47",
              borderRadius: "16px",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 900,
                  color: "#E8D1A7",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginBottom: "3px",
                }}
              >
                🔥 {displaySoldLabel}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  color: "#FAF6EE",
                }}
              >
                {displayMenuTitle}
              </div>
            </div>

            <span
              style={{
                backgroundColor: "#FAF6EE",
                color: "#2A1A11",
                fontSize: "13px",
                fontWeight: 900,
                padding: "8px 14px",
                borderRadius: "10px",
                whiteSpace: "nowrap",
              }}
            >
              {displayMenuPrice}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}