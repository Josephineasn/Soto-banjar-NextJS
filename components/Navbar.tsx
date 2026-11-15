"use client";

import React, { useState } from "react";

export type CustomerPageTab =
  | "beranda"
  | "menu"
  | "tentang"
  | "ulasan"
  | "faq"
  | "lokasi";

export interface NavbarUser {
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface NavbarProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenHistory?: () => void;
  onOpenAuth?: () => void;
  currentUser?: NavbarUser | null;
  onUpdateUser?: (updatedUser: NavbarUser) => void;
  onLogout?: () => void | Promise<void>;
  activePage?: CustomerPageTab | string;
  onNavigatePage?: (page: CustomerPageTab) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  logoUrl?: string;
}

const NAV_ITEMS: { id: CustomerPageTab; label: string; sectionId: string }[] = [
  { id: "beranda", label: "Beranda", sectionId: "top" },
  { id: "menu", label: "Menu", sectionId: "menu" },
  { id: "tentang", label: "Tentang Kami", sectionId: "tentang-kami" },
  { id: "ulasan", label: "Ulasan", sectionId: "ulasan" },
  { id: "faq", label: "FAQ", sectionId: "faq" },
  { id: "lokasi", label: "Lokasi", sectionId: "lokasi" },
];

export default function Navbar({
  cartCount = 0,
  onOpenCart,
  onOpenHistory,
  onOpenAuth,
  currentUser,
  onUpdateUser,
  onLogout,
  activePage,
  onNavigatePage,
  logoUrl = "/logo.jpeg",
}: NavbarProps) {
  const [internalTab, setInternalTab] = useState<CustomerPageTab>("beranda");
  const [logoError, setLogoError] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>("");

  // State Modal Edit Profil
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>("");

  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string>("");
  const [profileSuccess, setProfileSuccess] = useState<string>("");

  const currentActiveTab = activePage ?? internalTab;
  const displayUserName = editedName || currentUser?.name || "";

  function handleNavClick(item: { id: CustomerPageTab; sectionId: string }) {
    setInternalTab(item.id);

    if (onNavigatePage) {
      onNavigatePage(item.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (item.sectionId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      document
        .getElementById(item.sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }

  async function handleOpenProfileModal() {
    if (!currentUser) return;
    const activeName = displayUserName || currentUser.name;
    setUsernameInput(activeName);
    setEmailInput(currentUser.email || "");
    setNewPasswordInput("");
    setCurrentPasswordInput("");
    setProfileError("");
    setProfileSuccess("");
    setProfileModalOpen(true);

    try {
      const res = await fetch(
        `/api/auth/profile?name=${encodeURIComponent(activeName)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = (await res.json()) as { name?: string; email?: string };
        if (data.name) setUsernameInput(data.name);
        if (data.email !== undefined) setEmailInput(data.email);
      }
    } catch {
      // Abaikan
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!usernameInput.trim()) {
      setProfileError("Username tidak boleh kosong.");
      return;
    }

    if (!currentPasswordInput.trim()) {
      setProfileError(
        "Wajib memasukkan Password Saat Ini untuk mengubah data profil!"
      );
      return;
    }

    if (
      newPasswordInput.trim().length > 0 &&
      newPasswordInput.trim().length < 6
    ) {
      setProfileError("Password baru minimal harus 6 karakter.");
      return;
    }

    setSavingProfile(true);
    try {
      const activeName = displayUserName || currentUser?.name || "";
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentName: activeName,
          currentPassword: currentPasswordInput,
          newName: usernameInput.trim(),
          newEmail: emailInput.trim(),
          newPassword: newPasswordInput.trim(),
        }),
      });

      const result = (await res.json()) as {
        error?: string;
        message?: string;
        user?: NavbarUser;
      };

      if (!res.ok) {
        setProfileError(
          result.error || "Gagal memperbarui profil. Periksa password Anda."
        );
        setSavingProfile(false);
        return;
      }

      const updatedUserObj: NavbarUser = {
        name: result.user?.name || usernameInput.trim(),
        email: result.user?.email || emailInput.trim(),
        role: result.user?.role || currentUser?.role || "CUSTOMER",
      };

      setEditedName(updatedUserObj.name);
      sessionStorage.setItem(
        "soto_active_user",
        JSON.stringify(updatedUserObj)
      );
      onUpdateUser?.(updatedUserObj);

      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setProfileSuccess("Profil akun berhasil diperbarui!");

      setTimeout(() => {
        setProfileModalOpen(false);
        setProfileSuccess("");
      }, 1200);
    } catch {
      setProfileError("Terjadi kesalahan jaringan saat menyimpan profil.");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "#2A1A11",
          borderBottom: "3px solid #6D4C30",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          padding: "14px 24px 10px",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* BARIS ATAS: Logo di Kiri & Tombol Aksi/Profil (Riwayat, Keranjang, Josephine, Keluar) di Pojok Kanan */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Logo Brand */}
            <button
              type="button"
              onClick={() => handleNavClick(NAV_ITEMS[0])}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  backgroundColor: "#EFE3C8",
                  color: "#2A1A11",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "18px",
                  overflow: "hidden",
                  border: "1.5px solid #EFE3C8",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)",
                  flexShrink: 0,
                }}
              >
                {!logoError ? (
                  <img
                    src={logoUrl}
                    alt="Logo Soto Banjar Selera"
                    onError={() => setLogoError(true)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <span>SB</span>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 900,
                    color: "#EFE3C8",
                    lineHeight: 1.1,
                  }}
                >
                  Soto Banjar Selera
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#D5C5B3",
                    letterSpacing: "0.5px",
                  }}
                >
                  SELERA NUSANTARA
                </div>
              </div>
            </button>

            {/* Tombol Aksi Pojok Kanan Atas (Riwayat, Keranjang, Josephine, Keluar) */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                type="button"
                onClick={() => onOpenHistory?.()}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid rgba(239, 227, 200, 0.45)",
                  backgroundColor: "#3B2314",
                  color: "#EFE3C8",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>↺</span>
                <span>Riwayat</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenCart?.()}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "1.5px solid #EFE3C8",
                  backgroundColor: "#EFE3C8",
                  color: "#2A1A11",
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              >
                <span>🛒 Keranjang</span>
                <span
                  style={{
                    backgroundColor: "#2A1A11",
                    color: "#EFE3C8",
                    borderRadius: "20px",
                    padding: "2px 7px",
                    fontSize: "11px",
                    fontWeight: 900,
                  }}
                >
                  {cartCount}
                </span>
              </button>

              {currentUser ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => void handleOpenProfileModal()}
                    title="Klik untuk Edit Profil"
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: "#EFE3C8",
                      backgroundColor: "#3B2314",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid rgba(239, 227, 200, 0.45)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#EFE3C8"
                      stroke="#EFE3C8"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>{displayUserName}</span>
                  </button>

                  {currentUser.role === "ADMIN" && (
                    <a
                      href="/admin"
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        backgroundColor: "#6D4C30",
                        color: "#EFE3C8",
                        fontSize: "12px",
                        fontWeight: 800,
                        textDecoration: "none",
                      }}
                    >
                      Admin
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setEditedName("");
                      void onLogout?.();
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid rgba(254, 202, 202, 0.4)",
                      backgroundColor: "#DC2626",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth?.()}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid #EFE3C8",
                    backgroundColor: "#6D4C30",
                    color: "#EFE3C8",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Masuk / Daftar
                </button>
              )}
            </div>
          </div>

          {/* BARIS BAWAH: Menu Kapsul (Beranda, Menu, dll.) Rata Tengah */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              borderTop: "1px solid rgba(239, 227, 200, 0.15)",
              paddingTop: "10px",
            }}
          >
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = currentActiveTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    style={{
                      padding: "7px 18px",
                      borderRadius: "30px",
                      border: isActive
                        ? "1.5px solid #EFE3C8"
                        : "1.5px solid transparent",
                      backgroundColor: isActive ? "#6D4C30" : "transparent",
                      color: isActive ? "#EFE3C8" : "#FAF6EE",
                      fontSize: "13px",
                      fontWeight: isActive ? 800 : 600,
                      cursor: "pointer",
                      transition: "all 0.22s ease",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* MODAL EDIT PROFIL */}
      {profileModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            zIndex: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
          onClick={() => setProfileModalOpen(false)}
        >
          <form
            onSubmit={handleSaveProfile}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "430px",
              backgroundColor: "#FAF6EE",
              borderRadius: "24px",
              border: "2px solid #D6C7B2",
              padding: "28px 26px",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1.5px solid #E5DEC9",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    backgroundColor: "#2A1A11",
                    color: "#EFE3C8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#EFE3C8"
                    stroke="#EFE3C8"
                    strokeWidth="1.8"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "19px",
                      fontWeight: 900,
                      color: "#2A1A11",
                    }}
                  >
                    Edit Profil Akun
                  </h3>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "12px",
                      color: "#6D4C30",
                    }}
                  >
                    Ubah username, email, atau password Anda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  border: "1px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  color: "#2A1A11",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {profileError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  fontSize: "12.5px",
                  fontWeight: 700,
                }}
              >
                ⚠️ {profileError}
              </div>
            )}

            {profileSuccess && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  backgroundColor: "#DCFCE7",
                  border: "1px solid #86EFAC",
                  color: "#166534",
                  fontSize: "12.5px",
                  fontWeight: 800,
                }}
              >
                ✓ {profileSuccess}
              </div>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  marginBottom: "6px",
                }}
              >
                Username / Nama Akun
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                placeholder="Masukkan username baru"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13.5px",
                  color: "#1E293B",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  marginBottom: "6px",
                }}
              >
                Alamat Email
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="contoh@email.com"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13.5px",
                  color: "#1E293B",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  color: "#2A1A11",
                  marginBottom: "6px",
                }}
              >
                Password Baru{" "}
                <span style={{ fontWeight: 500, color: "#6D4C30" }}>
                  (Kosongkan jika tidak ingin ganti)
                </span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPass ? "text" : "password"}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  style={{
                    width: "100%",
                    padding: "11px 70px 11px 14px",
                    borderRadius: "12px",
                    border: "1.5px solid #D6C7B2",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13.5px",
                    color: "#1E293B",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    color: "#6D4C30",
                    fontSize: "11.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {showNewPass ? "Sembunyi" : "Lihat"}
                </button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#EFE6D5",
                padding: "14px",
                borderRadius: "14px",
                border: "1.5px dashed #8A6B47",
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "12.5px",
                  fontWeight: 900,
                  color: "#2A1A11",
                  marginBottom: "6px",
                }}
              >
                🔒 Password Saat Ini (Wajib untuk Konfirmasi) *
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  required
                  placeholder="Masukkan password Anda yang sekarang"
                  style={{
                    width: "100%",
                    padding: "11px 70px 11px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #8A6B47",
                    backgroundColor: "#FFFFFF",
                    fontSize: "13.5px",
                    color: "#1E293B",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "none",
                    color: "#6D4C30",
                    fontSize: "11.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {showCurrentPass ? "Sembunyi" : "Lihat"}
                </button>
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "11px",
                  color: "#6D4C30",
                  lineHeight: 1.4,
                }}
              >
                Demi keamanan, perubahan username, email, maupun password baru
                hanya disimpan jika password saat ini sesuai.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                disabled={savingProfile}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  color: "#2A1A11",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#2A1A11",
                  color: "#EFE3C8",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}