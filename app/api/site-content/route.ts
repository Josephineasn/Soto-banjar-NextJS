import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CONTENT_FILE = path.join(process.cwd(), "site-content.json");

export interface FaqItem {
  id: number;
  q: string;
  a: string;
}

export interface SiteContentStore {
  banner: {
    badgeTagline: string;
    heroTitle: string;
    highlightWord: string;
    heroSubtitle: string;
    heroImage: string;
  };
  about: {
    aboutBadge: string;
    aboutTitle: string;
    aboutHighlight: string;
    aboutParagraph1: string;
    aboutParagraph2: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    aboutImage: string;
    aboutImageCaption: string;
  };
  faq: {
    faqBadge: string;
    faqMainTitle: string;
    faqDesc: string;
    faqs: FaqItem[];
  };
  menuSection: {
    menuBadge: string;
    menuTitle: string;
    menuSubtitle: string;
  };
  locationFooter: {
    locationBadge: string;
    locationTitle: string;
    address: string;
    openDays: string;
    openHours: string;
    cateringNote: string;
    whatsapp: string;
    instagram: string;
    tiktok: string;
    facebook: string;
    brandName: string;
    footerDesc: string;
    deliveryBadge: string;
    copyright: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContentStore = {
  banner: {
    badgeTagline: "Khusus Pesan Online • Area Jabodetabek",
    heroTitle: "Keharuman Rempah Autentik Khas Banjar Langsung ke Rumahmu",
    highlightWord: "Khas Banjar",
    heroSubtitle:
      "Pesan Soto Banjar hangat kaldu ayam kampung murni berpadu kayu manis, kapulaga, cengkeh, dan bunga lawang khas Kalimantan Selatan. Dikemas higienis, anti tumpah, dan cepat sampai tujuan.",
    heroImage:
      "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg",
  },
  about: {
    aboutBadge: "FILOSOFI RASA",
    aboutTitle: "Warisan Cita Rasa Hangat dari Bumi Kalimantan",
    aboutHighlight: "Bumi Kalimantan",
    aboutParagraph1:
      "Soto Banjar Selera Nusantara berakar dari kecintaan kami melestarikan kuliner legendaris khas Banjarmasin. Kunci kelezatan sup kami terletak pada simfoni rempah aromatik pilihan: kayu manis, cengkeh, kapulaga, pala, dan bunga lawang yang ditumis harum dengan mentega berkualitas sebelum dipadukan ke dalam rebusan kaldu murni.",
    aboutParagraph2:
      "Kami hanya menggunakan 100% ayam kampung segar yang menghasilkan kaldu gurih alami tanpa bahan pengawet. Disajikan lengkap bersama ketupat lembut, perkedel kentang legit, suwiran ayam tebal, telur bebek rebus, serta kucuran perasan jeruk kuit khas yang harum menyegarkan.",
    feature1Title: "Ayam Kampung Asli",
    feature1Desc:
      "Daging manis alami berpadu kaldu gurih kaya nutrisi rempah.",
    feature2Title: "Jeruk Kuit Segar",
    feature2Desc: "Aroma sitrus khas Banjar yang autentik dan menyegarkan.",
    aboutImage:
      "https://indonesiakaya.com/wp-content/uploads/2023/04/sb_Artboard_5.jpg",
    aboutImageCaption: "Resep Turun-Temurun",
  },
  faq: {
    faqBadge: "TANYA JAWAB",
    faqMainTitle: "Pertanyaan Umum (FAQ)",
    faqDesc:
      "Punya pertanyaan seputar cara pesan, pengiriman, dan kualitas soto kami?",
    faqs: [
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
    ],
  },
  menuSection: {
    menuBadge: "Resep Warisan Asli Banjar",
    menuTitle: "Menu Pilihan Kami",
    menuSubtitle:
      "Sajian khas Kalimantan Selatan dengan rebusan rempah kayu manis, kapulaga murni, dan jeruk kuit.",
  },
  locationFooter: {
    locationBadge: "LOKASI & KONTAK",
    locationTitle: "Kunjungi Dapur Kami",
    address:
      "Jl. Pluit Karang Indah Timur Blok O8, Muara Karang, Jakarta Utara 14450",
    openDays: "Senin - Minggu",
    openHours: "08:00 - 21:00 WIB",
    cateringNote: "Menerima Pesanan Catering & Hajatan",
    whatsapp: "0812-3456-7890",
    instagram: "@sotobanjar.selera",
    tiktok: "@sotobanjarselera",
    facebook: "Soto Banjar Selera",
    brandName: "Soto Banjar Selera",
    footerDesc:
      "Menyajikan kehangatan resep asli Kalimantan Selatan dengan kebersihan dan kualitas rasa terbaik.",
    deliveryBadge: "Pesan Antar Wilayah Jabodetabek",
    copyright: "© 2026 Soto Banjar Selera Nusantara. All rights reserved.",
  },
};

function readContent(): SiteContentStore {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const parsed = JSON.parse(
        fs.readFileSync(CONTENT_FILE, "utf-8")
      ) as Partial<SiteContentStore>;
      return {
        banner: { ...DEFAULT_SITE_CONTENT.banner, ...(parsed.banner || {}) },
        about: { ...DEFAULT_SITE_CONTENT.about, ...(parsed.about || {}) },
        faq: {
          ...DEFAULT_SITE_CONTENT.faq,
          ...(parsed.faq || {}),
          faqs:
            Array.isArray(parsed.faq?.faqs) && parsed.faq.faqs.length > 0
              ? parsed.faq.faqs
              : DEFAULT_SITE_CONTENT.faq.faqs,
        },
        menuSection: {
          ...DEFAULT_SITE_CONTENT.menuSection,
          ...(parsed.menuSection || {}),
        },
        locationFooter: {
          ...DEFAULT_SITE_CONTENT.locationFooter,
          ...(parsed.locationFooter || {}),
        },
      };
    }
  } catch {
    // Abaikan jika gagal baca
  }
  return DEFAULT_SITE_CONTENT;
}

function writeContent(data: SiteContentStore) {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menulis site-content.json:", err);
  }
}

export async function GET() {
  return NextResponse.json(readContent(), { status: 200 });
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<SiteContentStore>;
    const current = readContent();
    const nextData: SiteContentStore = {
      banner: { ...current.banner, ...(body.banner || {}) },
      about: { ...current.about, ...(body.about || {}) },
      faq: {
        ...current.faq,
        ...(body.faq || {}),
        faqs: Array.isArray(body.faq?.faqs)
          ? body.faq.faqs
          : current.faq.faqs,
      },
      menuSection: { ...current.menuSection, ...(body.menuSection || {}) },
      locationFooter: {
        ...current.locationFooter,
        ...(body.locationFooter || {}),
      },
    };
    writeContent(nextData);
    return NextResponse.json(nextData, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE() {
  writeContent(DEFAULT_SITE_CONTENT);
  return NextResponse.json(DEFAULT_SITE_CONTENT, { status: 200 });
}