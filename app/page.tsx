"use client";

import { useEffect, useMemo, useState } from "react";

import AuthModal from "@/components/AuthModal";
import Navbar, { type CustomerPageTab } from "@/components/Navbar";
import Herobanner from "@/components/Herobanner";
import MenuCard from "@/components/MenuCard";
import MenuDetailModal from "@/components/MenuDetailModal";
import CartDrawer from "@/components/CartDrawer";
import OrderHistoryModal from "@/components/OrderHistoryModal";
import Aboutsection from "@/components/Aboutsection";
import Faqsection from "@/components/Faqsection";
import Location from "@/components/Location";
import ReviewSection from "@/components/ReviewSection";
import type { MenuItem, CartItem } from "@/types";

export interface UserSession {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

function formatCategoryLabel(slug: string): string {
  return slug
    .split(" ")
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ");
}

export default function Home() {
  const [activePage, setActivePage] = useState<CustomerPageTab>("beranda");

  const [authOpen, setAuthOpen] = useState(false);
  const [authWarningOpen, setAuthWarningOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [serverCategories, setServerCategories] = useState<string[]>([
    "makanan",
    "cemilan",
    "pendamping",
    "minuman",
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("semua");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  // State Dinamis untuk Header Menu & Footer dari Admin Content
  const [menuHeader, setMenuHeader] = useState({
    menuBadge: "Resep Warisan Asli Banjar",
    menuTitle: "Menu Pilihan Kami",
    menuSubtitle:
      "Sajian khas Kalimantan Selatan dengan rebusan rempah kayu manis, kapulaga murni, dan jeruk kuit.",
  });

  const [footerInfo, setFooterInfo] = useState({
    brandName: "Soto Banjar Selera",
    footerDesc:
      "Menyajikan kehangatan resep asli Kalimantan Selatan dengan kebersihan dan kualitas rasa terbaik.",
    deliveryBadge: "Pesan Antar Wilayah Jabodetabek",
    address:
      "Jl. Pluit Karang Indah Timur Blok O8, Muara Karang, Jakarta Utara 14450",
    openDays: "Senin - Minggu",
    openHours: "08:00 - 21:00 WIB",
    cateringNote: "Menerima Pesanan Catering & Hajatan",
    instagram: "@sotobanjar.selera",
    tiktok: "@sotobanjarselera",
    whatsapp: "0812-3456-7890",
    facebook: "Soto Banjar Selera",
    copyright: "© 2026 Soto Banjar Selera Nusantara. All rights reserved.",
  });

  useEffect(() => {
    async function initAuthSession() {
      localStorage.removeItem("soto_customer_user");
      localStorage.removeItem("user");
      localStorage.removeItem("soto_user");
      localStorage.removeItem("soto_custom_categories");

      const activeTabUser = sessionStorage.getItem("soto_active_user");
      if (activeTabUser) {
        try {
          const parsed = JSON.parse(activeTabUser) as UserSession;
          setCurrentUser(parsed);
          return;
        } catch {
          sessionStorage.removeItem("soto_active_user");
        }
      }

      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch {
      }
      setCurrentUser(null);
    }

    void initAuthSession();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
    }
    localStorage.removeItem("soto_customer_user");
    sessionStorage.removeItem("soto_active_user");
    setCurrentUser(null);
    setCart([]);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadDynamicSiteContent() {
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data?.menuSection) {
              setMenuHeader((prev) => ({ ...prev, ...data.menuSection }));
            }
            if (data?.locationFooter) {
              setFooterInfo((prev) => ({ ...prev, ...data.locationFooter }));
            }
          }
          return;
        }
      } catch {
      }
      try {
        const saved = localStorage.getItem("soto_site_content");
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (parsed?.menuSection) {
            setMenuHeader((prev) => ({ ...prev, ...parsed.menuSection }));
          }
          if (parsed?.locationFooter) {
            setFooterInfo((prev) => ({ ...prev, ...parsed.locationFooter }));
          }
        }
      } catch {
      }
    }

    async function initFetch() {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch("/api/menu", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }).catch(() => null),
        ]);

        if (!menuRes.ok) throw new Error();
        const data: MenuItem[] = await menuRes.json();

        if (isMounted) {
          setMenus(data);
        }

        if (catRes && catRes.ok && isMounted) {
          const rawCats: unknown = await catRes.json();
          if (Array.isArray(rawCats) && rawCats.length > 0) {
            setServerCategories(
              rawCats
                .map((c) => String(c).trim().toLowerCase())
                .filter((c) => Boolean(c) && c !== "makanan ringan")
            );
          }
        }
      } catch {
        if (isMounted) {
          setError("Menu gagal dimuat dari database.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void initFetch();
    void loadDynamicSiteContent();

    window.addEventListener("soto-content-updated", loadDynamicSiteContent);
    return () => {
      isMounted = false;
      window.removeEventListener(
        "soto-content-updated",
        loadDynamicSiteContent
      );
    };
  }, []);

  const categories = useMemo(() => {
    const cleanServer = serverCategories.filter(
      (c) => Boolean(c) && c !== "semua" && c !== "makanan ringan"
    );

    return [
      { id: "semua", name: "Semua Menu" },
      ...cleanServer.map((id) => ({
        id,
        name: formatCategoryLabel(id),
      })),
    ];
  }, [serverCategories]);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const menuCat = String(menu.category || "").trim().toLowerCase();
      const selectedCat = category.trim().toLowerCase();
      const matchCategory = selectedCat === "semua" || menuCat === selectedCat;
      const matchSearch = menu.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menus, category, searchQuery]);

  function addToCartOnly(item: MenuItem) {
    if (!currentUser) {
      setAuthWarningOpen(true);
      return;
    }
    if (item.available === false) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function directOrder(item: MenuItem) {
    if (!currentUser) {
      setAuthWarningOpen(true);
      return;
    }
    if (item.available === false) return;
    addToCartOnly(item);
    setSelectedMenu(null);
    setCartOpen(true);
  }

  function updateQty(id: number, change: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + change } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeItem(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  function goToPage(page: CustomerPageTab) {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      setActivePage("menu");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const renderMenuSection = () => (
    <section
      id="menu"
      style={{
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "60px 24px 50px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "20px",
          marginBottom: "32px",
          borderBottom: "2px solid #8A6B47",
          paddingBottom: "24px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "rgba(109, 76, 48, 0.15)",
              border: "1.5px solid #8A6B47",
              color: "#432818",
              padding: "6px 14px",
              borderRadius: "30px",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            {menuHeader.menuBadge}
          </div>
          <h2
            style={{
              fontSize: "34px",
              fontWeight: "900",
              color: "#2A1A11",
              lineHeight: "1.2",
              margin: "0 0 6px 0",
            }}
          >
            {menuHeader.menuTitle}
          </h2>
          <p
            style={{
              color: "#6D4C30",
              fontSize: "15px",
              margin: 0,
              fontWeight: "600",
            }}
          >
            {menuHeader.menuSubtitle}
          </p>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Cari menu soto, sate, minuman..."
          style={{
            padding: "11px 16px",
            borderRadius: "14px",
            border: "1.5px solid #8A6B47",
            backgroundColor: "#FFFFFF",
            color: "#2A1A11",
            fontSize: "13px",
            fontWeight: 600,
            minWidth: "250px",
            outline: "none",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          overflowX: "auto",
          paddingBottom: "10px",
          marginBottom: "36px",
          scrollbarWidth: "none",
        }}
      >
        {categories.map((item) => {
          const isSelected = category.toLowerCase() === item.id.toLowerCase();
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setCategory(item.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "11px 24px",
                borderRadius: "50px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isSelected ? "800" : "700",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                border: isSelected
                  ? "1.5px solid #2A1A11"
                  : "1.5px solid #D6C7B2",
                background: isSelected ? "#2A1A11" : "#FFFFFF",
                color: isSelected ? "#EFE3C8" : "#432818",
                boxShadow: isSelected
                  ? "0 6px 18px rgba(42, 26, 17, 0.25)"
                  : "0 2px 6px rgba(0, 0, 0, 0.03)",
              }}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div
          style={{
            padding: "70px 0",
            textAlign: "center",
            color: "#6D4C30",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          Memuat sajian menu dari dapur...
        </div>
      ) : error ? (
        <div
          style={{
            padding: "24px",
            backgroundColor: "#fef2f2",
            border: "1.5px solid #fecaca",
            borderRadius: "16px",
            color: "#b91c1c",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      ) : filteredMenus.length === 0 ? (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            color: "#432818",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          {`Pencarian "${searchQuery}" tidak ditemukan pada kategori ini.`}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "28px",
          }}
        >
          {filteredMenus.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={addToCartOnly}
              onOrder={directOrder}
              onOpenDetail={setSelectedMenu}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF6EE",
        color: "#2A1A11",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => {
          if (!currentUser) {
            setAuthWarningOpen(true);
          } else {
            setCartOpen(true);
          }
        }}
        onOpenHistory={() => {
          if (!currentUser) {
            setAuthWarningOpen(true);
          } else {
            setHistoryOpen(true);
          }
        }}
        onOpenAuth={() => setAuthOpen(true)}
        currentUser={currentUser}
        onUpdateUser={(updatedUser) => setCurrentUser(updatedUser)}
        onLogout={handleLogout}
        activePage={activePage}
        onNavigatePage={goToPage}
      />

      {authWarningOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            zIndex: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setAuthWarningOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              backgroundColor: "#FAF6EE",
              borderRadius: "20px",
              border: "2px solid #8A6B47",
              padding: "36px 30px 28px",
              textAlign: "center",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 10px",
                fontSize: "19px",
                fontWeight: "900",
                color: "#2A1A11",
              }}
            >
              Silakan Masuk / Buat Akun
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: "13px",
                color: "#6D4C30",
                lineHeight: "1.6",
              }}
            >
              Hanya pelanggan yang telah masuk akun yang dapat{" "}
              <strong>memesan sajian</strong> dan{" "}
              <strong>memberikan ulasan</strong> cita rasa restoran.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthWarningOpen(false);
                  setAuthOpen(true);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2A1A11",
                  color: "#EFE3C8",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                Masuk / Buat Akun Sekarang
              </button>
              <button
                type="button"
                onClick={() => setAuthWarningOpen(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#E5DEC9",
                  color: "#432818",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          sessionStorage.setItem("soto_active_user", JSON.stringify(user));
          setAuthOpen(false);
        }}
      />

      <div style={{ flex: 1 }}>
        {activePage !== "beranda" && (
          <div
            style={{
              backgroundColor: "#EFE3C8",
              borderBottom: "1.5px solid #8A6B47",
              padding: "14px 24px",
            }}
          >
            <div
              style={{
                maxWidth: "1240px",
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2A1A11",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={() => goToPage("beranda")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2A1A11",
                    fontWeight: 800,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Beranda
                </button>
                <span>/</span>
                <span style={{ textTransform: "capitalize", fontWeight: 900 }}>
                  Halaman {activePage}
                </span>
              </div>

              <button
                type="button"
                onClick={() => goToPage("beranda")}
                style={{
                  padding: "7px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #2A1A11",
                  backgroundColor: "#FFFFFF",
                  color: "#2A1A11",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ← Kembali ke Tampilan Awal (Beranda)
              </button>
            </div>
          </div>
        )}

        {activePage === "beranda" && (
          <>
            <Herobanner onOrderNow={() => scrollToSection("menu")} />
            {renderMenuSection()}
            <Aboutsection />
            <ReviewSection
              currentUser={currentUser}
              onRequireAuth={() => setAuthWarningOpen(true)}
            />
            <Faqsection />
            <Location />
          </>
        )}

        {activePage === "menu" && renderMenuSection()}
        {activePage === "tentang" && <Aboutsection />}
        {activePage === "ulasan" && (
          <ReviewSection
            currentUser={currentUser}
            onRequireAuth={() => setAuthWarningOpen(true)}
          />
        )}
        {activePage === "faq" && <Faqsection />}
        {activePage === "lokasi" && <Location />}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          backgroundColor: "#2A1A11",
          color: "#EFE3C8",
          padding: "70px 24px 30px",
          borderTop: "4px solid #6D4C30",
        }}
      >
        <div
          style={{
            maxWidth: "1220px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "34px",
            paddingBottom: "40px",
            borderBottom: "1px solid rgba(239, 227, 200, 0.2)",
          }}
        >
          {/* Brand */}
          <div>
            <h3
              style={{
                margin: "0 0 16px",
                fontSize: "20px",
                fontWeight: "900",
                color: "#EFE3C8",
              }}
            >
              {footerInfo.brandName}
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#D5C5B3",
                lineHeight: "1.7",
                margin: "0 0 16px 0",
              }}
            >
              {footerInfo.footerDesc}
            </p>
            <div
              style={{
                display: "inline-block",
                background: "rgba(239, 227, 200, 0.12)",
                border: "1px solid #8A6B47",
                borderRadius: "10px",
                padding: "6px 14px",
                fontSize: "12px",
                color: "#EFE3C8",
                fontWeight: "700",
              }}
            >
              {footerInfo.deliveryBadge}
            </div>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h4
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: "900",
                color: "#EFE3C8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Tautan Cepat
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "13px",
                lineHeight: "2.3",
                color: "#D5C5B3",
              }}
            >
              <li>
                <button
                  type="button"
                  onClick={() => goToPage("beranda")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goToPage("menu")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Daftar Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goToPage("tentang")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Tentang Kami
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goToPage("ulasan")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Ulasan Pelanggan
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goToPage("faq")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Tanya Jawab (FAQ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => goToPage("lokasi")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Lokasi &amp; Kontak
                </button>
              </li>
            </ul>
          </div>

          {/* Lokasi & Jam Layanan */}
          <div>
            <h4
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: "900",
                color: "#EFE3C8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Lokasi &amp; Jam Layanan
            </h4>
            <div
              style={{ fontSize: "13px", color: "#D5C5B3", lineHeight: "1.7" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EFE3C8"
                  strokeWidth="2.2"
                  style={{ marginTop: "3px", flexShrink: 0 }}
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{footerInfo.address}</span>
              </div>
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: "12px",
                  color: "#D5C5B3",
                }}
              >
                {footerInfo.openDays}:
              </p>
              <strong
                style={{
                  color: "#EFE3C8",
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "14px",
                }}
              >
                {footerInfo.openHours}
              </strong>
              <p style={{ margin: 0, fontSize: "12px", color: "#EFE3C8" }}>
                {footerInfo.cateringNote}
              </p>
            </div>
          </div>

          {/* Media Sosial dengan Logo Asli */}
          <div>
            <h4
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: "900",
                color: "#EFE3C8",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Media Sosial
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#D5C5B3",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background:
                      "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </span>
                <span>{footerInfo.instagram}</span>
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#D5C5B3",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#000000",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </span>
                <span>{footerInfo.tiktok}</span>
              </a>

              <a
                href={`https://wa.me/${footerInfo.whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#D5C5B3",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#25D366",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.126.556 4.122 1.527 5.854l-1.527 5.576 5.714-1.499c1.693.923 3.631 1.449 5.694 1.449 6.627 0 12-5.373 12-12s-5.373-12-12.408-11.38z" />
                  </svg>
                </span>
                <span>{footerInfo.whatsapp}</span>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#D5C5B3",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    backgroundColor: "#1877F2",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </span>
                <span>{footerInfo.facebook}</span>
              </a>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: "1220px",
            margin: "25px auto 0",
            textAlign: "center",
            fontSize: "12px",
            color: "#EFE3C8",
          }}
        >
          {footerInfo.copyright}
        </div>
      </footer>

      <MenuDetailModal
        item={selectedMenu}
        onClose={() => setSelectedMenu(null)}
        onAddToCart={directOrder}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        currentUser={currentUser}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <OrderHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        currentUser={currentUser}
      />
    </main>
  );
}