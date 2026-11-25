"use client";

import React, { useEffect, useMemo, useState } from "react";

interface MenuItem {
  id: number | string;
  name: string;
  category: string;
  price: number;
  rating?: number | string;
  spicyLevel?: string;
  spiceLevel?: string;
  calories?: number | string;
  image?: string;
  description?: string;
  spices?: string | string[];
  ingredients?: string | string[];
  packagingInfo?: string;
  packaging?: string;
  popular?: boolean;
  isFavorite?: boolean;
  isRecommended?: boolean;
  available?: boolean;
  badge?: string | null;
  badgeColor?: string | null;
}

export interface BadgeMetaEntry {
  badge: string;
  badgeColor: string;
}

export interface BadgeColorOption {
  hex: string;
  label: string;
}

const DEFAULT_BADGE_PRESETS = ["Sold Out", "Best Seller", "Rekomendasi", "Pedas"];

// Daftar warna awal yang namanya juga bisa diedit atau dihapus admin
const DEFAULT_BADGE_COLOR_OPTIONS: BadgeColorOption[] = [
  { hex: "#D97706", label: "Emas" },
  { hex: "#DC2626", label: "Merah" },
  { hex: "#2A1A11", label: "Coklat Tua" },
  { hex: "#15803D", label: "Hijau" },
  { hex: "#1D4ED8", label: "Biru" },
  { hex: "#7E22CE", label: "Ungu" },
  { hex: "#DB2777", label: "Pink" },
];

const MENU_BADGE_MAP_KEY = "soto_menu_badge_map";
const CUSTOM_BADGE_LIST_KEY = "soto_custom_badge_presets";
const BADGE_COLOR_OPTIONS_KEY = "soto_badge_color_options";
const LEGACY_SAVED_COLORS_KEY = "soto_saved_badge_colors";
const ADMIN_MENUS_CACHE_KEY = "soto_admin_menus_cache";

// Menghitung warna teks (putih atau coklat gelap) agar kontras di atas warna hex apa pun
function getContrastTextForHex(hexColor: string): string {
  const clean = hexColor.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return "#FFFFFF";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#2A1A11" : "#FFFFFF";
}

// Mengonversi nilai badgeColor (nama preset lama atau kode hex) menjadi kode hex valid
function resolveHexColorValue(badgeColor?: string | null): string {
  const raw = String(badgeColor ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();

  const legacyIdMap: Record<string, string> = {
    amber: "#D97706",
    red: "#DC2626",
    brown: "#2A1A11",
    green: "#15803D",
    blue: "#1D4ED8",
    purple: "#7E22CE",
    pink: "#DB2777",
  };
  return legacyIdMap[raw.toLowerCase()] || "#D97706";
}

// Membaca seluruh pilihan warna beserta nama kustomnya dari localStorage
function readBadgeColorOptions(): BadgeColorOption[] {
  if (typeof window === "undefined") return [...DEFAULT_BADGE_COLOR_OPTIONS];
  try {
    const raw = localStorage.getItem(BADGE_COLOR_OPTIONS_KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => {
            const obj = item as Partial<BadgeColorOption>;
            const hex = String(obj?.hex ?? "").trim().toUpperCase();
            const label = String(obj?.label ?? "").trim() || hex;
            return { hex, label };
          })
          .filter((item) => /^#[0-9A-F]{6}$/.test(item.hex));
      }
    }

    // Migrasi otomatis dari key warna tersimpan versi sebelumnya jika ada
    const legacyRaw = localStorage.getItem(LEGACY_SAVED_COLORS_KEY);
    const merged: BadgeColorOption[] = [...DEFAULT_BADGE_COLOR_OPTIONS];
    if (legacyRaw) {
      const legacyParsed: unknown = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        for (const item of legacyParsed) {
          const hex = String(item).trim().toUpperCase();
          if (
            /^#[0-9A-F]{6}$/.test(hex) &&
            !merged.some((m) => m.hex === hex)
          ) {
            merged.push({ hex, label: hex });
          }
        }
      }
    }
    localStorage.setItem(BADGE_COLOR_OPTIONS_KEY, JSON.stringify(merged));
    return merged;
  } catch {}
  return [...DEFAULT_BADGE_COLOR_OPTIONS];
}

// Menyimpan daftar pilihan warna beserta nama kustomnya ke localStorage
function writeBadgeColorOptions(options: BadgeColorOption[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BADGE_COLOR_OPTIONS_KEY, JSON.stringify(options));
  } catch {}
}

// Menyimpan daftar menu terbaru ke localStorage agar langsung terbaca oleh halaman Customer
function writeAdminMenusCache(list: MenuItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_MENUS_CACHE_KEY, JSON.stringify(list));
  } catch {}
}

function readMenuBadgeMap(): Record<string, BadgeMetaEntry> {
  try {
    const raw = localStorage.getItem(MENU_BADGE_MAP_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, BadgeMetaEntry>)
      : {};
  } catch {
    return {};
  }
}

function saveMenuBadgeMapEntry(
  menuId: string | number,
  entry: BadgeMetaEntry | null
) {
  try {
    const current = readMenuBadgeMap();
    const key = String(menuId);
    if (!entry || !entry.badge.trim()) {
      delete current[key];
    } else {
      current[key] = {
        badge: entry.badge.trim(),
        badgeColor: entry.badgeColor || "#D97706",
      };
    }
    localStorage.setItem(MENU_BADGE_MAP_KEY, JSON.stringify(current));
  } catch {}
}

// Membaca daftar seluruh pilihan badge (bawaan + custom) dari localStorage
function readAllBadgePresets(): string[] {
  if (typeof window === "undefined") return [...DEFAULT_BADGE_PRESETS];
  try {
    const raw = localStorage.getItem(CUSTOM_BADGE_LIST_KEY);
    if (raw === null) {
      localStorage.setItem(
        CUSTOM_BADGE_LIST_KEY,
        JSON.stringify(DEFAULT_BADGE_PRESETS)
      );
      return [...DEFAULT_BADGE_PRESETS];
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x).trim()).filter(Boolean);
    }
  } catch {}
  return [...DEFAULT_BADGE_PRESETS];
}

// Menyimpan daftar pilihan badge terbaru ke localStorage
function writeAllBadgePresets(list: string[]) {
  try {
    localStorage.setItem(CUSTOM_BADGE_LIST_KEY, JSON.stringify(list));
  } catch {}
}

// Menambahkan teks badge baru ke daftar pilihan badge jika belum ada
function saveCustomBadgePreset(label: string) {
  const clean = label.trim();
  if (!clean) return;
  const existing = readAllBadgePresets();
  const exists = existing.some(
    (item) => item.toLowerCase() === clean.toLowerCase()
  );
  if (!exists) {
    writeAllBadgePresets([...existing, clean]);
  }
}

// Mengambil warna tampilan badge (mendukung kode hex bebas maupun preset lama)
function getBadgeStyleFromPalette(badgeText: string, badgeColor?: string | null) {
  const raw = String(badgeColor ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
    return {
      background: raw,
      color: getContrastTextForHex(raw),
    };
  }

  const key = raw.toLowerCase();
  const legacyStyles: Record<string, { background: string; color: string }> = {
    amber: { background: "#D97706", color: "#FFFFFF" },
    red: { background: "#DC2626", color: "#FFFFFF" },
    brown: { background: "#2A1A11", color: "#EFE3C8" },
    green: { background: "#15803D", color: "#FFFFFF" },
    blue: { background: "#1D4ED8", color: "#FFFFFF" },
    purple: { background: "#7E22CE", color: "#FFFFFF" },
    pink: { background: "#DB2777", color: "#FFFFFF" },
  };
  if (legacyStyles[key]) {
    return legacyStyles[key];
  }

  const lower = badgeText.trim().toLowerCase();
  if (lower === "sold out" || lower === "habis" || lower.includes("pedas")) {
    return { background: "#DC2626", color: "#FFFFFF" };
  }
  if (
    lower.includes("rekomendasi") ||
    lower.includes("best") ||
    lower.includes("terlaris")
  ) {
    return { background: "#D97706", color: "#FFFFFF" };
  }
  return { background: "#2A1A11", color: "#EFE3C8" };
}

function isSoldOutBadgeText(badgeText: string): boolean {
  const n = badgeText.trim().toLowerCase();
  return n === "sold out" || n === "habis";
}

// Merapikan format daftar rempah
function formatSpicesText(raw: unknown): string {
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

// Mengompresi dan mengubah file gambar unggahan menjadi data URL agar ringan disimpan
function compressUploadedImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.onload = () => {
      const result = String(reader.result || "");
      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxWidth = 800;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetW = Math.round(img.width * scale);
        const targetH = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminMenuPage() {
  // State daftar menu, kategori, loading, dan filter pencarian
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categoryList, setCategoryList] = useState<string[]>([
    "makanan",
    "cemilan",
    "pendamping",
    "minuman",
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // State modal kelola kategori (tambah, edit nama, dan hapus kategori)
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [newCatInput, setNewCatInput] = useState<string>("");
  const [editingCatOldName, setEditingCatOldName] = useState<string | null>(
    null
  );
  const [editingCatNewName, setEditingCatNewName] = useState<string>("");

  // State modal form tambah/edit menu beserta badge, warna kustom, dan unggah foto
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("makanan");
  const [price, setPrice] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [spicyLevel, setSpicyLevel] = useState<string>("Tidak Pedas");
  const [calories, setCalories] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [spices, setSpices] = useState<string>("");
  const [packagingInfo, setPackagingInfo] = useState<string>("");
  const [badge, setBadge] = useState<string>("");
  const [badgeColor, setBadgeColor] = useState<string>("#D97706");
  const [newBadgeOptionInput, setNewBadgeOptionInput] = useState<string>("");
  const [badgePresets, setBadgePresets] = useState<string[]>(() =>
    readAllBadgePresets()
  );

  // State daftar warna kustom beserta fitur beri nama & edit nama warna
  const [colorOptions, setColorOptions] = useState<BadgeColorOption[]>(() =>
    readBadgeColorOptions()
  );
  const [newColorNameInput, setNewColorNameInput] = useState<string>("");
  const [editingColorHex, setEditingColorHex] = useState<string | null>(null);
  const [editingColorLabel, setEditingColorLabel] = useState<string>("");

  // Menggabungkan data menu dari API dengan data badge custom di localStorage
  function enrichMenusWithBadgeMap(rawList: MenuItem[]): MenuItem[] {
    const badgeMap = readMenuBadgeMap();
    return rawList.map((item) => {
      const savedEntry = badgeMap[String(item.id)];
      const apiBadge = String(item.badge ?? "").trim();
      const fallbackBadge =
        savedEntry?.badge ||
        (item.available === false
          ? "Sold Out"
          : item.popular || item.isRecommended || item.isFavorite
          ? "Rekomendasi"
          : "");
      const resolvedBadge = apiBadge || fallbackBadge;
      const resolvedColor =
        item.badgeColor ||
        savedEntry?.badgeColor ||
        (isSoldOutBadgeText(resolvedBadge) ? "#DC2626" : "#D97706");

      return {
        ...item,
        badge: resolvedBadge || null,
        badgeColor: resolvedBadge ? resolvedColor : null,
      };
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const [menuRes, catRes] = await Promise.all([
          fetch("/api/menu", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        if (menuRes.ok && isMounted) {
          const menuData: unknown = await menuRes.json();
          if (Array.isArray(menuData)) {
            const enriched = enrichMenusWithBadgeMap(menuData as MenuItem[]);
            setMenus(enriched);
            writeAdminMenusCache(enriched);
          }
        }

        if (catRes.ok && isMounted) {
          const catData: unknown = await catRes.json();
          if (Array.isArray(catData) && catData.length > 0) {
            setCategoryList(catData.map((c) => String(c).toLowerCase()));
          }
        }
      } catch (err) {
        console.error("Gagal memuat data menu & kategori:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  function notifyCustomerSync() {
    window.dispatchEvent(new Event("soto-menu-updated"));
    try {
      localStorage.setItem("soto_menu_sync_ts", crypto.randomUUID());
    } catch {}
  }

  // Memproses file foto yang diunggah admin dari komputer/HP menjadi gambar menu
  async function handleImageFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (JPG, PNG, atau WEBP).");
      return;
    }

    setUploadingImage(true);
    try {
      const compressedDataUrl = await compressUploadedImageToDataUrl(file);
      setImage(compressedDataUrl);
    } catch {
      alert("Gagal memproses file foto yang diunggah.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  // Menambahkan pilihan badge baru ke daftar pilihan badge
  function handleAddCustomBadgeOption() {
    const clean = newBadgeOptionInput.trim();
    if (!clean) return;
    saveCustomBadgePreset(clean);
    setBadgePresets(readAllBadgePresets());
    setBadge(clean);
    setNewBadgeOptionInput("");
  }

  // Menghapus pilihan badge tertentu (termasuk 4 badge awal) dari daftar pilihan
  function handleDeleteBadgePreset(targetLabel: string) {
    const nextList = badgePresets.filter(
      (item) => item.toLowerCase() !== targetLabel.toLowerCase()
    );
    writeAllBadgePresets(nextList);
    setBadgePresets(nextList);

    if (badge.trim().toLowerCase() === targetLabel.trim().toLowerCase()) {
      setBadge("");
    }
  }

  // Mengembalikan 4 badge bawaan apabila dibutuhkan
  function handleRestoreDefaultBadges() {
    writeAllBadgePresets([...DEFAULT_BADGE_PRESETS]);
    setBadgePresets([...DEFAULT_BADGE_PRESETS]);
  }

  // Menyimpan atau memperbarui nama warna yang dipilih dari color wheel
  function handleSaveCurrentWheelColor() {
    const hex = resolveHexColorValue(badgeColor);
    const customLabel = newColorNameInput.trim() || hex;
    const existingIndex = colorOptions.findIndex((c) => c.hex === hex);

    let next: BadgeColorOption[];
    if (existingIndex >= 0) {
      next = colorOptions.map((c, i) =>
        i === existingIndex ? { hex, label: customLabel } : c
      );
    } else {
      next = [...colorOptions, { hex, label: customLabel }];
    }

    writeBadgeColorOptions(next);
    setColorOptions(next);
    setNewColorNameInput("");
  }

  // Menyimpan perubahan nama pada chip warna yang diedit langsung
  function handleCommitRenameColor(targetHex: string) {
    const cleanLabel = editingColorLabel.trim() || targetHex;
    const next = colorOptions.map((c) =>
      c.hex === targetHex ? { ...c, label: cleanLabel } : c
    );
    writeBadgeColorOptions(next);
    setColorOptions(next);
    setEditingColorHex(null);
    setEditingColorLabel("");
  }

  // Menghapus chip warna dari daftar pilihan warna
  function handleDeleteColorOption(targetHex: string) {
    const next = colorOptions.filter((c) => c.hex !== targetHex);
    writeBadgeColorOptions(next);
    setColorOptions(next);
    if (editingColorHex === targetHex) {
      setEditingColorHex(null);
      setEditingColorLabel("");
    }
  }

  // Mengembalikan 7 warna awal beserta nama bawaannya jika diperlukan
  function handleRestoreDefaultColors() {
    writeBadgeColorOptions([...DEFAULT_BADGE_COLOR_OPTIONS]);
    setColorOptions([...DEFAULT_BADGE_COLOR_OPTIONS]);
  }

  // Mengirim request POST untuk menambah kategori baru ke database
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
        notifyCustomerSync();
      }
    } catch (err) {
      console.error("Gagal menambah kategori:", err);
    }

    setNewCatInput("");
    setSelectedCategory(clean);
  }

  // Mengirim request PATCH untuk mengubah nama kategori yang sudah ada
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
        setMenus((prev) => {
          const next = prev.map((m) =>
            (m.category || "").toLowerCase() === oldName
              ? { ...m, category: cleanNew }
              : m
          );
          writeAdminMenusCache(next);
          return next;
        });
        if (selectedCategory === oldName) {
          setSelectedCategory(cleanNew);
        }
        notifyCustomerSync();
      }
    } catch (err) {
      console.error("Gagal mengubah kategori:", err);
    }

    setEditingCatOldName(null);
    setEditingCatNewName("");
  }

  // Mengirim request DELETE untuk menghapus kategori dan memindahkan menunya ke kategori makanan
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
        setMenus((prev) => {
          const next = prev.map((m) =>
            (m.category || "").toLowerCase() === catName
              ? { ...m, category: "makanan" }
              : m
          );
          writeAdminMenusCache(next);
          return next;
        });
        if (selectedCategory === catName) {
          setSelectedCategory("ALL");
        }
        notifyCustomerSync();
      }
    } catch (err) {
      console.error("Gagal menghapus kategori:", err);
    }
  }

  // Membuka modal tambah menu baru dengan seluruh input kosong
  function openAddModal() {
    setEditingMenu(null);
    setName("");
    setCategory(
      selectedCategory !== "ALL"
        ? selectedCategory.toLowerCase()
        : categoryList[0] || "makanan"
    );
    setPrice("");
    setRating("");
    setSpicyLevel("Tidak Pedas");
    setCalories("");
    setImage("");
    setDescription("");
    setSpices("");
    setPackagingInfo("");
    setBadge("");
    setBadgeColor("#D97706");
    setNewBadgeOptionInput("");
    setNewColorNameInput("");
    setEditingColorHex(null);
    setIsModalOpen(true);
  }

  // Mengisi form dengan data item menu yang dipilih untuk diedit
  function openEditModal(item: MenuItem) {
    setEditingMenu(item);
    setName(item.name || "");
    setCategory((item.category || "makanan").toLowerCase());
    setPrice(String(item.price ?? ""));
    setRating(String(item.rating ?? ""));
    setSpicyLevel(item.spicyLevel || item.spiceLevel || "Tidak Pedas");
    setCalories(
      String(item.calories ?? "")
        .replace(/kkal/gi, "")
        .trim()
    );
    setImage(item.image || "");
    setDescription(item.description || "");

    const rawSpices = item.spices ?? item.ingredients ?? "";
    setSpices(formatSpicesText(rawSpices));

    const rawPack = item.packagingInfo ?? item.packaging ?? "";
    setPackagingInfo(String(rawPack));

    const currentBadge = String(item.badge ?? "").trim();
    setBadge(currentBadge);
    setBadgeColor(
      resolveHexColorValue(
        item.badgeColor || (isSoldOutBadgeText(currentBadge) ? "#DC2626" : "#D97706")
      )
    );
    setNewBadgeOptionInput("");
    setNewColorNameInput("");
    setEditingColorHex(null);
    setIsModalOpen(true);
  }

  // Menyimpan data menu baru (POST) atau perubahan menu (PATCH) dan menyinkronkan ke cache Customer
  async function handleSaveMenu(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);

    const cleanSpices = spices
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    const calNumber = Number(String(calories).replace(/[^0-9]/g, "")) || 350;
    const formattedCalories = `${calNumber} kkal`;

    const cleanBadge = badge.trim();
    if (cleanBadge) {
      saveCustomBadgePreset(cleanBadge);
      setBadgePresets(readAllBadgePresets());
    }

    const normalizedHexColor = resolveHexColorValue(badgeColor);
    const isSoldOut = isSoldOutBadgeText(cleanBadge);
    const isRecBadge =
      cleanBadge.toLowerCase().includes("rekomendasi") ||
      cleanBadge.toLowerCase().includes("best") ||
      cleanBadge.toLowerCase().includes("terlaris");

    const payload = {
      name: name.trim(),
      category: category.toLowerCase(),
      price: Number(price) || 0,
      rating: Number(rating) || 5,
      spicyLevel: spicyLevel.trim() || "Tidak Pedas",
      spiceLevel: spicyLevel.trim() || "Tidak Pedas",
      calories: formattedCalories,
      image: image.trim() || "/images/sotobanjarotentik.jpeg",
      description: description.trim(),
      spices: cleanSpices,
      ingredients: cleanSpices,
      packagingInfo: packagingInfo.trim() || "Kemasan thermal pouch tahan panas",
      packaging: packagingInfo.trim() || "Kemasan thermal pouch tahan panas",
      badge: cleanBadge || null,
      badgeColor: cleanBadge ? normalizedHexColor : null,
      popular: isRecBadge,
      isRecommended: isRecBadge,
      isFavorite: isRecBadge,
      available: !isSoldOut,
    };

    try {
      if (editingMenu) {
        saveMenuBadgeMapEntry(
          editingMenu.id,
          cleanBadge ? { badge: cleanBadge, badgeColor: normalizedHexColor } : null
        );

        const res = await fetch(`/api/menu/${editingMenu.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let serverRecord: Partial<MenuItem> = {};
        if (res.ok) {
          serverRecord = (await res.json()) as Partial<MenuItem>;
        }

        setMenus((prev) => {
          const next = prev.map((m) =>
            m.id === editingMenu.id
              ? {
                  ...m,
                  ...payload,
                  ...serverRecord,
                  badge: cleanBadge || null,
                  badgeColor: cleanBadge ? normalizedHexColor : null,
                  available: !isSoldOut,
                }
              : m
          );
          writeAdminMenusCache(next);
          return next;
        });
      } else {
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        let created: MenuItem = {
          ...payload,
          id: Date.now(),
        };

        if (res.ok) {
          const serverCreated = (await res.json()) as MenuItem;
          created = {
            ...serverCreated,
            ...payload,
            id: serverCreated.id ?? created.id,
            badge: cleanBadge || null,
            badgeColor: cleanBadge ? normalizedHexColor : null,
            available: !isSoldOut,
          };
        }

        saveMenuBadgeMapEntry(
          created.id,
          cleanBadge ? { badge: cleanBadge, badgeColor: normalizedHexColor } : null
        );
        setMenus((prev) => {
          const next = [created, ...prev];
          writeAdminMenusCache(next);
          return next;
        });
      }

      notifyCustomerSync();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Gagal menyimpan menu:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Menghapus item menu dari state, cache Customer, localStorage, dan server API
  async function handleDeleteMenu(id: number | string, menuName: string) {
    if (!confirm(`Hapus menu "${menuName}" dari daftar sajian?`)) return;

    saveMenuBadgeMapEntry(id, null);
    setMenus((prev) => {
      const next = prev.filter((m) => m.id !== id);
      writeAdminMenusCache(next);
      return next;
    });

    try {
      await fetch(`/api/menu/${id}`, { method: "DELETE" });
      notifyCustomerSync();
    } catch (err) {
      console.error("Gagal menghapus menu:", err);
    }
  }

  // Menyusun daftar tab kategori
  const allTabs = useMemo(() => ["ALL", ...categoryList], [categoryList]);

  // Menyaring daftar menu berdasarkan kategori
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

  // Menghitung jumlah menu yang memiliki badge
  const badgedMenuCount = useMemo(
    () => menus.filter((m) => Boolean(String(m.badge ?? "").trim())).length,
    [menus]
  );

  const activeHexColor = resolveHexColorValue(badgeColor);
  const previewColors = getBadgeStyleFromPalette(badge || "Badge", activeHexColor);
  const matchedExistingColor = colorOptions.find(
    (c) => c.hex === activeHexColor
  );
  const isColorAlreadySavedWithSameName =
    Boolean(matchedExistingColor) &&
    (!newColorNameInput.trim() ||
      matchedExistingColor?.label.toLowerCase() ===
        newColorNameInput.trim().toLowerCase());

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
      {/* Header halaman kelola menu */}
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
            Atur katalog kuliner Banjar, badge &amp; warna label, kategori menu, racikan rempah, dan kemasan.
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
            Kelola Kategori ({categoryList.length})
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
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span> Tambah Menu Baru
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
        {/* Statistik menu */}
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
            }}
          >
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
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#8A6B47" }}>
              Menu Ber-Badge Aktif
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#B45309",
                marginTop: "4px",
              }}
            >
              {badgedMenuCount}{" "}
              <span style={{ fontSize: "13px", fontWeight: 700 }}>Menu</span>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              padding: "18px 20px",
              border: "1.5px solid #E5DEC9",
            }}
          >
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
        </div>

        {/* Filter kategori dan pencarian nama menu */}
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
              placeholder="Cari nama menu atau deskripsi..."
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

        {/* Daftar kartu menu */}
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
              const activeBadge = String(item.badge ?? "").trim();
              const badgeColors = getBadgeStyleFromPalette(
                activeBadge,
                item.badgeColor
              );
              const isSoldOut =
                item.available === false || isSoldOutBadgeText(activeBadge);

              const calText = String(item.calories ?? "350 kkal").includes("kkal")
                ? String(item.calories)
                : `${item.calories ?? 350} kkal`;
              const ratingVal = item.rating ?? "5";
              const spicesText = formatSpicesText(
                item.spices ?? item.ingredients
              );
              const packText =
                item.packagingInfo ??
                item.packaging ??
                "Kemasan thermal pouch tahan panas";
              const spicyText =
                item.spicyLevel ?? item.spiceLevel ?? "Tidak Pedas";

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "20px",
                    border: activeBadge
                      ? `2px solid ${badgeColors.background}`
                      : "1.5px solid #E5DEC9",
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
                        src={item.image || "/images/sotobanjarotentik.jpeg"}
                        alt={item.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/images/sotobanjarotentik.jpeg";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: isSoldOut ? "grayscale(75%)" : "none",
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

                      {activeBadge && (
                        <span
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            backgroundColor: badgeColors.background,
                            color: badgeColors.color,
                            padding: "4px 11px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: 900,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          }}
                        >
                          {activeBadge}
                        </span>
                      )}
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
                          Rating {ratingVal}
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
                            Racikan Rempah:{" "}
                          </strong>
                          <span>{spicesText || "Rempah pilihan khas Banjar"}</span>
                        </div>
                        <div
                          style={{
                            borderTop: "1px dashed #E5DEC9",
                            paddingTop: "4px",
                          }}
                        >
                          <strong style={{ color: "#734F31" }}>Kemasan: </strong>
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
                          {spicyText}
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
                          {calText}
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
                      Edit Menu
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

      {/* Modal kelola kategori menu */}
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
                  Kelola Kategori Menu
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6D4C30" }}>
                  Kategori baru otomatis muncul di Admin &amp; Customer.
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
                X
              </button>
            </div>

            <form
              onSubmit={(e) => void handleAddCategory(e)}
              style={{ display: "flex", gap: "8px" }}
            >
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="Ketik kategori baru..."
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
                            Edit
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

      {/* Form tambah atau edit menu */}
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
            onSubmit={(e) => void handleSaveMenu(e)}
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
                  : "Tambah Menu Baru"}
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
                X
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
                  placeholder="Contoh: Soto Banjar Spesial"
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
                  placeholder="Contoh: 35000"
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
                  Rating Menu
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Contoh: 4.8"
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
                  placeholder="Contoh: 350"
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
                  Tingkat Kepedasan (spicyLevel)
                </label>
                <select
                  value={spicyLevel}
                  onChange={(e) => setSpicyLevel(e.target.value)}
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
                  <option value="Manis Gurih">Manis Gurih</option>
                  <option value="Gurih">Gurih</option>
                </select>
              </div>
            </div>

            {/* Kontrol badge menu: tambah, hapus badge, serta roda warna dengan nama kustom yang bisa diedit */}
            <div
              style={{
                backgroundColor: "#FAF6EE",
                border: "1.5px solid #D6C7B2",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#2A1A11",
                    }}
                  >
                    Badge Menu (badge)
                  </label>
                  {badge && (
                    <span
                      style={{
                        backgroundColor: previewColors.background,
                        color: previewColors.color,
                        padding: "2px 9px",
                        borderRadius: "12px",
                        fontSize: "10.5px",
                        fontWeight: 900,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {badgePresets.length < DEFAULT_BADGE_PRESETS.length && (
                    <button
                      type="button"
                      onClick={handleRestoreDefaultBadges}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6D4C30",
                        fontSize: "11px",
                        fontWeight: 800,
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Reset 4 Badge Awal
                    </button>
                  )}

                  {badge && (
                    <button
                      type="button"
                      onClick={() => setBadge("")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#DC2626",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Lepas Badge Menu
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Nama badge yang dipakai menu (misal: Sold Out, Rekomendasi, Pedas, atau ketik sendiri)..."
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "9px",
                  border: "1px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  fontSize: "12.5px",
                }}
              />

              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  value={newBadgeOptionInput}
                  onChange={(e) => setNewBadgeOptionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomBadgeOption();
                    }
                  }}
                  placeholder="Buat badge baru (misal: Hemat, Porsi Jumbo)..."
                  style={{
                    flex: 1,
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px dashed #8A6B47",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomBadgeOption}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#5C3A21",
                    color: "#FFFFFF",
                    fontSize: "11.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Tambah Badge
                </button>
              </div>

              {/* Daftar pilihan badge dengan tombol hapus (×) pada setiap badge */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {badgePresets.map((preset) => {
                  const active = badge.toLowerCase() === preset.toLowerCase();
                  return (
                    <div
                      key={preset}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "8px",
                        border: active
                          ? "1.5px solid #2A1A11"
                          : "1px solid #D6C7B2",
                        backgroundColor: active ? "#2A1A11" : "#FFFFFF",
                        color: active ? "#EFE3C8" : "#2A1A11",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setBadge(preset);
                          if (
                            preset.toLowerCase() === "sold out" ||
                            preset.toLowerCase().includes("pedas")
                          ) {
                            setBadgeColor("#DC2626");
                          } else if (
                            preset.toLowerCase().includes("rekomendasi") ||
                            preset.toLowerCase().includes("best")
                          ) {
                            setBadgeColor("#D97706");
                          }
                        }}
                        style={{
                          padding: "5px 8px 5px 10px",
                          border: "none",
                          background: "transparent",
                          color: "inherit",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {preset}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBadgePreset(preset)}
                        title={`Hapus badge "${preset}"`}
                        aria-label={`Hapus badge ${preset}`}
                        style={{
                          padding: "5px 8px 5px 4px",
                          border: "none",
                          background: "transparent",
                          color: active ? "#FCA5A5" : "#DC2626",
                          fontSize: "12px",
                          fontWeight: 900,
                          cursor: "pointer",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pemilih warna bebas (Color Wheel) + input nama warna + daftar chip warna yang bisa diedit namanya & dihapus */}
              <div
                style={{
                  borderTop: "1px dashed #D6C7B2",
                  paddingTop: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 800,
                      color: "#432818",
                    }}
                  >
                    Warna Badge (Pilih &amp; Beri Nama Sendiri):
                  </span>

                  {colorOptions.length < DEFAULT_BADGE_COLOR_OPTIONS.length && (
                    <button
                      type="button"
                      onClick={handleRestoreDefaultColors}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#6D4C30",
                        fontSize: "11px",
                        fontWeight: 800,
                        textDecoration: "underline",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Reset 7 Warna Awal
                    </button>
                  )}
                </div>

                {/* Roda Warna Pelangi + Kode Hex + Input Nama Warna + Tombol Simpan Warna */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #D6C7B2",
                    borderRadius: "12px",
                    padding: "6px 8px",
                  }}
                >
                  <label
                    title="Klik untuk membuka roda warna bebas"
                    style={{
                      position: "relative",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background:
                        "conic-gradient(from 90deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)",
                      border: "2px solid #FFFFFF",
                      boxShadow: "0 0 0 1.5px #8A6B47",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="color"
                      value={activeHexColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      aria-label="Pilih warna badge bebas"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </label>

                  <span
                    style={{
                      width: "15px",
                      height: "15px",
                      borderRadius: "4px",
                      backgroundColor: activeHexColor,
                      border: "1px solid rgba(0,0,0,0.2)",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />

                  <input
                    type="text"
                    value={activeHexColor}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (/^#?[0-9a-fA-F]{0,6}$/.test(val)) {
                        setBadgeColor(val.startsWith("#") ? val : `#${val}`);
                      }
                    }}
                    maxLength={7}
                    aria-label="Kode warna hex"
                    style={{
                      width: "64px",
                      border: "1px solid #E5DEC9",
                      borderRadius: "6px",
                      padding: "4px 6px",
                      backgroundColor: "#FAF6EE",
                      fontSize: "11.5px",
                      fontWeight: 800,
                      color: "#2A1A11",
                      outline: "none",
                      fontFamily: "monospace",
                    }}
                  />

                  <input
                    type="text"
                    value={newColorNameInput}
                    onChange={(e) => setNewColorNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveCurrentWheelColor();
                      }
                    }}
                    placeholder={
                      matchedExistingColor
                        ? `Nama saat ini: ${matchedExistingColor.label} (ketik untuk ganti)`
                        : "Nama warna (misal: Tosca, Kuning Kunyit)..."
                    }
                    style={{
                      flex: "1 1 170px",
                      padding: "5px 9px",
                      borderRadius: "7px",
                      border: "1px dashed #8A6B47",
                      backgroundColor: "#FAF6EE",
                      fontSize: "11.5px",
                      color: "#2A1A11",
                    }}
                  />

                  <button
                    type="button"
                    disabled={isColorAlreadySavedWithSameName}
                    onClick={handleSaveCurrentWheelColor}
                    style={{
                      padding: "6px 11px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: isColorAlreadySavedWithSameName
                        ? "#E5DEC9"
                        : "#5C3A21",
                      color: isColorAlreadySavedWithSameName
                        ? "#8A6B47"
                        : "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: isColorAlreadySavedWithSameName
                        ? "default"
                        : "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {matchedExistingColor
                      ? newColorNameInput.trim() &&
                        matchedExistingColor.label.toLowerCase() !==
                          newColorNameInput.trim().toLowerCase()
                        ? "Update Nama Warna"
                        : "Tersimpan"
                      : "+ Simpan Warna"}
                  </button>
                </div>

                {/* Daftar chip warna tersimpan: klik untuk pakai, klik ✎ untuk ganti nama, klik × untuk hapus */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {colorOptions.map((opt) => {
                    const selected = activeHexColor === opt.hex;
                    const isRenaming = editingColorHex === opt.hex;

                    return (
                      <div
                        key={opt.hex}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderRadius: "8px",
                          border: selected
                            ? "2px solid #2A1A11"
                            : "1px solid #D6C7B2",
                          backgroundColor: selected ? "#FFFBEB" : "#FFFFFF",
                          overflow: "hidden",
                        }}
                      >
                        {isRenaming ? (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "3px 6px",
                            }}
                          >
                            <span
                              style={{
                                width: "11px",
                                height: "11px",
                                borderRadius: "50%",
                                backgroundColor: opt.hex,
                                border: "1px solid rgba(0,0,0,0.18)",
                                display: "inline-block",
                              }}
                            />
                            <input
                              type="text"
                              value={editingColorLabel}
                              onChange={(e) =>
                                setEditingColorLabel(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleCommitRenameColor(opt.hex);
                                } else if (e.key === "Escape") {
                                  setEditingColorHex(null);
                                }
                              }}
                              autoFocus
                              style={{
                                width: "90px",
                                padding: "2px 5px",
                                borderRadius: "4px",
                                border: "1px solid #5C3A21",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleCommitRenameColor(opt.hex)}
                              title="Simpan nama warna"
                              style={{
                                border: "none",
                                background: "#166534",
                                color: "#FFFFFF",
                                borderRadius: "4px",
                                padding: "2px 6px",
                                fontSize: "10px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setBadgeColor(opt.hex)}
                              title={`${opt.label} (${opt.hex})`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "4px 6px 4px 8px",
                                border: "none",
                                background: "transparent",
                                color: "#2A1A11",
                                fontSize: "11px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              <span
                                style={{
                                  width: "11px",
                                  height: "11px",
                                  borderRadius: "50%",
                                  backgroundColor: opt.hex,
                                  border: "1px solid rgba(0,0,0,0.18)",
                                  display: "inline-block",
                                }}
                              />
                              <span>{opt.label}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingColorHex(opt.hex);
                                setEditingColorLabel(opt.label);
                              }}
                              title={`Ganti nama warna "${opt.label}"`}
                              aria-label={`Ganti nama warna ${opt.label}`}
                              style={{
                                padding: "4px 4px",
                                border: "none",
                                background: "transparent",
                                color: "#6D4C30",
                                fontSize: "11px",
                                fontWeight: 800,
                                cursor: "pointer",
                                lineHeight: 1,
                              }}
                            >
                              ✎
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteColorOption(opt.hex)}
                              title={`Hapus warna "${opt.label}"`}
                              aria-label={`Hapus warna ${opt.label}`}
                              style={{
                                padding: "4px 7px 4px 3px",
                                border: "none",
                                background: "transparent",
                                color: "#DC2626",
                                fontSize: "12px",
                                fontWeight: 900,
                                cursor: "pointer",
                                lineHeight: 1,
                              }}
                            >
                              ×
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
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
                  Racikan Rempah (spices)
                </label>
                <input
                  type="text"
                  value={spices}
                  onChange={(e) => setSpices(e.target.value)}
                  placeholder="Contoh: Kayu manis, kapulaga, cengkih, pala"
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
                  Standar Kemasan (packagingInfo)
                </label>
                <input
                  type="text"
                  value={packagingInfo}
                  onChange={(e) => setPackagingInfo(e.target.value)}
                  placeholder="Contoh: Kemasan thermal pouch tahan panas"
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

            {/* Kontrol foto menu: bisa upload file dari komputer/HP atau tempel link / path gambar */}
            <div
              style={{
                backgroundColor: "#FAF6EE",
                border: "1.5px solid #D6C7B2",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#2A1A11",
                  }}
                >
                  Foto Sajian (Upload File atau Link / Path Gambar)
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "9px",
                      backgroundColor: "#5C3A21",
                      color: "#FFFFFF",
                      fontSize: "11.5px",
                      fontWeight: 800,
                      cursor: uploadingImage ? "wait" : "pointer",
                    }}
                  >
                    <span>
                      {uploadingImage ? "Memproses Foto..." : "Upload Foto"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={(e) => void handleImageFileUpload(e)}
                      style={{ display: "none" }}
                    />
                  </label>

                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "9px",
                        border: "1px solid #FCA5A5",
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Hapus Foto
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={image.startsWith("data:image/") ? "" : image}
                onChange={(e) => setImage(e.target.value)}
                placeholder={
                  image.startsWith("data:image/")
                    ? "Foto berhasil diunggah dari perangkat (klik Hapus Foto untuk ganti ke link)"
                    : "Atau tempel link gambar (https://...) / path lokal (/images/menu.jpg)"
                }
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  fontSize: "12.5px",
                }}
              />

              {image && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "#FFFFFF",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: "1px solid #E5DEC9",
                  }}
                >
                  <img
                    src={image}
                    alt="Pratinjau foto menu"
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      border: "1px solid #D6C7B2",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ fontSize: "11.5px", color: "#6D4C30" }}>
                    <strong style={{ color: "#2A1A11", display: "block" }}>
                      Pratinjau Foto Menu
                    </strong>
                    <span>
                      {image.startsWith("data:image/")
                        ? "Sumber: File unggahan perangkat"
                        : image}
                    </span>
                  </div>
                </div>
              )}
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
                placeholder="Tulis deskripsi singkat mengenai cita rasa atau isi porsi menu..."
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
                disabled={submitting || uploadingImage}
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