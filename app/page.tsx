
"use client";

import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
import Herobanner from "@/components/Herobanner";
import MenuCard from "@/components/MenuCard";
import MenuDetailModal from "@/components/MenuDetailModal";
import CartDrawer from "@/components/CartDrawer";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("semua");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [selectedMenu, setSelectedMenu] =
    useState<MenuItem | null>(null);

  async function loadMenus() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/menu", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil menu");
      }

      const data: MenuItem[] = await response.json();
      setMenus(data);
    } catch {
      setError("Menu gagal dimuat dari database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  const timer = setTimeout(() => {
    void loadMenus();
  }, 0);

  return () => clearTimeout(timer);
}, []);
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const matchCategory =
        category === "semua" || menu.category === category;

      const matchSearch = menu.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [menus, category, searchQuery]);

  function addToCart(item: MenuItem) {
    if (!item.available) return;

    setCart((previous) => {
      const existing = previous.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existing) {
        return previous.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      return [...previous, { ...item, qty: 1 }];
    });

    setSelectedMenu(null);
    setCartOpen(true);
  }

  function updateQty(id: number, change: number) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? { ...item, qty: item.qty + change }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeItem(id: number) {
    setCart((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  function scrollToMenu() {
    document
      .getElementById("menu")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#fffdf7",
        color: "#451a03",
      }}
    >
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onGoToOrderForm={() => setCartOpen(true)}
      />

      <Herobanner onOrderNow={scrollToMenu} />

      <section
        id="menu"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "45px 20px",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 900,
              color: "#7c2d12",
              marginBottom: "8px",
            }}
          >
            Menu Pilihan Kami
          </h2>

          <p style={{ color: "#92400e" }}>
            Sajian khas Banjar dengan rempah pilihan.
          </p>

          <button
            onClick={loadMenus}
            style={{
              marginTop: "12px",
              padding: "8px 15px",
              background: "#ffedd5",
              border: "1px solid #fdba74",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#9a3412",
            }}
          >
            ↻ Refresh Menu
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setCategory(item.id)}
              style={{
                padding: "10px 20px",
                borderRadius: "25px",
                cursor: "pointer",
                border: "1px solid #fdba74",
                fontWeight: "bold",
                background:
                  category === item.id ? "#ea580c" : "#ffffff",
                color:
                  category === item.id ? "#ffffff" : "#9a3412",
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Memuat menu dari database...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : filteredMenus.length === 0 ? (
          <p>Menu tidak ditemukan.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredMenus.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onAddToCart={addToCart}
                onOpenDetail={setSelectedMenu}
              />
            ))}
          </div>
        )}
      </section>

      <footer
        style={{
          background: "#431407",
          color: "#fff7ed",
          padding: "30px 20px",
          textAlign: "center",
        }}
      >
        <h3>Soto Banjar Selera Nusantara</h3>
        <p style={{ marginTop: "8px", fontSize: "13px" }}>
          Cita rasa khas Kalimantan Selatan.
        </p>
      </footer>

      <MenuDetailModal
        item={selectedMenu}
        onClose={() => setSelectedMenu(null)}
        onAddToCart={addToCart}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={updateQty}
        onRemoveItem={removeItem}
      />
    </main>
  );
}
