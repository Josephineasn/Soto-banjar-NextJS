"use client";

import { useEffect, useMemo, useState } from "react";

import Navbar from "@/components/Navbar";
import Herobanner from "@/components/Herobanner";
import MenuCard from "@/components/MenuCard";
import MenuDetailModal from "@/components/MenuDetailModal";
import CartDrawer from "@/components/CartDrawer";
import type { MenuItem, CartItem } from "@/types";

const categories = [
  { id: "semua", name: "Semua Menu", icon: "✨" },
  { id: "makanan", name: "Makanan", icon: "🍲" },
  { id: "cemilan", name: "Cemilan", icon: "🍌" },
  { id: "pendamping", name: "Pendamping", icon: "🥚" },
  { id: "minuman", name: "Minuman", icon: "🍹" },
];

const faqs = [
  {
    question: "Apakah kuah soto dikirim terpisah agar tidak tumpah?",
    answer:
      "Ya, kuah kaldu rempah dikemas khusus menggunakan standing pouch tahan panas food-grade berlapis rapat dan disegel terpisah dari ketupat, suwiran ayam kampung, dan perkedel untuk menjaga kesegaran serta rasa gurih optimal.",
  },
  {
    question: "Berapa lama waktu pengantaran di wilayah Jabodetabek?",
    answer:
      "Untuk kurir instan rata-rata tiba dalam 30 - 45 menit setelah pesanan selesai diracik. Kami memastikan setiap porsi dikemas higienis dengan thermal bag agar tiba dalam kondisi masih hangat siap santap.",
  },
  {
    question: "Apakah seluruh menu dijamin 100% Halal?",
    answer:
      "Seluruh bahan baku yang kami olah, mulai dari ayam kampung pilihan, telur bebek, sayuran segar, hingga bumbu rempah dapur telah bersertifikasi halal dan dimasak tanpa bahan pengawet.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer:
      "Kami menerima pembayaran otomatis melalui QRIS (GoPay, OVO, DANA, ShopeePay, BCA, dll.), Virtual Account Bank nasional, serta metode Transfer Bank langsung.",
  },
];

export default function Home() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery] = useState("");
  const [category, setCategory] = useState("semua");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  function addToCartOnly(item: MenuItem) {
    if (item.available === false) return;

    setCart((previous) => {
      const existing = previous.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return previous.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      return [...previous, { ...item, qty: 1 }];
    });
  }

  function directOrder(item: MenuItem) {
    if (item.available === false) return;

    addToCartOnly(item);
    setSelectedMenu(null);
    setCartOpen(true);
  }

  function updateQty(id: number, change: number) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + change } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeItem(id: number) {
    setCart((previous) => previous.filter((item) => item.id !== id));
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
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <Navbar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      <Herobanner onOrderNow={() => scrollToSection("menu")} />

      {/* MENU & FILTER KATEGORI */}
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
                gap: "8px",
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
              <span>🌿</span> Resep Warisan Asli Banjar
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
            <span style={{ fontSize: "16px" }}>↻</span> Sinkronkan Menu
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
                  gap: "8px",
                  padding: "11px 24px",
                  borderRadius: "50px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: isSelected ? "800" : "700",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                  border: isSelected ? "1.5px solid #9D9167" : "1.5px solid #E8D1A7",
                  background: isSelected ? "#9D9167" : "#ffffff", // Olive Harvest
                  color: isSelected ? "#FAF6EE" : "#734F31",
                  boxShadow: isSelected
                    ? "0 6px 18px rgba(157, 145, 103, 0.35)"
                    : "0 2px 6px rgba(0, 0, 0, 0.02)",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Grid Menu */}
        {loading ? (
          <div
            style={{
              padding: "70px 0",
              textAlign: "center",
              color: "#9D9167",
              fontSize: "16px",
              fontWeight: "700",
            }}
          >
            ⏳ Memuat sajian menu dari dapur...
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
            ⚠️ {error}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "#734F31",
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

      {/* FILOSOFI RASA */}
      <section
        id="tentang-kami"
        style={{
          backgroundColor: "#734F31",
          color: "#FAF6EE",
          padding: "90px 24px",
          borderTop: "3px solid #9D9167",
          borderBottom: "3px solid #9D9167",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "55px",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", width: "100%", maxWidth: "480px", margin: "0 auto" }}>
            <div
              style={{
                borderRadius: "28px",
                overflow: "hidden",
                border: "4px solid #E8D1A7",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
                aspectRatio: "4/3",
              }}
            >
              <img
                src="https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
                alt="Soto Banjar Otentik"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "-20px",
                right: "15px",
                backgroundColor: "#734F31",
                border: "1.5px solid #E8D1A7",
                borderRadius: "18px",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
              }}
            >
              <span style={{ fontSize: "28px" }}>🥣</span>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "900", color: "#E8D1A7" }}>
                  100% Rempah Asli
                </h4>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#FAF6EE" }}>
                  Resep Turun-Temurun Kalimantan
                </p>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                display: "inline-block",
                background: "rgba(232, 209, 167, 0.2)",
                border: "1.5px solid #E8D1A7",
                color: "#E8D1A7",
                fontSize: "11px",
                fontWeight: "900",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: "30px",
                marginBottom: "18px",
                letterSpacing: "0.5px",
              }}
            >
              🍴 FILOSOFI RASA
            </div>

            <h2
              style={{
                fontSize: "36px",
                fontWeight: "900",
                lineHeight: "1.25",
                color: "#E8D1A7",
                marginBottom: "20px",
              }}
            >
              Warisan Cita Rasa Hangat dari <br />
              <span style={{ color: "#FAF6EE" }}>Bumi Kalimantan</span>
            </h2>

            <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#E8D1A7", marginBottom: "14px", opacity: 0.95 }}>
              Soto Banjar Selera Nusantara berakar dari kecintaan kami melestarikan kuliner legendaris khas Banjarmasin. Kunci kelezatan sup kami terletak pada simfoni rempah aromatik pilihan: kayu manis, cengkeh, kapulaga, pala, dan bunga lawang yang ditumis harum dengan mentega berkualitas sebelum dipadukan ke dalam rebusan kaldu murni.
            </p>

            <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#E8D1A7", marginBottom: "32px", opacity: 0.95 }}>
              Kami hanya menggunakan 100% ayam kampung segar yang menghasilkan kaldu gurih alami tanpa bahan pengawet. Disajikan lengkap bersama ketupat lembut, perkedel kentang legit, suwiran ayam tebal, telur bebek rebus, serta kucuran perasan jeruk kuit khas yang harum menyegarkan.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div
                style={{
                  background: "rgba(232, 209, 167, 0.1)",
                  border: "1px solid #E8D1A7",
                  borderRadius: "16px",
                  padding: "18px",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🍗</div>
                <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "800", color: "#E8D1A7" }}>
                  Ayam Kampung Asli
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#FAF6EE", lineHeight: "1.5" }}>
                  Daging manis alami berpadu kaldu gurih kaya nutrisi rempah.
                </p>
              </div>

              <div
                style={{
                  background: "rgba(232, 209, 167, 0.1)",
                  border: "1px solid #E8D1A7",
                  borderRadius: "16px",
                  padding: "18px",
                }}
              >
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🍊</div>
                <h4 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "800", color: "#E8D1A7" }}>
                  Jeruk Kuit Segar
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#FAF6EE", lineHeight: "1.5" }}>
                  Aroma sitrus khas Banjar yang autentik dan menyegarkan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        style={{
          backgroundColor: "#FAF6EE",
          padding: "90px 24px",
        }}
      >
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "45px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "rgba(157, 145, 103, 0.2)",
                border: "1.5px solid #9D9167",
                color: "#734F31",
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                padding: "6px 16px",
                borderRadius: "30px",
                marginBottom: "12px",
                letterSpacing: "0.5px",
              }}
            >
              Q n A
            </div>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#734F31",
                margin: "0 0 10px 0",
              }}
            >
              Pertanyaan Umum (FAQ)
            </h2>
            <p style={{ fontSize: "15px", color: "#9D9167", margin: 0, fontWeight: "600" }}>
              Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#ffffff",
                    border: isOpen ? "2px solid #9D9167" : "1.5px solid #E8D1A7",
                    borderLeft: isOpen ? "6px solid #734F31" : "1.5px solid #E8D1A7",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: isOpen
                      ? "0 10px 25px rgba(115, 79, 49, 0.08)"
                      : "0 3px 10px rgba(0, 0, 0, 0.02)",
                    transition: "all 0.25s ease",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{
                      width: "100%",
                      padding: "20px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isOpen ? "rgba(232, 209, 167, 0.2)" : "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: isOpen ? "#9D9167" : "rgba(232, 209, 167, 0.5)",
                          color: isOpen ? "#ffffff" : "#734F31",
                          fontSize: "14px",
                          fontWeight: "900",
                        }}
                      >
                        ?
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "800",
                          color: "#734F31",
                        }}
                      >
                        {faq.question}
                      </span>
                    </div>
                    <span
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.25s ease",
                        color: "#9D9167",
                        fontSize: "16px",
                        fontWeight: "900",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 24px 22px 66px",
                        fontSize: "14px",
                        lineHeight: "1.8",
                        color: "#734F31",
                        backgroundColor: "rgba(232, 209, 167, 0.2)",
                        borderTop: "1px dashed #E8D1A7",
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LOKASI & JAM OPERASIONAL */}
      <section
        id="lokasi"
        style={{
          background: "#FAF6EE",
          padding: "90px 24px 70px",
          borderTop: "2px solid #E8D1A7",
        }}
      >
        <div style={{ maxWidth: "1220px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#9D9167",
                color: "#FAF6EE",
                fontSize: "12px",
                fontWeight: "900",
                textTransform: "uppercase",
                padding: "6px 18px",
                borderRadius: "30px",
                marginBottom: "12px",
                letterSpacing: "0.8px",
              }}
            >
              KUNJUNGI RUMAH MAKAN
            </div>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "900",
                color: "#734F31",
                margin: "0 0 10px 0",
              }}
            >
              Lokasi & Jam Operasional
            </h2>
            <p style={{ fontSize: "15px", color: "#9D9167", margin: 0, fontWeight: "600" }}>
              Datang langsung untuk menikmati sajian hangat di tempat yang nyaman dan asri.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "35px",
              alignItems: "stretch",
            }}
          >

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #E8D1A7",
                  borderRadius: "22px",
                  padding: "24px",
                  boxShadow: "0 8px 24px rgba(115, 79, 49, 0.05)",
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    background: "#9D9167",
                    color: "#ffffff",
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  📍
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "900", color: "#734F31" }}>
                    Alamat Restoran
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#9D9167", lineHeight: "1.6", fontWeight: "600" }}>
                    Wisma Atlet Tower 3, Kemayoran, Jakarta Pusat
                  </p>
                  <a
                    href="https://maps.google.com/?q=Wisma+Atlet+Tower+3+Kemayoran"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      fontSize: "12px",
                      color: "#734F31",
                      fontWeight: "800",
                      textDecoration: "none",
                    }}
                  >
                    Buka di Google Maps ↗
                  </a>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #E8D1A7",
                  borderRadius: "22px",
                  padding: "24px",
                  boxShadow: "0 8px 24px rgba(115, 79, 49, 0.05)",
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    background: "#9D9167",
                    color: "#ffffff",
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  🕒
                </div>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "900", color: "#734F31" }}>
                      Jam Buka
                    </h4>
                    <span
                      style={{
                        background: "#E8D1A7",
                        color: "#734F31",
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "2px 8px",
                        borderRadius: "20px",
                      }}
                    >
                      🟢 Buka Hari Ini
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#734F31", marginBottom: "6px" }}>
                    <span>Senin - Jumat:</span>
                    <strong style={{ color: "#734F31" }}>08.00 - 21.00 WIB</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#734F31" }}>
                    <span>Sabtu - Minggu:</span>
                    <strong style={{ color: "#734F31" }}>07.30 - 22.00 WIB</strong>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #E8D1A7",
                  borderRadius: "22px",
                  padding: "24px",
                  boxShadow: "0 8px 24px rgba(115, 79, 49, 0.05)",
                  display: "flex",
                  gap: "18px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    background: "#9D9167",
                    color: "#ffffff",
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  📞
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "900", color: "#734F31" }}>
                    Kontak & Reservasi
                  </h4>
                  <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#734F31" }}>
                    Telepon/WA: <strong style={{ color: "#734F31" }}>+62 812-3456-7890</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#9D9167", fontWeight: "600" }}>
                    Email: info@sotobanjar-selera.id
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div
              style={{
                borderRadius: "24px",
                overflow: "hidden",
                border: "2px solid #E8D1A7",
                boxShadow: "0 12px 30px rgba(115, 79, 49, 0.08)",
                minHeight: "380px",
                background: "#fff",
              }}
            >
              <iframe
                title="Peta Lokasi Soto Banjar"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.862423377708!2d106.85764027498978!3d-6.149170293837943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f59239845bfd%3A0xc3cf27a9c35a8bc1!2sWisma%20Atlet%20Kemayoran%20Tower%203!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "380px", display: "block" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span style={{ fontSize: "28px" }}>🍲</span>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#E8D1A7" }}>
                Soto Banjar Selera
              </h3>
            </div>
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
              🚚 Pesan Antar Wilayah Jabodetabek
            </div>
          </div>

          <div>
            <h4
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: "900",
                color: "#E8D1A7",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Tautan Cepat
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", lineHeight: "2.3", color: "#FAF6EE" }}>
              <li>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("menu")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Daftar Menu
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("tentang-kami")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Tentang Kami
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("faq")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Tanya Jawab (FAQ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection("lokasi")}
                  style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
                >
                  Lokasi & Kontak
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: "900",
                color: "#E8D1A7",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
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

          <div>
            <h4
              style={{
                margin: "0 0 16px",
                fontSize: "14px",
                fontWeight: "900",
                color: "#E8D1A7",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Ikuti Kami
            </h4>
            <div style={{ display: "flex", gap: "12px" }}>
              {["📷", "📘", "🎵"].map((icon, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(232, 209, 167, 0.2)",
                    border: "1px solid #E8D1A7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "16px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1220px", margin: "25px auto 0", textAlign: "center", fontSize: "12px", color: "#E8D1A7" }}>
          © 2026 Soto Banjar Selera Nusantara. All rights reserved.
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
      />
    </main>
  );
}