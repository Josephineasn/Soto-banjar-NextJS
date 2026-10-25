"use client";
import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Herobanner from "@/components/Herobanner";
import MenuCard from "@/components/MenuCard";
import MenuDetailModal from "@/components/MenuDetailModal";
import CartDrawer from "@/components/CartDrawer";
import CheckoutModal from "@/components/CheckoutModal";
import ReceiptModal from "@/components/ReceiptModal";
import ReviewSection from "@/components/ReviewSection";
import { INITIAL_MENU_ITEMS } from "@/data/menu";
import { MenuItem, CartItem, OrderData } from "@/types";

export default function HomePage() {
  const [menuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [lastOrder, setLastOrder] = useState<OrderData | null>(null);

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const copy = [...prev];
      const newQty = copy[index].qty + delta;
      if (newQty <= 0) return copy.filter((_, i) => i !== index);
      copy[index].qty = newQty;
      return copy;
    });
  };

  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === "semua" || item.category === selectedCategory;
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchCat && matchQuery;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fffdf7" }}>
      <Navbar
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onGoToOrderForm={() => {
          if (cart.length === 0) {
            alert("Pilih minimal satu menu soto atau wadai dahulu ya!");
          } else {
            setIsCheckoutOpen(true);
          }
        }}
      />

      <Herobanner
        onOrderNow={() => {
          const el = document.getElementById("menu-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <main id="menu-section" style={{ maxWidth: "1100px", margin: "0 auto", padding: "36px 16px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#431407", margin: 0, fontFamily: "serif" }}>
              Daftar Menu Siap Antar
            </h2>
            <p style={{ fontSize: "12px", color: "#78350f", margin: "4px 0 0" }}>
              Dimasak segar dengan rempah asli Kalimantan Selatan
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { id: "semua", label: "Semua Menu" },
              { id: "makanan", label: "Makanan Berat" },
              { id: "pendamping", label: "Pendamping" },
              { id: "cemilan", label: "Cemilan" },
              { id: "minuman", label: "Minuman Segar" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  background: selectedCategory === c.id ? "#ea580c" : "#fef3c7",
                  color: selectedCategory === c.id ? "#fff" : "#78350f",
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
          {filteredMenu.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={handleAddToCart}
              onOpenDetail={(i) => setDetailItem(i)}
            />
          ))}
        </div>
      </main>

      <ReviewSection />

      <footer style={{ background: "#451a03", color: "#fef3c7", padding: "24px 16px", textAlign: "center", fontSize: "12px" }}>
        <p style={{ margin: "0 0 4px", fontWeight: "bold" }}>Soto Banjar Selera Nusantara • Delivery Online Khusus Panas</p>
        <p style={{ margin: 0, opacity: 0.8 }}>Project Frontend Kelompok 5 TI-B © 2026. All rights reserved.</p>
      </footer>

      <MenuDetailModal
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateQty}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onSubmitSuccess={(order) => {
          setIsCheckoutOpen(false);
          setLastOrder(order);
          setIsReceiptOpen(true);
        }}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        order={lastOrder}
        onClose={() => {
          setIsReceiptOpen(false);
          setCart([]);
        }}
      />
    </div>
  );
}