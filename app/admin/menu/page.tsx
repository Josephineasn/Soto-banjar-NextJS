"use client";

import React, { useEffect, useMemo, useState } from "react";

interface MenuItem {
  id: number | string;
  name: string;
  category: string;
  price: number;
  rating?: number | string;
  spiceLevel?: string;
  calories?: number | string;
  image?: string;
  description?: string;
  ingredients?: string | string[];
  spices?: string | string[];
  rempah?: string | string[];
  packaging?: string;
  kemasan?: string;
  standardPackaging?: string;
  isFavorite?: boolean;
  isRecommended?: boolean;
  recommended?: boolean;
  bestSeller?: boolean;
}

function checkIsRecommended(item: MenuItem): boolean {
  return Boolean(
    item.isRecommended ?? item.isFavorite ?? item.recommended ?? item.bestSeller
  );
}

function formatIngredientsText(raw: unknown): string {
  if (!raw) return "";
  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");
  }
  const str = String(raw).trim();
  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const parsed: unknown = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean)
          .join(", ");
      }
    } catch {
      return str
        .replace(/^\[|\]$/g, "")
        .replace(/"/g, "")
        .split(",")
        .map((s) => s.trim())
        .join(", ");
    }
  }
  return str;
}

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([
    "makanan",
    "cemilan",
    "pendamping",
    "minuman",
  ]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modal Kelola Kategori (Tambah, Edit, Hapus)
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [newCatInput, setNewCatInput] = useState<string>("");
  const [editingCatOldName, setEditingCatOldName] = useState<string | null>(null);
  const [editingCatNewName, setEditingCatNewName] = useState<string>("");

  // Modal Tambah / Edit Menu
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // State Form Menu
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("makanan");
  const [price, setPrice] = useState<string>("35000");
  const [rating, setRating] = useState<string>("4.8");
  const [spiceLevel, setSpiceLevel] = useState<string>("Tidak Pedas");
  const [calories, setCalories] = useState<string>("350");
  const [image, setImage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");
  const [packaging, setPackaging] = useState<string>(
    "Wadah Food Grade Kedap Udara"
  );
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch("/api/menu", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        if (menuRes.ok) {
          const menuData: unknown = await menuRes.json();
          if (Array.isArray(menuData)) {
            setMenus(menuData as MenuItem[]);
          }
        }

        if (catRes.ok) {
          const catData: unknown = await catRes.json();
          if (Array.isArray(catData) && catData.length > 0) {
            setCategoryList(catData.map((c) => String(c).toLowerCase()));
          }
        }
      } catch (err) {
        console.error("Gagal memuat data menu & kategori:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadInitialData();
  }, []);

  // Fungsi Tambah Kategori Baru
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const clean = newCatInput.trim().toLowerCase();
    if (!clean) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      if (res.ok) {
        const updatedCats = (await res.json()) as string[];
        setCategoryList(updatedCats);
      }
    } catch (err) {
      console.error("Gagal menambah kategori:", err);
    }

    setNewCatInput("");
    setSelectedCategory(clean);
  }

  // Fungsi Simpan Edit Nama Kategori
  async function handleSaveEditCategory(oldName: string) {
    const cleanNew = editingCatNewName.trim().toLowerCase();
    if (!cleanNew || cleanNew === oldName) {
      setEditingCatOldName(null);
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: cleanNew }),
      });
      if (res.ok) {
        const updatedCats = (await res.json()) as string[];
        setCategoryList(updatedCats);
        // Update juga state menu lokal yang memakai kategori lama
        setMenus((prev) =>
          prev.map((m) =>
            (m.category || "").toLowerCase() === oldName
              ? { ...m, category: cleanNew }
              : m
          )
        );
        if (selectedCategory === oldName) {
          setSelectedCategory(cleanNew);
        }
      }
    } catch (err) {
      console.error("Gagal mengubah kategori:", err);
    }

    setEditingCatOldName(null);
    setEditingCatNewName("");
  }

  // Fungsi Hapus Kategori
  async function handleDeleteCategory(catName: string) {
    if (
      !confirm(
        `Hapus kategori "${catName}"? Semua menu di kategori ini akan dipindahkan ke kategori Makanan.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/categories?name=${encodeURIComponent(catName)}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        const updatedCats = (await res.json()) as string[];
        setCategoryList(updatedCats);
        setMenus((prev) =>
          prev.map((m) =>
            (m.category || "").toLowerCase() === catName
              ? { ...m, category: "makanan" }
              : m
          )
        );
        if (selectedCategory === catName) {
          setSelectedCategory("ALL");
        }
      }
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
    }
  }

  function openAddModal() {
    setEditingMenu(null);
    setName("");
    setCategory(
      selectedCategory !== "ALL" ? selectedCategory.toLowerCase() : "makanan"
    );
    setPrice("35000");
    setRating("4.9");
    setSpiceLevel("Tidak Pedas");
    setCalories("350");
    setImage("");
    setDescription("");
    setIngredients("Kayu Manis, Kapulaga, Cengkeh, Bawang Merah Banjar");
    setPackaging("Wadah Food Grade (Kuah Dipisah)");
    setIsFavorite(false);
    setIsModalOpen(true);
  }

  function openEditModal(item: MenuItem) {
    setEditingMenu(item);
    setName(item.name || "");
    setCategory((item.category || "makanan").toLowerCase());
    setPrice(String(item.price ?? 0));
    setRating(String(item.rating ?? "4.8"));
    setSpiceLevel(item.spiceLevel || "Tidak Pedas");
    setCalories(
      String(item.calories ?? "350")
        .replace(/kkal/gi, "")
        .trim()
    );
    setImage(item.image || "");
    setDescription(item.description || "");

    const rawIng = item.ingredients ?? item.spices ?? item.rempah ?? "";
    setIngredients(formatIngredientsText(rawIng));

    const rawPack =
      item.packaging ??
      item.kemasan ??
      item.standardPackaging ??
      "Kotak makanan";
    setPackaging(String(rawPack));

    setIsFavorite(checkIsRecommended(item));
    setIsModalOpen(true);
  }

  async function handleToggleRecommendCard(item: MenuItem) {
    const nextRec = !checkIsRecommended(item);
    setMenus((prev) =>
      prev.map((m) =>
        m.id === item.id
          ? {
              ...m,
              isFavorite: nextRec,
              isRecommended: nextRec,
              recommended: nextRec,
              bestSeller: nextRec,
            }
          : m
      )
    );

    try {
      await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFavorite: nextRec,
          isRecommended: nextRec,
          recommended: nextRec,
          bestSeller: nextRec,
        }),
      });
    } catch (err) {
      console.error("Gagal mengubah status rekomendasi:", err);
    }
  }

  async function handleSaveMenu(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);

    const cleanIngredients = ingredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    const payload = {
      name: name.trim(),
      category: category.toLowerCase(),
      price: Number(price) || 0,
      rating: Number(rating) || 4.8,
      spiceLevel: spiceLevel.trim() || "Tidak Pedas",
      calories: Number(calories) || 0,
      image: image.trim() || "/soto-banjar.jpg",
      description: description.trim(),
      ingredients: cleanIngredients,
      spices: cleanIngredients,
      packaging: packaging.trim() || "Kotak makanan",
      isFavorite,
      isRecommended: isFavorite,
      recommended: isFavorite,
      bestSeller: isFavorite,
    };

    try {
      if (editingMenu) {
        const res = await fetch(`/api/menu/${editingMenu.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const updated = (await res.json()) as MenuItem;
          setMenus((prev) =>
            prev.map((m) =>
              m.id === editingMenu.id ? { ...m, ...payload, ...updated } : m
            )
          );
        }
      } else {
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const created = (await res.json()) as MenuItem;
          setMenus((prev) => [created, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan menu:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteMenu(id: number | string, menuName: string) {
    if (!confirm(`Hapus menu "${menuName}" dari daftar sajian?`)) return;

    setMenus((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Gagal menghapus menu:", err);
    }
  }

  const allTabs = useMemo(() => ["ALL", ...categoryList], [categoryList]);

  const filteredMenus = useMemo(() => {
    return menus.filter((m) => {
      const matchCat =
        selectedCategory === "ALL" ||
        (m.category || "").toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menus, selectedCategory, searchQuery]);

  const recommendedCount = useMemo(
    () => menus.filter((m) => checkIsRecommended(m)).length,
    [menus]
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FAF6EE",
        minHeight: "100vh",
      }}
    >
      {/* HEADER HALAMAN */}
      <header
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E5DEC9",
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 900,
              color: "#2A1A11",
            }}
          >
            Kelola Menu Sajian
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#6D4C30",
            }}
          >
            Atur katalog kuliner Banjar, rekomendasi terlaris, kategori menu, racikan rempah, dan kemasan.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setIsCatModalOpen(true)}
            style={{
              backgroundColor: "#FAF6EE",
              color: "#2A1A11",
              border: "1.5px solid #D6C7B2",
              padding: "11px 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            🏷️ Kelola Kategori ({categoryList.length})
          </button>

          <button
            type="button"
            onClick={openAddModal}
            style={{
              backgroundColor: "#5C3A21",
              color: "#FFFFFF",
              border: "none",
              padding: "12px 22px",
              borderRadius: "12px",
              fontSize: "13.5px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 6px 16px rgba(92, 58, 33, 0.25)",
            }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>＋</span> Tambah Menu Baru
          </button>
        </div>
      </header>

      <div
        style={{
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* RINGKASAN STATISTIK MENU */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#8A6B47" }}>
                Total Sajian Aktif
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#2A1A11",
                  marginTop: "4px",
                }}
              >
                {menus.length} <span style={{ fontSize: "13px", fontWeight: 700 }}>Menu</span>
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#FEF3C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🍲
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#8A6B47" }}>
                Menu Rekomendasi / Terlaris
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#B45309",
                  marginTop: "4px",
                }}
              >
                {recommendedCount}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Rekomendasi</span>
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#FDE68A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ⭐
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#8A6B47" }}>
                Kategori Tersedia
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#166534",
                  marginTop: "4px",
                }}
              >
                {categoryList.length}{" "}
                <span style={{ fontSize: "13px", fontWeight: 700 }}>Kategori</span>
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#DCFCE7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              🏷️
            </div>
          </div>
        </div>

        {/* BAR FILTER KATEGORI & PENCARIAN */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "18px",
            padding: "16px 20px",
            border: "1.5px solid #E5DEC9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            {allTabs.map((cat) => {
              const active = selectedCategory === cat;
              const count =
                cat === "ALL"
                  ? menus.length
                  : menus.filter(
                      (m) => (m.category || "").toLowerCase() === cat.toLowerCase()
                    ).length;

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "30px",
                    border: active ? "1.5px solid #2A1A11" : "1px solid #D6C7B2",
                    backgroundColor: active ? "#2A1A11" : "#FFFFFF",
                    color: active ? "#FFFFFF" : "#2A1A11",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    textTransform: cat === "ALL" ? "none" : "capitalize",
                    boxShadow: active ? "0 4px 10px rgba(42,26,17,0.18)" : "none",
                  }}
                >
                  {cat === "ALL" ? "Semua Menu" : cat} ({count})
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsCatModalOpen(true)}
              style={{
                padding: "8px 14px",
                borderRadius: "30px",
                border: "1.5px dashed #8A6B47",
                backgroundColor: "#FAF6EE",
                color: "#5C3A21",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              + Tambah / Edit Kategori
            </button>
          </div>

          <div style={{ position: "relative", minWidth: "250px", flex: "0 1 300px" }}>
            <input
              type="text"
              placeholder="🔍 Cari nama menu atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "12px",
                border: "1.5px solid #D6C7B2",
                backgroundColor: "#FAF6EE",
                fontSize: "13px",
                color: "#2A1A11",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* GRID KARTU MENU */}
        {loading ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1.5px solid #E5DEC9",
              color: "#6D4C30",
              fontWeight: 800,
            }}
          >
            Memuat katalog menu...
          </div>
        ) : filteredMenus.length === 0 ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1.5px dashed #D6C7B2",
              color: "#8A6B47",
              fontWeight: 700,
            }}
          >
            Belum ada sajian di kategori{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {selectedCategory === "ALL" ? "ini" : selectedCategory}
            </strong>
            . Klik <strong>+ Tambah Menu Baru</strong> untuk mengisi kategori ini.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredMenus.map((item) => {
              const isRec = checkIsRecommended(item);
              const calText = String(item.calories ?? "350").includes("kkal")
                ? String(item.calories)
                : `${item.calories ?? 350} kkal`;
              const ratingVal = item.rating ?? "4.8";
              const ingText = formatIngredientsText(
                item.ingredients ?? item.spices ?? item.rempah
              );
              const packText =
                item.packaging ??
                item.kemasan ??
                item.standardPackaging ??
                "Kotak makanan";

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "20px",
                    border: isRec ? "2px solid #F59E0B" : "1.5px solid #E5DEC9",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "0 6px 18px rgba(42, 26, 17, 0.04)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        position: "relative",
                        height: "175px",
                        width: "100%",
                        backgroundColor: "#F4EFE6",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={item.image || "/soto-banjar.jpg"}
                        alt={item.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />

                      <span
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                          backgroundColor: "rgba(42, 26, 17, 0.85)",
                          color: "#FAF6EE",
                          padding: "4px 11px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 800,
                          textTransform: "capitalize",
                        }}
                      >
                        {item.category || "Makanan"}
                      </span>

                      <button
                        type="button"
                        onClick={() => void handleToggleRecommendCard(item)}
                        title="Klik untuk mengubah status Rekomendasi / Terlaris di Web Customer"
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          backgroundColor: isRec
                            ? "#FEF3C7"
                            : "rgba(255, 255, 255, 0.9)",
                          color: isRec ? "#92400E" : "#475569",
                          border: isRec
                            ? "1.5px solid #F59E0B"
                            : "1px solid #CBD5E1",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 900,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        }}
                      >
                        {isRec ? "★ Rekomendasi" : "☆ Jadikan Rekomendasi"}
                      </button>
                    </div>

                    <div style={{ padding: "16px 18px 12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: 900,
                            color: "#2A1A11",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.name}
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: "#B45309",
                            backgroundColor: "#FEF3C7",
                            padding: "2px 8px",
                            borderRadius: "8px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          ⭐ {ratingVal}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: "17px",
                          fontWeight: 900,
                          color: "#166534",
                          marginBottom: "8px",
                        }}
                      >
                        Rp {Number(item.price || 0).toLocaleString("id-ID")}
                      </div>

                      {item.description && (
                        <p
                          style={{
                            margin: "0 0 10px",
                            fontSize: "12px",
                            color: "#6D4C30",
                            lineHeight: 1.45,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.description}
                        </p>
                      )}

                      <div
                        style={{
                          backgroundColor: "#FFFDF7",
                          border: "1px solid #EFE3C8",
                          borderRadius: "10px",
                          padding: "8px 10px",
                          marginBottom: "10px",
                          fontSize: "11.5px",
                          color: "#432818",
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#734F31" }}>
                            🌿 Racikan Rempah:{" "}
                          </strong>
                          <span>{ingText || "Rempah pilihan khas Banjar"}</span>
                        </div>
                        <div
                          style={{
                            borderTop: "1px dashed #E5DEC9",
                            paddingTop: "4px",
                          }}
                        >
                          <strong style={{ color: "#734F31" }}>📦 Kemasan: </strong>
                          <span>{packText}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        <span
                          style={{
                            backgroundColor: "#FAF6EE",
                            border: "1px solid #E5DEC9",
                            color: "#6D4C30",
                            padding: "3px 9px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          🌶️ {item.spiceLevel || "Tidak Pedas"}
                        </span>
                        <span
                          style={{
                            backgroundColor: "#EFF6FF",
                            border: "1px solid #BFDBFE",
                            color: "#1D4ED8",
                            padding: "3px 9px",
                            borderRadius: "8px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          🔥 {calText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px 18px 16px",
                      borderTop: "1px solid #F4EFE6",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1.5px solid #D6C7B2",
                        backgroundColor: "#FAF6EE",
                        color: "#2A1A11",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      ✎ Edit Menu
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteMenu(item.id, item.name)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "10px",
                        border: "none",
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL KELOLA KATEGORI (TAMBAH, EDIT, HAPUS) */}
      {isCatModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsCatModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              padding: "26px",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E5DEC9",
                paddingBottom: "12px",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "#2A1A11",
                  }}
                >
                  🏷️ Kelola Kategori Menu
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6D4C30" }}>
                  Kategori baru otomatis muncul di sebelah kanan Cemilan (Admin &amp; Customer).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            {/* Form Tambah Kategori */}
            <form
              onSubmit={(e) => void handleAddCategory(e)}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="Ketik kategori baru (misal: Paket Hemat)..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#5C3A21",
                  color: "#FFFFFF",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                + Tambah
              </button>
            </form>

            {/* Daftar Kategori Aktif (Bisa Edit & Hapus) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {categoryList.map((cat) => {
                const count = menus.filter(
                  (m) => (m.category || "").toLowerCase() === cat.toLowerCase()
                ).length;
                const isEditing = editingCatOldName === cat;

                return (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      backgroundColor: "#FAF6EE",
                      border: "1px solid #E5DEC9",
                      gap: "10px",
                    }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingCatNewName}
                        onChange={(e) => setEditingCatNewName(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1.5px solid #5C3A21",
                          backgroundColor: "#FFFFFF",
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      />
                    ) : (
                      <div>
                        <span
                          style={{
                            fontSize: "13.5px",
                            fontWeight: 800,
                            color: "#2A1A11",
                            textTransform: "capitalize",
                          }}
                        >
                          {cat}
                        </span>
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11.5px",
                            color: "#8A6B47",
                            fontWeight: 700,
                          }}
                        >
                          ({count} menu)
                        </span>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "6px" }}>
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleSaveEditCategory(cat)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "8px",
                              border: "none",
                              backgroundColor: "#166534",
                              color: "#FFFFFF",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Simpan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatOldName(null)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "8px",
                              border: "1px solid #CBD5E1",
                              backgroundColor: "#FFFFFF",
                              color: "#475569",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Batal
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatOldName(cat);
                              setEditingCatNewName(cat);
                            }}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "8px",
                              border: "1px solid #D6C7B2",
                              backgroundColor: "#FFFFFF",
                              color: "#2A1A11",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            ✎ Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteCategory(cat)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "8px",
                              border: "none",
                              backgroundColor: "#FEE2E2",
                              color: "#DC2626",
                              fontSize: "11.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT MENU LENGKAP */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <form
            onSubmit={handleSaveMenu}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "660px",
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              padding: "26px 28px",
              border: "1.5px solid #E5DEC9",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
              maxHeight: "92vh",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E5DEC9",
                paddingBottom: "12px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: 900,
                  color: "#2A1A11",
                }}
              >
                {editingMenu
                  ? `Edit Sajian: ${editingMenu.name}`
                  : "✎ Tambah Menu Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "1px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "5px",
                  }}
                >
                  Nama Menu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Lempeng Pisang / Soto Banjar"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "5px",
                  }}
                >
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "13px",
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {categoryList.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "5px",
                  }}
                >
                  Harga Porsi (Rp)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "5px",
                  }}
                >
                  Rating Menu (★)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="4.8"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "5px",
                  }}
                >
                  Estimasi Kalori (kkal)
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="300"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                    marginBottom: "5px",
                  }}
                >
                  Tingkat Kepedasan
                </label>
                <select
                  value={spiceLevel}
                  onChange={(e) => setSpiceLevel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FAF6EE",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  <option value="Tidak Pedas">Tidak Pedas</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Pedas">Pedas</option>
                  <option value="Manis / Gurih">Manis / Gurih</option>
                </select>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#FFFDF7",
                border: "1.5px solid #EFE3C8",
                borderRadius: "14px",
                padding: "14px",
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#734F31",
                    marginBottom: "5px",
                  }}
                >
                  🌿 Racikan Rempah Khas / Komposisi (Pisahkan Koma)
                </label>
                <input
                  type="text"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Contoh: Pisang, Tepung Terigu, Gula"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "9px",
                    border: "1px solid #D6C7B2",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12.5px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#734F31",
                    marginBottom: "5px",
                  }}
                >
                  📦 Standar Kemasan Pengiriman
                </label>
                <input
                  type="text"
                  value={packaging}
                  onChange={(e) => setPackaging(e.target.value)}
                  placeholder="Contoh: Kotak makanan / Wadah Kedap"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "9px",
                    border: "1px solid #D6C7B2",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12.5px",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  marginBottom: "5px",
                }}
              >
                URL Gambar Foto Menu
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  marginBottom: "5px",
                }}
              >
                Deskripsi Sajian
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Hidangan khas Banjar berbahan..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FAF6EE",
                  fontSize: "13px",
                }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                fontWeight: 800,
                color: "#2A1A11",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#5C3A21" }}
              />
              <span>Tandai sebagai Menu Favorit / Rekomendasi Terlaris di Website</span>
            </label>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "4px",
                borderTop: "1px solid #E5DEC9",
                paddingTop: "14px",
              }}
            >
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  color: "#2A1A11",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#5C3A21",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {submitting
                  ? "Menyimpan..."
                  : editingMenu
                  ? "Simpan Perubahan"
                  : "Simpan Menu Baru"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}