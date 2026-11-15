"use client";

import React, { useEffect, useState } from "react";

interface FaqItem {
  id: number;
  q: string;
  a: string;
}

interface OrderItemRecord {
  name?: string;
  title?: string;
  qty?: number;
  quantity?: number;
  price?: number;
}

interface OrderRecord {
  status?: string;
  items?: OrderItemRecord[];
}

interface MenuItemRecord {
  id?: number | string;
  name?: string;
  price?: number;
  image?: string;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<
    "banner" | "about" | "faq" | "menu" | "location"
  >("banner");
  const [saveBannerNotice, setSaveBannerNotice] = useState("");

  // Banner Header
  const [statusBadge, setStatusBadge] = useState("Dapur Delivery Buka");
  const [badgeTagline, setBadgeTagline] = useState(
    "Khusus Pesan Online • Area Jabodetabek"
  );
  const [heroTitle, setHeroTitle] = useState(
    "Keharuman Rempah Autentik Khas Banjar Langsung ke Rumahmu"
  );
  const [highlightWord, setHighlightWord] = useState("Khas Banjar");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Pesan Soto Banjar hangat kaldu ayam kampung murni berpadu kayu manis, kapulaga, cengkeh, dan bunga lawang khas Kalimantan Selatan. Dikemas higienis, anti tumpah, dan cepat sampai tujuan."
  );

  // State Tombol & Statistik Banner Header
  const [btnPrimaryText, setBtnPrimaryText] = useState(
    "🍲 Pesan Sajian Sekarang →"
  );
  const [btnSecondaryText, setBtnSecondaryText] = useState("Kisah Resep Kami");
  const [stat1Value, setStat1Value] = useState("100%");
  const [stat1Label, setStat1Label] = useState("Rempah Asli Banjar");
  const [stat2Value, setStat2Value] = useState("4.9 ★");
  const [stat2Label, setStat2Label] = useState("Rating Pelanggan");
  const [stat3Value, setStat3Value] = useState("20++");
  const [stat3Label, setStat3Label] = useState("Menu Pilihan");

  // State Otomatis Menu Paling Laris (Sesuai Customer)
  const [heroImage, setHeroImage] = useState(
    "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
  );
  const [featuredLabel, setFeaturedLabel] = useState(
    "MENU PALING LARIS • 1 PORSI TERJUAL"
  );
  const [featuredTitle, setFeaturedTitle] = useState("Soto Banjar Otentik");
  const [featuredPrice, setFeaturedPrice] = useState("Rp 32.000");

  // Filosofi Rasa / Tentang Kami
  const [aboutBadge, setAboutBadge] = useState("FILOSOFI RASA");
  const [aboutTitle, setAboutTitle] = useState(
    "Warisan Cita Rasa Hangat dari Bumi Kalimantan"
  );
  const [aboutHighlight, setAboutHighlight] = useState("Bumi Kalimantan");
  const [aboutParagraph1, setAboutParagraph1] = useState(
    "Soto Banjar Selera Nusantara berakar dari kecintaan kami melestarikan kuliner legendaris khas Banjarmasin. Kunci kelezatan sup kami terletak pada simfoni rempah aromatik pilihan: kayu manis, cengkeh, kapulaga, pala, dan bunga lawang yang ditumis harum dengan mentega berkualitas sebelum dipadukan ke dalam rebusan kaldu murni."
  );
  const [aboutParagraph2, setAboutParagraph2] = useState(
    "Kami hanya menggunakan 100% ayam kampung segar yang menghasilkan kaldu gurih alami tanpa bahan pengawet. Disajikan lengkap bersama ketupat lembut, perkedel kentang legit, suwiran ayam tebal, telur bebek rebus, serta kucuran perasan jeruk kuit khas yang harum menyegarkan."
  );
  const [feature1Title, setFeature1Title] = useState("Ayam Kampung Asli");
  const [feature1Desc, setFeature1Desc] = useState(
    "Daging manis alami berpadu kaldu gurih kaya nutrisi rempah."
  );
  const [feature2Title, setFeature2Title] = useState("Jeruk Kuit Segar");
  const [feature2Desc, setFeature2Desc] = useState(
    "Aroma sitrus khas Banjar yang autentik dan menyegarkan."
  );
  const [aboutImage, setAboutImage] = useState(
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80"
  );
  const [aboutImageTitle, setAboutImageTitle] = useState("100% Rempah Asli");
  const [aboutImageCaption, setAboutImageCaption] = useState(
    "Resep Turun-Temurun Kalimantan"
  );

  // FAQ
  const [faqBadge, setFaqBadge] = useState("TANYA JAWAB");
  const [faqMainTitle, setFaqMainTitle] = useState("Pertanyaan Umum (FAQ)");
  const [faqDesc, setFaqDesc] = useState(
    "Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?"
  );
  const [faqs, setFaqs] = useState<FaqItem[]>([
    {
      id: 1,
      q: "Apakah kuah soto dikirim terpisah agar tidak tumpah?",
      a: "Ya, kuah kaldu rempah dikemas khusus menggunakan mangkuk/standing pouch tahan panas berlapis rapat yang disegel rapi terpisah dari ketupat, suwiran ayam, dan perkedel untuk menjaga kesegaran dan menghindari tumpah di jalan.",
    },
    {
      id: 2,
      q: "Berapa lama waktu pengantaran di wilayah Jabodetabek?",
      a: "Rata-rata pengantaran berkisar antara 30 hingga 45 menit tergantung jarak wilayah pengantaran. Kurir kami akan segera meluncur setelah dapur selesai menyiapkan pesanan Anda.",
    },
    {
      id: 3,
      q: "Apakah seluruh menu dijamin 100% Halal?",
      a: "Semua menu dijamin 100% Halal. Kami menggunakan ayam kampung segar pilihan, rempah alami Nusantara, dan telur bebek berkualitas tanpa bahan pengawet atau non-halal.",
    },
    {
      id: 4,
      q: "Metode pembayaran apa saja yang didukung?",
      a: "Kami melayani pembayaran melalui Virtual Account Bank (BCA, Mandiri) dan Saldo E-Wallet (GoPay, OVO, ShopeePay, DANA) yang diproses secara instan dan otomatis.",
    },
  ]);

  // Header Katalog Menu
  const [menuBadge, setMenuBadge] = useState("Resep Warisan Asli Banjar");
  const [menuTitle, setMenuTitle] = useState("Menu Pilihan Kami");
  const [menuSubtitle, setMenuSubtitle] = useState(
    "Sajian khas Kalimantan Selatan dengan rebusan rempah kayu manis, kapulaga murni, dan jeruk kuit."
  );

  // Lokasi & Footer
  const [locationBadge, setLocationBadge] = useState("LOKASI & KONTAK");
  const [locationTitle, setLocationTitle] = useState("Kunjungi Dapur Kami");
  const [address, setAddress] = useState(
    "Jl. Pluit Karang Indah Timur Blok O8, Muara Karang, Jakarta Utara 14450"
  );
  const [openDays, setOpenDays] = useState("Senin - Minggu");
  const [openHours, setOpenHours] = useState("08:00 - 21:00 WIB");
  const [cateringNote, setCateringNote] = useState(
    "Menerima Pesanan Catering & Hajatan"
  );
  const [whatsapp, setWhatsapp] = useState("0812-3456-7890");
  const [instagram, setInstagram] = useState("@sotobanjar.selera");
  const [tiktok, setTiktok] = useState("@sotobanjarselera");
  const [facebook, setFacebook] = useState("Soto Banjar Selera");
  const [brandName, setBrandName] = useState("Soto Banjar Selera");
  const [footerDesc, setFooterDesc] = useState(
    "Menyajikan kehangatan resep asli Kalimantan Selatan dengan kebersihan dan kualitas rasa terbaik."
  );
  const [deliveryBadge, setDeliveryBadge] = useState(
    "Pesan Antar Wilayah Jabodetabek"
  );
  const [copyright, setCopyright] = useState(
    "© 2026 Soto Banjar Selera Nusantara. All rights reserved."
  );

  const [openFaqIds, setOpenFaqIds] = useState<{ [id: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [faqInputQ, setFaqInputQ] = useState("");
  const [faqInputA, setFaqInputA] = useState("");

  useEffect(() => {
    async function loadSavedContentAndBestSeller() {
      try {
        const res = await fetch("/api/site-content", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();

          if (data.banner) {
            setStatusBadge(data.banner.statusBadge ?? "Dapur Delivery Buka");
            setBadgeTagline(
              data.banner.badgeTagline ??
                "Khusus Pesan Online • Area Jabodetabek"
            );
            setHeroTitle(
              data.banner.heroTitle ??
                "Keharuman Rempah Autentik Khas Banjar Langsung ke Rumahmu"
            );
            setHighlightWord(data.banner.highlightWord ?? "Khas Banjar");
            setHeroSubtitle(data.banner.heroSubtitle ?? "");
            setBtnPrimaryText(
              data.banner.btnPrimaryText ?? "🍲 Pesan Sajian Sekarang →"
            );
            setBtnSecondaryText(
              data.banner.btnSecondaryText ?? "Kisah Resep Kami"
            );
            setStat1Value(data.banner.stat1Value ?? "100%");
            setStat1Label(data.banner.stat1Label ?? "Rempah Asli Banjar");
            setStat2Value(data.banner.stat2Value ?? "4.9 ★");
            setStat2Label(data.banner.stat2Label ?? "Rating Pelanggan");
            setStat3Value(data.banner.stat3Value ?? "20++");
            setStat3Label(data.banner.stat3Label ?? "Menu Pilihan");
          }
          if (data.about) {
            setAboutBadge(data.about.aboutBadge ?? "FILOSOFI RASA");
            setAboutTitle(
              data.about.aboutTitle ??
                "Warisan Cita Rasa Hangat dari Bumi Kalimantan"
            );
            setAboutHighlight(data.about.aboutHighlight ?? "Bumi Kalimantan");
            setAboutParagraph1(data.about.aboutParagraph1 ?? "");
            setAboutParagraph2(data.about.aboutParagraph2 ?? "");
            setFeature1Title(data.about.feature1Title ?? "Ayam Kampung Asli");
            setFeature1Desc(data.about.feature1Desc ?? "");
            setFeature2Title(data.about.feature2Title ?? "Jeruk Kuit Segar");
            setFeature2Desc(data.about.feature2Desc ?? "");
            setAboutImage(
              data.about.aboutImage ??
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80"
            );
            setAboutImageTitle(
              data.about.aboutImageTitle ?? "100% Rempah Asli"
            );
            setAboutImageCaption(
              data.about.aboutImageCaption ?? "Resep Turun-Temurun Kalimantan"
            );
          }
          if (data.faq) {
            setFaqBadge(data.faq.faqBadge ?? "TANYA JAWAB");
            setFaqMainTitle(data.faq.faqMainTitle ?? "Pertanyaan Umum (FAQ)");
            setFaqDesc(data.faq.faqDesc ?? "");
            if (Array.isArray(data.faq.faqs) && data.faq.faqs.length > 0) {
              setFaqs(data.faq.faqs);
            }
          }
          if (data.menuSection) {
            setMenuBadge(
              data.menuSection.menuBadge ?? "Resep Warisan Asli Banjar"
            );
            setMenuTitle(data.menuSection.menuTitle ?? "Menu Pilihan Kami");
            setMenuSubtitle(data.menuSection.menuSubtitle ?? "");
          }
          if (data.locationFooter) {
            setLocationBadge(
              data.locationFooter.locationBadge ?? "LOKASI & KONTAK"
            );
            setLocationTitle(
              data.locationFooter.locationTitle ?? "Kunjungi Dapur Kami"
            );
            setAddress(data.locationFooter.address ?? "");
            setOpenDays(data.locationFooter.openDays ?? "Senin - Minggu");
            setOpenHours(
              data.locationFooter.openHours ?? "08:00 - 21:00 WIB"
            );
            setCateringNote(
              data.locationFooter.cateringNote ??
                "Menerima Pesanan Catering & Hajatan"
            );
            setWhatsapp(data.locationFooter.whatsapp ?? "0813-9926-0210");
            setInstagram(
              data.locationFooter.instagram ?? "@sotobanjar.selera"
            );
            setTiktok(data.locationFooter.tiktok ?? "@sotobanjarselera");
            setFacebook(data.locationFooter.facebook ?? "Soto Banjar Selera");
            setBrandName(
              data.locationFooter.brandName ?? "Soto Banjar Selera"
            );
            setFooterDesc(data.locationFooter.footerDesc ?? "");
            setDeliveryBadge(
              data.locationFooter.deliveryBadge ??
                "Pesan Antar Wilayah Jabodetabek"
            );
            setCopyright(
              data.locationFooter.copyright ??
                "© 2026 Soto Banjar Selera Nusantara. All rights reserved."
            );
          }
        }
      } catch {
      }

      // Sinkronisasi Otomatis Menu Paling Laris
      try {
        let menuList: MenuItemRecord[] = [];
        const menuRes = await fetch("/api/menu", { cache: "no-store" });
        if (menuRes.ok) {
          const mData: unknown = await menuRes.json();
          if (Array.isArray(mData)) {
            menuList = mData as MenuItemRecord[];
          }
        }

        let orderList: OrderRecord[] = [];
        try {
          const ordRes = await fetch("/api/orders", { cache: "no-store" });
          if (ordRes.ok) {
            const oData: unknown = await ordRes.json();
            if (Array.isArray(oData)) {
              orderList = oData as OrderRecord[];
            }
          }
        } catch {
          // Lanjut ke localStorage
        }

        if (orderList.length === 0 && typeof window !== "undefined") {
          const rawLocal = window.localStorage.getItem("soto_complete_orders");
          if (rawLocal) {
            try {
              const parsed: unknown = JSON.parse(rawLocal);
              if (Array.isArray(parsed)) {
                orderList = parsed as OrderRecord[];
              }
            } catch {
            }
          }
        }

        const salesCount = new Map<string, { qty: number; price: number }>();
        for (const ord of orderList) {
          const st = String(ord.status || "PENDING").toUpperCase();
          if (st === "DIBATALKAN" || st === "CANCELLED") continue;
          if (Array.isArray(ord.items)) {
            for (const it of ord.items) {
              const itemName = String(it.name || it.title || "").trim();
              if (!itemName) continue;
              const q = Number(it.qty ?? it.quantity ?? 1);
              const p = Number(it.price ?? 0);
              const prev = salesCount.get(itemName);
              salesCount.set(itemName, {
                qty: (prev?.qty || 0) + q,
                price: p || prev?.price || 32000,
              });
            }
          }
        }

        let bestName = "";
        let bestQty = 0;
        let bestPrice = 0;

        for (const [itemName, stat] of salesCount.entries()) {
          if (stat.qty > bestQty) {
            bestName = itemName;
            bestQty = stat.qty;
            bestPrice = stat.price;
          }
        }

        if (bestName) {
          const matchedMenu = menuList.find(
            (m) =>
              String(m.name || "")
                .trim()
                .toLowerCase() === bestName.toLowerCase()
          );
          const finalPrice = matchedMenu?.price ?? bestPrice;
          const finalImg =
            matchedMenu?.image && matchedMenu.image.trim() !== ""
              ? matchedMenu.image
              : "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg";

          setHeroImage(finalImg);
          setFeaturedLabel(`MENU PALING LARIS • ${bestQty} PORSI TERJUAL`);
          setFeaturedTitle(matchedMenu?.name || bestName);
          setFeaturedPrice(`Rp ${Number(finalPrice).toLocaleString("id-ID")}`);
        } else if (menuList.length > 0) {
          const firstMenu = menuList[0];
          if (firstMenu.image) setHeroImage(firstMenu.image);
          if (firstMenu.name) setFeaturedTitle(firstMenu.name);
          if (firstMenu.price) {
            setFeaturedPrice(
              `Rp ${Number(firstMenu.price).toLocaleString("id-ID")}`
            );
          }
        }
      } catch {
      }
    }

    void loadSavedContentAndBestSeller();
  }, []);

  function toggleFaqPreview(id: number) {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

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

  async function saveToServerAndLocal(customFaqs?: FaqItem[]) {
    const payload = {
      banner: {
        statusBadge,
        badgeTagline,
        heroTitle,
        highlightWord,
        heroSubtitle,
        btnPrimaryText,
        btnSecondaryText,
        stat1Value,
        stat1Label,
        stat2Value,
        stat2Label,
        stat3Value,
        stat3Label,
        heroImage,
        featuredLabel,
        featuredTitle,
        featuredPrice,
      },
      about: {
        aboutBadge,
        aboutTitle,
        aboutHighlight,
        aboutParagraph1,
        aboutParagraph2,
        feature1Title,
        feature1Desc,
        feature2Title,
        feature2Desc,
        aboutImage,
        aboutImageTitle,
        aboutImageCaption,
      },
      faq: {
        faqBadge,
        faqMainTitle,
        faqDesc,
        faqs: customFaqs ?? faqs,
      },
      menuSection: {
        menuBadge,
        menuTitle,
        menuSubtitle,
      },
      locationFooter: {
        locationBadge,
        locationTitle,
        address,
        openDays,
        openHours,
        cateringNote,
        whatsapp,
        instagram,
        tiktok,
        facebook,
        brandName,
        footerDesc,
        deliveryBadge,
        copyright,
      },
    };

    localStorage.setItem("soto_site_content", JSON.stringify(payload));
    window.dispatchEvent(new Event("soto-content-updated"));

    try {
      await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
    }

    setSaveBannerNotice(
      "✓ Perubahan berhasil disimpan"
    );
    setTimeout(() => setSaveBannerNotice(""), 3500);
  }

  async function handleSaveAll(e: React.FormEvent) {
    e.preventDefault();
    await saveToServerAndLocal();
  }

  async function handleResetDefault() {
    if (!confirm("Kembalikan konten ke pengaturan awal?")) return;
    setStatusBadge("Dapur Delivery Buka");
    setBadgeTagline("Khusus Pesan Online • Area Jabodetabek");
    setHeroTitle(
      "Keharuman Rempah Autentik Khas Banjar Langsung ke Rumahmu"
    );
    setHighlightWord("Khas Banjar");
    setHeroSubtitle(
      "Pesan Soto Banjar hangat kaldu ayam kampung murni berpadu kayu manis, kapulaga, cengkeh, dan bunga lawang khas Kalimantan Selatan. Dikemas higienis, anti tumpah, dan cepat sampai tujuan."
    );
    setBtnPrimaryText("🍲 Pesan Sajian Sekarang →");
    setBtnSecondaryText("Kisah Resep Kami");
    setStat1Value("100%");
    setStat1Label("Rempah Asli Banjar");
    setStat2Value("4.9 ★");
    setStat2Label("Rating Pelanggan");
    setStat3Value("20++");
    setStat3Label("Menu Pilihan");

    setAboutBadge("FILOSOFI RASA");
    setAboutTitle("Warisan Cita Rasa Hangat dari Bumi Kalimantan");
    setAboutHighlight("Bumi Kalimantan");
    setAboutImage(
      "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg"
    );
    setAboutImageTitle("100% Rempah Asli");
    setAboutImageCaption("Resep Turun-Temurun Kalimantan");

    setMenuBadge("Resep Warisan Asli Banjar");
    setMenuTitle("Menu Pilihan Kami");
    setMenuSubtitle(
      "Sajian khas Kalimantan Selatan dengan rebusan rempah kayu manis, kapulaga murni, dan jeruk kuit."
    );

    setBrandName("Soto Banjar Selera");
    setFooterDesc(
      "Menyajikan kehangatan resep asli Kalimantan Selatan dengan kebersihan dan kualitas rasa terbaik."
    );
    setDeliveryBadge("Pesan Antar Wilayah Jabodetabek");
    setAddress(
      "Jl. Pluit Karang Indah Timur Blok O8, Muara Karang, Jakarta Utara 14450"
    );
    setOpenDays("Senin - Minggu");
    setOpenHours("08:00 - 21:00 WIB");
    setCateringNote("Menerima Pesanan Catering & Hajatan");
    setInstagram("@sotobanjar.selera");
    setTiktok("@sotobanjarselera");
    setWhatsapp("0812-3456-7890");
    setFacebook("Soto Banjar Selera");
    setCopyright("© 2026 Soto Banjar Selera Nusantara. All rights reserved.");

    await saveToServerAndLocal();
  }

  async function handleAddOrEditFaq(e: React.FormEvent) {
    e.preventDefault();
    if (!faqInputQ.trim() || !faqInputA.trim()) return;

    let nextFaqs: FaqItem[];
    if (editingFaqId !== null) {
      nextFaqs = faqs.map((item) =>
        item.id === editingFaqId ? { ...item, q: faqInputQ, a: faqInputA } : item
      );
      setEditingFaqId(null);
    } else {
      const newId =
        faqs.length > 0 ? Math.max(...faqs.map((f) => f.id)) + 1 : 1;
      nextFaqs = [...faqs, { id: newId, q: faqInputQ, a: faqInputA }];
      setOpenFaqIds((prev) => ({ ...prev, [newId]: true }));
    }

    setFaqs(nextFaqs);
    setFaqInputQ("");
    setFaqInputA("");
    await saveToServerAndLocal(nextFaqs);
  }

  async function handleDeleteFaq(id: number) {
    if (confirm("Hapus pertanyaan ini dari daftar FAQ?")) {
      const nextFaqs = faqs.filter((f) => f.id !== id);
      setFaqs(nextFaqs);
      await saveToServerAndLocal(nextFaqs);
    }
  }

  function handleStartEditFaq(f: FaqItem) {
    setEditingFaqId(f.id);
    setFaqInputQ(f.q);
    setFaqInputA(f.a);
  }

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
      {/* HEADER */}
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
            Edit Header &amp; Konten Web
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: "#6D4C30",
            }}
          >
            Ubah kalimat banner hero, cerita cita rasa, daftar FAQ, judul menu, serta lokasi &amp; footer.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {saveBannerNotice && (
            <div
              style={{
                backgroundColor: "#DCFCE7",
                color: "#166534",
                border: "1px solid #86EFAC",
                padding: "9px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: "800",
              }}
            >
              {saveBannerNotice}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => void handleSaveAll(e)}
            style={{
              backgroundColor: "#5C3A21",
              color: "#FFFFFF",
              border: "none",
              padding: "11px 20px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 6px 16px rgba(92, 58, 33, 0.25)",
            }}
          >
            💾 Simpan Semua Konten
          </button>
        </div>
      </header>

      {/* AREA KONTEN DENGAN PADDING RAPI */}
      <div style={{ padding: "28px 32px 60px" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            border: "1.5px solid #E5DEC9",
            padding: "28px",
            boxShadow: "0 6px 25px rgba(42, 26, 17, 0.04)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                margin: "0 0 4px",
                fontSize: "17px",
                fontWeight: "900",
                color: "#2A1A11",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5C3A21"
                strokeWidth={2.2}
              >
                <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Pengaturan Konten Halaman Web Customer
            </h3>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#6D4C30" }}>
              Sesuaikan kalimat hero banner, cerita tentang cita rasa, daftar tanya jawab (FAQ), judul menu, hingga lokasi &amp; footer.
            </p>
          </div>

          {/* Tombol Tab Navigasi */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "26px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("banner")}
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border:
                  activeTab === "banner"
                    ? "1.5px solid #734F31"
                    : "1px solid #E8D1A7",
                backgroundColor: activeTab === "banner" ? "#734F31" : "#FAF6EE",
                color: activeTab === "banner" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              1. Banner Header
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("about")}
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border:
                  activeTab === "about"
                    ? "1.5px solid #734F31"
                    : "1px solid #E8D1A7",
                backgroundColor: activeTab === "about" ? "#734F31" : "#FAF6EE",
                color: activeTab === "about" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              2. Cerita Tentang Kami (Filosofi Rasa)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("faq")}
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border:
                  activeTab === "faq"
                    ? "1.5px solid #734F31"
                    : "1px solid #E8D1A7",
                backgroundColor: activeTab === "faq" ? "#734F31" : "#FAF6EE",
                color: activeTab === "faq" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              3. Tanya Jawab (FAQ)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("menu")}
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border:
                  activeTab === "menu"
                    ? "1.5px solid #734F31"
                    : "1px solid #E8D1A7",
                backgroundColor: activeTab === "menu" ? "#734F31" : "#FAF6EE",
                color: activeTab === "menu" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              4. Header Katalog Menu
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("location")}
              style={{
                padding: "9px 18px",
                borderRadius: "10px",
                border:
                  activeTab === "location"
                    ? "1.5px solid #734F31"
                    : "1px solid #E8D1A7",
                backgroundColor:
                  activeTab === "location" ? "#734F31" : "#FAF6EE",
                color: activeTab === "location" ? "#FAF6EE" : "#734F31",
                fontSize: "12px",
                fontWeight: "800",
                cursor: "pointer",
              }}
            >
              5. Lokasi &amp; Footer
            </button>
          </div>

          {/* BANNER HEADER */}
          {activeTab === "banner" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "28px" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#734F31",
                    }}
                  >
                    Live Preview: Banner Header Customer
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "800",
                    }}
                  >
                    Live Preview Aktif
                  </span>
                </div>

                <div
                  style={{
                    background:
                      "radial-gradient(circle at 75% 35%, #4A321F 0%, #2A1A11 65%, #21130C 100%)",
                    borderRadius: "18px",
                    overflow: "hidden",
                    boxShadow: "0 14px 35px rgba(42, 26, 17, 0.25)",
                    border: "1.5px solid #8A6B47",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#1A0F0A",
                      padding: "8px 14px",
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#EF4444",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#F59E0B",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      padding: "32px 28px",
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "28px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "14px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(232, 209, 167, 0.35)",
                            color: "#EFE3C8",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "4px 12px",
                            borderRadius: "999px",
                          }}
                        >
                          <span
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              backgroundColor: "#4ADE80",
                            }}
                          />
                          {statusBadge}
                        </span>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(232, 209, 167, 0.35)",
                            color: "#EFE3C8",
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "4px 12px",
                            borderRadius: "999px",
                          }}
                        >
                          {badgeTagline}
                        </span>
                      </div>

                      <h4
                        style={{
                          margin: "0 0 12px",
                          fontSize: "24px",
                          fontWeight: 900,
                          color: "#FAF6EE",
                          lineHeight: 1.2,
                        }}
                      >
                        {renderHighlightedText(heroTitle, highlightWord)}
                      </h4>

                      <p
                        style={{
                          margin: "0 0 18px",
                          fontSize: "11.5px",
                          color: "#D5C5B3",
                          lineHeight: 1.65,
                        }}
                      >
                        {heroSubtitle}
                      </p>

                      {/* 2 TOMBOL */}
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginBottom: "20px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "#F5EFE4",
                            color: "#2A1A11",
                            fontSize: "11px",
                            fontWeight: 900,
                            padding: "8px 16px",
                            borderRadius: "10px",
                          }}
                        >
                          {btnPrimaryText}
                        </span>
                        <span
                          style={{
                            backgroundColor: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(232, 209, 167, 0.35)",
                            color: "#EFE3C8",
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "8px 14px",
                            borderRadius: "10px",
                          }}
                        >
                          {btnSecondaryText}
                        </span>
                      </div>

                      {/* 3 STATISTIK BAWAH */}
                      <div
                        style={{
                          borderTop: "1px solid rgba(232, 209, 167, 0.2)",
                          paddingTop: "14px",
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 900,
                              color: "#FAF6EE",
                            }}
                          >
                            {stat1Value}
                          </div>
                          <div style={{ fontSize: "9.5px", color: "#B8A692" }}>
                            {stat1Label}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 900,
                              color: "#FAF6EE",
                            }}
                          >
                            {stat2Value}
                          </div>
                          <div style={{ fontSize: "9.5px", color: "#B8A692" }}>
                            {stat2Label}
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: "15px",
                              fontWeight: 900,
                              color: "#FAF6EE",
                            }}
                          >
                            {stat3Value}
                          </div>
                          <div style={{ fontSize: "9.5px", color: "#B8A692" }}>
                            {stat3Label}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          height: "195px",
                          width: "100%",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "2px solid #8A6B47",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroImage}
                          alt={featuredTitle}
                          onError={(e) => {
                            e.currentTarget.src =
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
                          backgroundColor: "rgba(42, 26, 17, 0.9)",
                          border: "1px solid #8A6B47",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "9px",
                              fontWeight: 900,
                              color: "#E8D1A7",
                            }}
                          >
                            🔥 {featuredLabel}
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 900,
                              color: "#FAF6EE",
                            }}
                          >
                            {featuredTitle}
                          </div>
                        </div>
                        <span
                          style={{
                            backgroundColor: "#FAF6EE",
                            color: "#2A1A11",
                            fontSize: "11px",
                            fontWeight: 900,
                            padding: "5px 10px",
                            borderRadius: "8px",
                          }}
                        >
                          {featuredPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "14px",
                  border: "1px solid #E8D1A7",
                  padding: "22px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#734F31",
                    display: "block",
                    marginBottom: "14px",
                  }}
                >
                  Form Sunting Banner Header
                </span>
                <form
                  onSubmit={(e) => void handleSaveAll(e)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1.4fr",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Badge Status Kiri
                      </label>
                      <input
                        type="text"
                        value={statusBadge}
                        onChange={(e) => setStatusBadge(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Tagline Badge Atas Kanan
                      </label>
                      <input
                        type="text"
                        value={badgeTagline}
                        onChange={(e) => setBadgeTagline(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Judul Utama Banner
                      </label>
                      <input
                        type="text"
                        value={heroTitle}
                        onChange={(e) => setHeroTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Kata yang di-highlight
                      </label>
                      <input
                        type="text"
                        value={highlightWord}
                        onChange={(e) => setHighlightWord(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Deskripsi Lengkap
                    </label>
                    <textarea
                      rows={3}
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* INPUT 2 TOMBOL */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "14px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Teks Tombol (Kiri)
                      </label>
                      <input
                        type="text"
                        value={btnPrimaryText}
                        onChange={(e) => setBtnPrimaryText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Teks Tombol (Kanan)
                      </label>
                      <input
                        type="text"
                        value={btnSecondaryText}
                        onChange={(e) => setBtnSecondaryText(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  {/* INPUT 3 STATISTIK BAWAH */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                      backgroundColor: "#FFFFFF",
                      padding: "14px",
                      borderRadius: "10px",
                      border: "1px solid #E8D1A7",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Statistik 1 (Angka &amp; Label)
                      </label>
                      <input
                        type="text"
                        value={stat1Value}
                        onChange={(e) => setStat1Value(e.target.value)}
                        placeholder="Contoh: 100%"
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FAF6EE",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#734F31",
                          marginBottom: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="text"
                        value={stat1Label}
                        onChange={(e) => setStat1Label(e.target.value)}
                        placeholder="Contoh: Rempah Asli Banjar"
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FAF6EE",
                          fontSize: "11.5px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Statistik 2 (Angka &amp; Label)
                      </label>
                      <input
                        type="text"
                        value={stat2Value}
                        onChange={(e) => setStat2Value(e.target.value)}
                        placeholder="Contoh: 4.9 ★"
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FAF6EE",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#734F31",
                          marginBottom: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="text"
                        value={stat2Label}
                        onChange={(e) => setStat2Label(e.target.value)}
                        placeholder="Contoh: Rating Pelanggan"
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FAF6EE",
                          fontSize: "11.5px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Statistik 3 (Angka &amp; Label)
                      </label>
                      <input
                        type="text"
                        value={stat3Value}
                        onChange={(e) => setStat3Value(e.target.value)}
                        placeholder="Contoh: 20++"
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FAF6EE",
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#734F31",
                          marginBottom: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="text"
                        value={stat3Label}
                        onChange={(e) => setStat3Label(e.target.value)}
                        placeholder="Contoh: Menu Pilihan"
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FAF6EE",
                          fontSize: "11.5px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                    <button
                      type="submit"
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#734F31",
                        color: "#FAF6EE",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Simpan Header
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleResetDefault()}
                      style={{
                        padding: "10px 16px",
                        backgroundColor: "#FFFFFF",
                        color: "#734F31",
                        border: "1px solid #E8D1A7",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Reset ke Default
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* CERITA TENTANG KAMI - FILOSOFI RASA */}
          {activeTab === "about" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "28px" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#734F31",
                    }}
                  >
                    Live Preview: Tampilan Section Tentang Kami (Filosofi Rasa)
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "800",
                    }}
                  >
                    Live Preview Aktif
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "#FAF6EE",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1.5px solid #E8D1A7",
                    boxShadow: "0 10px 30px rgba(46, 28, 20, 0.12)",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#1A0F0A",
                      padding: "8px 14px",
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#EF4444",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#F59E0B",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                      }}
                    />
                  </div>

                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        backgroundColor: "#362214",
                        borderRadius: "24px",
                        border: "2px solid #6D4C30",
                        padding: "28px",
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "28px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          borderRadius: "18px",
                          padding: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1.5px solid rgba(232, 209, 167, 0.3)",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            height: "230px",
                            width: "100%",
                            borderRadius: "14px",
                            overflow: "hidden",
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={aboutImage}
                            alt="Filosofi Soto"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              right: "10px",
                              left: "60px",
                              backgroundColor: "rgba(54, 34, 20, 0.92)",
                              border: "1px solid rgba(232, 209, 167, 0.35)",
                              borderRadius: "10px",
                              padding: "8px 12px",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 900,
                                color: "#FAF6EE",
                              }}
                            >
                              {aboutImageTitle}
                            </div>
                            <div
                              style={{ fontSize: "9.5px", color: "#D5C5B3" }}
                            >
                              {aboutImageCaption}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            display: "inline-block",
                            backgroundColor: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(232, 209, 167, 0.4)",
                            color: "#EFE3C8",
                            fontSize: "9.5px",
                            fontWeight: 800,
                            padding: "4px 12px",
                            borderRadius: "999px",
                            marginBottom: "10px",
                          }}
                        >
                          {aboutBadge}
                        </div>

                        <h3
                          style={{
                            margin: "0 0 10px",
                            fontSize: "20px",
                            fontWeight: 900,
                            color: "#FAF6EE",
                            lineHeight: 1.25,
                          }}
                        >
                          {renderHighlightedText(aboutTitle, aboutHighlight)}
                        </h3>

                        <p
                          style={{
                            margin: "0 0 8px",
                            fontSize: "11px",
                            color: "#D5C5B3",
                            lineHeight: 1.6,
                          }}
                        >
                          {aboutParagraph1}
                        </p>
                        <p
                          style={{
                            margin: "0 0 14px",
                            fontSize: "11px",
                            color: "#D5C5B3",
                            lineHeight: 1.6,
                          }}
                        >
                          {aboutParagraph2}
                        </p>

                        <div
                          style={{
                            borderTop: "1px solid rgba(232, 209, 167, 0.18)",
                            paddingTop: "12px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(232, 209, 167, 0.25)",
                              borderRadius: "10px",
                              padding: "10px 12px",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: "11px",
                                color: "#FAF6EE",
                                display: "block",
                                marginBottom: "2px",
                              }}
                            >
                              {feature1Title}
                            </strong>
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#C4B29E",
                                lineHeight: 1.4,
                                display: "block",
                              }}
                            >
                              {feature1Desc}
                            </span>
                          </div>

                          <div
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(232, 209, 167, 0.25)",
                              borderRadius: "10px",
                              padding: "10px 12px",
                            }}
                          >
                            <strong
                              style={{
                                fontSize: "11px",
                                color: "#FAF6EE",
                                display: "block",
                                marginBottom: "2px",
                              }}
                            >
                              {feature2Title}
                            </strong>
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#C4B29E",
                                lineHeight: 1.4,
                                display: "block",
                              }}
                            >
                              {feature2Desc}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "14px",
                  border: "1px solid #E8D1A7",
                  padding: "22px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#734F31",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Form Sunting Section Tentang Kami
                </span>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9D9167",
                    margin: "0 0 16px",
                  }}
                >
                  Ubah teks, dua kotak keunggulan rasa, serta foto persegi &amp; badge overlay Tentang Kami di bawah ini.
                </p>

                <form
                  onSubmit={(e) => void handleSaveAll(e)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Badge Tagline Atas
                      </label>
                      <input
                        type="text"
                        value={aboutBadge}
                        onChange={(e) => setAboutBadge(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Kata yang di-highlight
                      </label>
                      <input
                        type="text"
                        value={aboutHighlight}
                        onChange={(e) => setAboutHighlight(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Judul Utama Tentang Kami
                    </label>
                    <input
                      type="text"
                      value={aboutTitle}
                      onChange={(e) => setAboutTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Paragraf 1 (Cerita Cita Rasa &amp; Rempah)
                      </label>
                      <textarea
                        rows={5}
                        value={aboutParagraph1}
                        onChange={(e) => setAboutParagraph1(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "11px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Paragraf 2 (Kualitas Ayam &amp; Pelengkap)
                      </label>
                      <textarea
                        rows={5}
                        value={aboutParagraph2}
                        onChange={(e) => setAboutParagraph2(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "11px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Judul Kotak 1 &amp; Deskripsi
                      </label>
                      <input
                        type="text"
                        value={feature1Title}
                        onChange={(e) => setFeature1Title(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "11px",
                          marginBottom: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="text"
                        value={feature1Desc}
                        onChange={(e) => setFeature1Desc(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "11px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Judul Kotak 2 &amp; Deskripsi
                      </label>
                      <input
                        type="text"
                        value={feature2Title}
                        onChange={(e) => setFeature2Title(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "11px",
                          marginBottom: "6px",
                          boxSizing: "border-box",
                        }}
                      />
                      <input
                        type="text"
                        value={feature2Desc}
                        onChange={(e) => setFeature2Desc(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "11px",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.4fr 1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        URL Foto Tentang Kami
                      </label>
                      <input
                        type="url"
                        value={aboutImage}
                        onChange={(e) => setAboutImage(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Judul Overlay Foto
                      </label>
                      <input
                        type="text"
                        value={aboutImageTitle}
                        onChange={(e) => setAboutImageTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#734F31",
                          marginBottom: "4px",
                        }}
                      >
                        Sub-Teks Overlay Foto
                      </label>
                      <input
                        type="text"
                        value={aboutImageCaption}
                        onChange={(e) => setAboutImageCaption(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: "8px",
                          border: "1px solid #E8D1A7",
                          backgroundColor: "#FFFFFF",
                          fontSize: "12px",
                          color: "#734F31",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <button
                      type="submit"
                      style={{
                        padding: "10px 22px",
                        backgroundColor: "#734F31",
                        color: "#FAF6EE",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Simpan Perubahan Cerita
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleResetDefault()}
                      style={{
                        padding: "10px 16px",
                        backgroundColor: "#FFFFFF",
                        color: "#734F31",
                        border: "1px solid #E8D1A7",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      Reset ke Default
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TANYA JAWAB (FAQ) */}
          {activeTab === "faq" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "30px" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#734F31",
                    }}
                  >
                    Live Preview: Tampilan Section Tanya Jawab (FAQ)
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "800",
                    }}
                  >
                    Live Preview Aktif
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "#FAF6EE",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1.5px solid #E8D1A7",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#16231C",
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#EF4444",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#F59E0B",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                      }}
                    />
                  </div>

                  <div style={{ padding: "30px 24px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor: "rgba(232, 209, 167, 0.35)",
                        border: "1px solid #E8D1A7",
                        color: "#734F31",
                        fontSize: "10px",
                        fontWeight: "900",
                        padding: "3px 12px",
                        borderRadius: "20px",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                      }}
                    >
                      {faqBadge}
                    </div>

                    <h3
                      style={{
                        margin: "0 0 6px",
                        fontSize: "20px",
                        fontWeight: "900",
                        color: "#1E293B",
                        fontFamily: "serif",
                      }}
                    >
                      {faqMainTitle}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 22px",
                        fontSize: "12px",
                        color: "#64748B",
                      }}
                    >
                      {faqDesc}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {faqs.map((f) => {
                        const isOpen = openFaqIds[f.id] ?? true;
                        return (
                          <div
                            key={f.id}
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderRadius: "12px",
                              border: "1px solid #E2E8F0",
                              overflow: "hidden",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => toggleFaqPreview(f.id)}
                              style={{
                                width: "100%",
                                padding: "14px 18px",
                                backgroundColor: "#FFFFFF",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                textAlign: "left",
                                cursor: "pointer",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "800",
                                  color: "#0F172A",
                                }}
                              >
                                {f.q}
                              </span>
                              <span
                                style={{
                                  color: "#64748B",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                }}
                              >
                                {isOpen ? "∧" : "∨"}
                              </span>
                            </button>
                            {isOpen && (
                              <div
                                style={{
                                  padding: "0 18px 16px",
                                  fontSize: "12px",
                                  color: "#64748B",
                                  lineHeight: "1.6",
                                }}
                              >
                                {f.a}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "14px",
                  border: "1px solid #E8D1A7",
                  padding: "22px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Badge Tagline Section FAQ
                    </label>
                    <input
                      type="text"
                      value={faqBadge}
                      onChange={(e) => setFaqBadge(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Judul Utama FAQ
                    </label>
                    <input
                      type="text"
                      value={faqMainTitle}
                      onChange={(e) => setFaqMainTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#734F31",
                      marginBottom: "4px",
                    }}
                  >
                    Deskripsi Singkat FAQ
                  </label>
                  <textarea
                    rows={2}
                    value={faqDesc}
                    onChange={(e) => setFaqDesc(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => void handleSaveAll(e)}
                  style={{
                    padding: "9px 20px",
                    backgroundColor: "#734F31",
                    color: "#FAF6EE",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Simpan Header FAQ
                </button>
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1.5px solid #E8D1A7",
                  padding: "20px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#734F31",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  {editingFaqId !== null
                    ? `Sunting Pertanyaan #${editingFaqId}`
                    : "+ Tambah Butir FAQ Baru"}
                </span>
                <form
                  onSubmit={(e) => void handleAddOrEditFaq(e)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <input
                    type="text"
                    required
                    placeholder="Tuliskan pertanyaan..."
                    value={faqInputQ}
                    onChange={(e) => setFaqInputQ(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FAF6EE",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                  <textarea
                    required
                    rows={2}
                    placeholder="Tuliskan jawaban..."
                    value={faqInputA}
                    onChange={(e) => setFaqInputA(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FAF6EE",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="submit"
                      style={{
                        padding: "8px 18px",
                        backgroundColor: "#734F31",
                        color: "#FAF6EE",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      {editingFaqId !== null
                        ? "Simpan Perubahan FAQ"
                        : "Tambahkan ke Daftar FAQ"}
                    </button>
                  </div>
                </form>
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1.5px solid #E8D1A7",
                  padding: "20px",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1.5px solid #E8D1A7",
                        color: "#9D9167",
                      }}
                    >
                      <th style={{ padding: "10px 8px" }}>No</th>
                      <th style={{ padding: "10px 12px" }}>Pertanyaan</th>
                      <th style={{ padding: "10px 12px" }}>Jawaban</th>
                      <th style={{ padding: "10px 12px", textAlign: "right" }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((f, idx) => (
                      <tr
                        key={f.id}
                        style={{ borderBottom: "1px solid #FAF6EE" }}
                      >
                        <td style={{ padding: "12px 8px", fontWeight: 800 }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: "12px", fontWeight: 800 }}>
                          {f.q}
                        </td>
                        <td style={{ padding: "12px", color: "#64748B" }}>
                          {f.a}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleStartEditFaq(f)}
                            style={{
                              padding: "5px 12px",
                              backgroundColor: "#FAF6EE",
                              border: "1px solid #E8D1A7",
                              color: "#734F31",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "800",
                              cursor: "pointer",
                              marginRight: "6px",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteFaq(f.id)}
                            style={{
                              padding: "5px 12px",
                              backgroundColor: "#FEF2F2",
                              border: "1px solid #FECACA",
                              color: "#DC2626",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "800",
                              cursor: "pointer",
                            }}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HEADER KATALOG MENU */}
          {activeTab === "menu" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "28px" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#734F31",
                    }}
                  >
                    Live Preview: Tampilan Header Katalog Menu Customer
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "800",
                    }}
                  >
                    Live Preview Aktif
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "#FAF6EE",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1.5px solid #E8D1A7",
                    boxShadow: "0 10px 28px rgba(115, 79, 49, 0.08)",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#1A0F0A",
                      padding: "8px 14px",
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#EF4444",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#F59E0B",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                      }}
                    />
                  </div>

                  <div style={{ padding: "28px 24px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: "16px",
                        borderBottom: "2px solid #8A6B47",
                        paddingBottom: "20px",
                        marginBottom: "20px",
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
                            padding: "5px 14px",
                            borderRadius: "30px",
                            fontSize: "11px",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            marginBottom: "10px",
                          }}
                        >
                          {menuBadge}
                        </div>
                        <h3
                          style={{
                            fontSize: "26px",
                            fontWeight: "900",
                            color: "#2A1A11",
                            margin: "0 0 6px 0",
                          }}
                        >
                          {menuTitle}
                        </h3>
                        <p
                          style={{
                            color: "#6D4C30",
                            fontSize: "13px",
                            margin: 0,
                            fontWeight: "600",
                          }}
                        >
                          {menuSubtitle}
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "9px 14px",
                          borderRadius: "12px",
                          border: "1.5px solid #8A6B47",
                          backgroundColor: "#FFFFFF",
                          color: "#8A6B47",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Cari menu . . .
                      </div>
                    </div>

                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {[
                        "Semua Menu",
                        "Makanan",
                        "Cemilan",
                        "Pendamping",
                        "Minuman",
                      ].map((c, i) => (
                        <span
                          key={c}
                          style={{
                            padding: "8px 18px",
                            borderRadius: "50px",
                            fontSize: "12px",
                            fontWeight: 800,
                            backgroundColor: i === 0 ? "#2A1A11" : "#FFFFFF",
                            color: i === 0 ? "#EFE3C8" : "#432818",
                            border: "1.5px solid #D6C7B2",
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => void handleSaveAll(e)}
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "14px",
                  border: "1px solid #E8D1A7",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#734F31",
                  }}
                >
                  Form Sunting Header Katalog Menu
                </span>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#734F31",
                      marginBottom: "4px",
                    }}
                  >
                    Badge Tagline Atas Menu
                  </label>
                  <input
                    type="text"
                    value={menuBadge}
                    onChange={(e) => setMenuBadge(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#734F31",
                      marginBottom: "4px",
                    }}
                  >
                    Judul Utama Seksi Menu
                  </label>
                  <input
                    type="text"
                    value={menuTitle}
                    onChange={(e) => setMenuTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#734F31",
                      marginBottom: "4px",
                    }}
                  >
                    Deskripsi Sub-Judul Menu
                  </label>
                  <textarea
                    rows={2}
                    value={menuSubtitle}
                    onChange={(e) => setMenuSubtitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 22px",
                      backgroundColor: "#734F31",
                      color: "#FAF6EE",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Simpan Header Menu
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleResetDefault()}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#FFFFFF",
                      color: "#734F31",
                      border: "1px solid #E8D1A7",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Reset ke Default
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LOKASI & FOOTER */}
          {activeTab === "location" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "28px" }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: "#734F31",
                    }}
                  >
                    Live Preview: Tampilan Lokasi &amp; Footer Customer
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontWeight: "800",
                    }}
                  >
                    Live Preview Aktif
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: "#2A1A11",
                    color: "#EFE3C8",
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1.5px solid #6D4C30",
                    boxShadow: "0 12px 30px rgba(42, 26, 17, 0.25)",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#1A0F0A",
                      padding: "8px 14px",
                      display: "flex",
                      gap: "6px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#EF4444",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#F59E0B",
                      }}
                    />
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10B981",
                      }}
                    />
                  </div>

                  <div style={{ padding: "28px 24px 20px" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(190px, 1fr))",
                        gap: "24px",
                        paddingBottom: "22px",
                        borderBottom: "1px solid rgba(239, 227, 200, 0.2)",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            margin: "0 0 10px",
                            fontSize: "17px",
                            fontWeight: 900,
                            color: "#EFE3C8",
                          }}
                        >
                          {brandName}
                        </h4>
                        <p
                          style={{
                            fontSize: "11.5px",
                            color: "#D5C5B3",
                            lineHeight: 1.6,
                            margin: "0 0 12px",
                          }}
                        >
                          {footerDesc}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            background: "rgba(239, 227, 200, 0.12)",
                            border: "1px solid #8A6B47",
                            borderRadius: "8px",
                            padding: "5px 12px",
                            fontSize: "11px",
                            color: "#EFE3C8",
                            fontWeight: 700,
                          }}
                        >
                          {deliveryBadge}
                        </span>
                      </div>

                      <div>
                        <h4
                          style={{
                            margin: "0 0 10px",
                            fontSize: "12.5px",
                            fontWeight: 900,
                            color: "#EFE3C8",
                            textTransform: "uppercase",
                          }}
                        >
                          Lokasi &amp; Jam Layanan
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            fontSize: "11.5px",
                            color: "#D5C5B3",
                            lineHeight: 1.6,
                            marginBottom: "8px",
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#EFE3C8"
                            strokeWidth="2.2"
                            style={{ marginTop: "2px", flexShrink: 0 }}
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{address}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#D5C5B3" }}>
                          {openDays}:
                        </div>
                        <strong
                          style={{
                            fontSize: "13px",
                            color: "#EFE3C8",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {openHours}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#EFE3C8" }}>
                          {cateringNote}
                        </div>
                      </div>

                      <div>
                        <h4
                          style={{
                            margin: "0 0 10px",
                            fontSize: "12.5px",
                            fontWeight: 900,
                            color: "#EFE3C8",
                            textTransform: "uppercase",
                          }}
                        >
                          Media Sosial
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            fontSize: "11.5px",
                            color: "#D5C5B3",
                            fontWeight: 600,
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "6px",
                                background:
                                  "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFFFFF",
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <rect
                                  x="2"
                                  y="2"
                                  width="20"
                                  height="20"
                                  rx="5"
                                  ry="5"
                                />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line
                                  x1="17.5"
                                  y1="6.5"
                                  x2="17.51"
                                  y2="6.5"
                                />
                              </svg>
                            </span>
                            <span>{instagram}</span>
                          </div>

                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "6px",
                                backgroundColor: "#000000",
                                border: "1px solid rgba(255,255,255,0.2)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFFFFF",
                              }}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                              </svg>
                            </span>
                            <span>{tiktok}</span>
                          </div>

                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "6px",
                                backgroundColor: "#25D366",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFFFFF",
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z" />
                              </svg>
                            </span>
                            <span>{whatsapp}</span>
                          </div>

                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "6px",
                                backgroundColor: "#1877F2",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFFFFF",
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                              </svg>
                            </span>
                            <span>{facebook}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "14px",
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#EFE3C8",
                      }}
                    >
                      {copyright}
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={(e) => void handleSaveAll(e)}
                style={{
                  backgroundColor: "#FAF6EE",
                  borderRadius: "14px",
                  border: "1px solid #E8D1A7",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: "800",
                    color: "#734F31",
                  }}
                >
                  Form Sunting Lokasi &amp; Footer
                </span>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Nama Brand di Footer
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Badge Info Pengiriman
                    </label>
                    <input
                      type="text"
                      value={deliveryBadge}
                      onChange={(e) => setDeliveryBadge(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#734F31",
                      marginBottom: "4px",
                    }}
                  >
                    Deskripsi Brand di Footer
                  </label>
                  <textarea
                    rows={2}
                    value={footerDesc}
                    onChange={(e) => setFooterDesc(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#734F31",
                      marginBottom: "4px",
                    }}
                  >
                    Alamat Lengkap Restoran
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Hari Layanan
                    </label>
                    <input
                      type="text"
                      value={openDays}
                      onChange={(e) => setOpenDays(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Jam Layanan
                    </label>
                    <input
                      type="text"
                      value={openHours}
                      onChange={(e) => setOpenHours(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Catatan Katering
                    </label>
                    <input
                      type="text"
                      value={cateringNote}
                      onChange={(e) => setCateringNote(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "12px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "11.5px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      TikTok
                    </label>
                    <input
                      type="text"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "11.5px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Nomor WhatsApp
                    </label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "11.5px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "#734F31",
                        marginBottom: "4px",
                      }}
                    >
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        border: "1px solid #E8D1A7",
                        backgroundColor: "#FFFFFF",
                        fontSize: "11.5px",
                        color: "#734F31",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: "800",
                      color: "#734F31",
                      marginBottom: "4px",
                    }}
                  >
                    Teks Copyright Bawah
                  </label>
                  <input
                    type="text"
                    value={copyright}
                    onChange={(e) => setCopyright(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #E8D1A7",
                      backgroundColor: "#FFFFFF",
                      fontSize: "12px",
                      color: "#734F31",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 22px",
                      backgroundColor: "#734F31",
                      color: "#FAF6EE",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Simpan Lokasi &amp; Footer
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleResetDefault()}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#FFFFFF",
                      color: "#734F31",
                      border: "1px solid #E8D1A7",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Reset ke Default
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}