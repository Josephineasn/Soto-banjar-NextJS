"use client";

import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
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

const categories = [
  { id: "semua", name: "Semua Menu" },
  { id: "makanan", name: "Makanan" },
  { id: "cemilan", name: "Cemilan" },
  { id: "pendamping", name: "Pendamping" },
  { id: "minuman", name: "Minuman" },
];

export default function Home() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery] = useState("");
  const [category, setCategory] = useState("semua");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  async function loadMenus() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/menu", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal mengambil menu");
      const data: MenuItem[] = await response.json();
      setMenus(data);
    } catch {
      setError("Menu gagal dimuat dari database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initFetch() {
      try {
        const response = await fetch("/api/menu", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const data: MenuItem[] = await response.json();
        if (isMounted) {
          setMenus(data);
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

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const matchCategory = category === "semua" || menu.category === category;
      const matchSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [menus, category, searchQuery]);

  function addToCartOnly(item: MenuItem) {
    if (item.available === false) return;
    setCart((prev) => {
      const existing = prev.find((ci) => ci.id === item.id);
      if (existing) {
        return prev.map((ci) => (ci.id === item.id ? { ...ci, qty: ci.qty + 1 } : ci));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function directOrder(item: MenuItem) {
    if (item.available === false) return;
    addToCartOnly(item);
    setSelectedMenu(null);
    setCartOpen(true);
  }

  function updateQty(id: number, change: number) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + change } : item))
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

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#FAF6EE",
        color: "#734F31",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <Herobanner onOrderNow={() => scrollToSection("menu")} />

      {/* SECTION MENU */}
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
            borderBottom: "2px solid #E8D1A7",
            paddingBottom: "24px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                backgroundColor: "rgba(157, 145, 103, 0.2)",
                border: "1.5px solid #9D9167",
                color: "#734F31",
                padding: "6px 14px",
                borderRadius: "30px",
                fontSize: "12px",
                fontWeight: "800",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Resep Warisan Asli Banjar
            </div>
            <h2
              style={{
                fontSize: "34px",
                fontWeight: "900",
                color: "#734F31",
                lineHeight: "1.2",
                margin: "0 0 6px 0",
              }}
            >
              Menu Pilihan Kami
            </h2>
            <p style={{ color: "#9D9167", fontSize: "15px", margin: 0, fontWeight: "600" }}>
              Sajian khas Kalimantan Selatan dengan rebusan rempah kayu manis, kapulaga murni, dan jeruk kuit.
            </p>
          </div>

          <button
            type="button"
            onClick={loadMenus}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "11px 20px",
              background: "#ffffff",
              border: "1.5px solid #9D9167",
              borderRadius: "14px",
              boxShadow: "0 3px 10px rgba(157, 145, 103, 0.15)",
              cursor: "pointer",
              color: "#734F31",
              fontSize: "13px",
              fontWeight: "800",
              transition: "all 0.2s ease",
            }}
          >
            Sinkronkan Menu
          </button>
        </div>

        {/* Tab Filter Kategori */}
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
            const isSelected = category === item.id;
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
                  border: isSelected ? "1.5px solid #9D9167" : "1.5px solid #E8D1A7",
                  background: isSelected ? "#9D9167" : "#ffffff",
                  color: isSelected ? "#FAF6EE" : "#734F31",
                  boxShadow: isSelected
                    ? "0 6px 18px rgba(157, 145, 103, 0.35)"
                    : "0 2px 6px rgba(0, 0, 0, 0.02)",
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Grid Menu */}
        {loading ? (
          <div style={{ padding: "70px 0", textAlign: "center", color: "#9D9167", fontSize: "16px", fontWeight: "700" }}>
            Memuat sajian menu dari dapur...
          </div>
        ) : error ? (
          <div style={{ padding: "24px", backgroundColor: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "16px", color: "#b91c1c", fontSize: "14px", textAlign: "center" }}>
            {error}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "#734F31", fontSize: "15px", fontWeight: "600" }}>
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

      {/* SECTION MODULAR */}
      <Aboutsection />
      <ReviewSection />
      <Faqsection />
      <Location />

      {/* FOOTER TUNGGAL */}
      <footer
        style={{
          backgroundColor: "#734F31",
          color: "#E8D1A7",
          padding: "70px 24px 30px",
          borderTop: "4px solid #9D9167",
        }}
      >
        <div
          style={{
            maxWidth: "1220px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "40px",
            paddingBottom: "40px",
            borderBottom: "1px solid rgba(232, 209, 167, 0.2)",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 16px", fontSize: "20px", fontWeight: "900", color: "#E8D1A7" }}>
              Soto Banjar Selera
            </h3>
            <p style={{ fontSize: "13px", color: "#FAF6EE", lineHeight: "1.7", margin: "0 0 16px 0", opacity: 0.9 }}>
              Menyajikan kehangatan resep asli Kalimantan Selatan dengan kebersihan dan kualitas rasa terbaik.
            </p>
            <div
              style={{
                display: "inline-block",
                background: "rgba(232, 209, 167, 0.15)",
                border: "1px solid #E8D1A7",
                borderRadius: "10px",
                padding: "6px 14px",
                fontSize: "12px",
                color: "#E8D1A7",
                fontWeight: "700",
              }}
            >
              Pesan Antar Wilayah Jabodetabek
            </div>
          </div>

          <div>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "900", color: "#E8D1A7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Tautan Cepat
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", lineHeight: "2.3", color: "#FAF6EE" }}>
              <li>
                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>
                  Beranda
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection("menu")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>
                  Daftar Menu
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection("tentang-kami")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>
                  Tentang Kami
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection("faq")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>
                  Tanya Jawab (FAQ)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection("lokasi")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}>
                  Lokasi & Kontak
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: "900", color: "#E8D1A7", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Jam Layanan
            </h4>
            <div style={{ fontSize: "13px", color: "#FAF6EE", lineHeight: "1.8" }}>
              <p style={{ margin: "0 0 4px" }}>Senin - Minggu:</p>
              <strong style={{ color: "#E8D1A7", display: "block", marginBottom: "8px", fontSize: "15px" }}>
                08:00 - 21:00 WIB
              </strong>
              <p style={{ margin: 0, fontSize: "12px", color: "#E8D1A7" }}>
                Menerima Pesanan Catering & Hajatan
              </p>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1220px", margin: "25px auto 0", textAlign: "center", fontSize: "12px", color: "#E8D1A7" }}>
          © 2026 Soto Banjar Selera Nusantara. All rights reserved.
        </div>
      </footer>

      {/* MODAL & DRAWER */}
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
      />

      <OrderHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </main>
  );
}