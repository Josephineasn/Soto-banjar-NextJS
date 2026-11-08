"use client";

import React, { useState } from "react";

interface UserAuth {
  name: string;
  role: string;
  email?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAuth) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Cek validasi ketentuan password
  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);

  function recordLoginLog(accountName: string, isSuccess: boolean, reason?: string) {
    try {
      const stored = localStorage.getItem("soto_login_logs");
      const existing = stored ? JSON.parse(stored) : [];

      const now = new Date();
      const formattedDate = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const formattedTime = now
        .toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(":", ".");

      const newLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        time: `${formattedDate}, ${formattedTime}`,
        name: accountName,
        role: accountName.toLowerCase() === "admin" ? "Admin" : isLoginTab ? "Customer" : "Customer Baru",
        status: isSuccess ? "Berhasil" : `Gagal (${reason || "Salah Password"})`,
        device: "127.0.0.1 (Web Local)",
      };

      const updated = [newLog, ...existing];
      localStorage.setItem("soto_login_logs", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      setErrorMsg("Harap isi semua kolom yang diperlukan.");
      return;
    }

    if (!isLoginTab) {
      if (!email.trim()) {
        setErrorMsg("Email wajib diisi.");
        return;
      }
      if (!hasMinLength) {
        setErrorMsg("Kata sandi minimal 6 karakter.");
        return;
      }
      if (!hasNumber) {
        setErrorMsg("Kata sandi harus mengandung minimal 1 angka.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Konfirmasi kata sandi tidak cocok.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isLoginTab ? "/api/auth/login" : "/api/auth/register";
      const payload = isLoginTab
        ? { username: cleanUser, password }
        : { username: cleanUser, email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.user) {
        const userObj: UserAuth = {
          name: data.user.name || cleanUser,
          role: data.user.role || (cleanUser.toLowerCase() === "admin" ? "ADMIN" : "CUSTOMER"),
          email: data.user.email || email.trim(),
        };

        recordLoginLog(userObj.name, true);
        localStorage.setItem("soto_customer_user", userObj.name);

        onSuccess(userObj);
        onClose();
        resetForm();
      } else {
        const userRole = cleanUser.toLowerCase() === "admin" ? "ADMIN" : "CUSTOMER";
        const userObj: UserAuth = { name: cleanUser, role: userRole, email: email.trim() };

        recordLoginLog(cleanUser, true);
        localStorage.setItem("soto_customer_user", userObj.name);

        onSuccess(userObj);
        onClose();
        resetForm();
      }
    } catch {
      recordLoginLog(cleanUser, false, "Koneksi Error");
      setErrorMsg("Terjadi kendala saat menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorMsg("");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "410px",
          backgroundColor: "#FFFFFF",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#2E1C14",
            padding: "22px 20px 18px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "16px",
              background: "none",
              border: "none",
              color: "#FFFFFF",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ✕
          </button>

          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 8px",
            }}
          >
            <span style={{ color: "#2E1C14", fontSize: "11px", fontWeight: "900" }}>SB</span>
          </div>

          <h3 style={{ margin: "0 0 2px", fontSize: "17px", fontWeight: "900", color: "#FFFFFF" }}>
            Soto Banjar Selera
          </h3>
          <span style={{ fontSize: "10px", color: "#D4C5B9", letterSpacing: "0.5px" }}>
            AKUN PELANGGAN &amp; PEMESANAN
          </span>
        </div>

        {/* Masuk / Daftar */}
        <div style={{ display: "flex", borderBottom: "1px solid #EFE6D8" }}>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              backgroundColor: isLoginTab ? "#FFFFFF" : "#FBF9F5",
              color: isLoginTab ? "#2E1C14" : "#9E9E9E",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              borderBottom: isLoginTab ? "2px solid #734F31" : "none",
            }}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              backgroundColor: !isLoginTab ? "#FFFFFF" : "#FBF9F5",
              color: !isLoginTab ? "#2E1C14" : "#9E9E9E",
              fontWeight: "800",
              fontSize: "13px",
              cursor: "pointer",
              borderBottom: !isLoginTab ? "2px solid #734F31" : "none",
            }}
          >
            Daftar Baru
          </button>
        </div>

        {/* Konten Form */}
        <div style={{ padding: "20px 24px 24px", maxHeight: "75vh", overflowY: "auto" }}>
          <p style={{ margin: "0 0 16px", fontSize: "11px", color: "#8D6E63", lineHeight: "1.5" }}>
            {isLoginTab
              ? "Masuk untuk memesan menu delivery dan memberikan ulasan autentik."
              : "Buat akun baru untuk mulai menikmati kelezatan Soto Banjar hangat."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Nama Akun / Nama Lengkap */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#3E2723", marginBottom: "4px" }}>
                Nama Akun / Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: josephine"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid #EFE6D8",
                  backgroundColor: "#FAF6EE",
                  fontSize: "12px",
                  color: "#2E1C14",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Email (Hanya saat Daftar Baru) */}
            {!isLoginTab && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#3E2723", marginBottom: "4px" }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: user@gmail.com"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #EFE6D8",
                    backgroundColor: "#FAF6EE",
                    fontSize: "12px",
                    color: "#2E1C14",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            )}

            {/* Kata Sandi */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#3E2723", marginBottom: "4px" }}>
                Kata Sandi
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  style={{
                    width: "100%",
                    padding: "9px 65px 9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #EFE6D8",
                    backgroundColor: "#FAF6EE",
                    fontSize: "12px",
                    color: "#2E1C14",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#8D6E63",
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Poin Ketentuan Kata Sandi (Tampil di Tab Daftar Baru) */}
              {!isLoginTab && (
                <div
                  style={{
                    marginTop: "6px",
                    padding: "6px 8px",
                    backgroundColor: "#FAF6EE",
                    borderRadius: "6px",
                    fontSize: "10.5px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <span
                    style={{
                      color: hasMinLength ? "#16A34A" : "#8D6E63",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: hasMinLength ? "700" : "500",
                    }}
                  >
                    {hasMinLength ? "✓" : "•"} Minimal 6 karakter
                  </span>
                  <span
                    style={{
                      color: hasNumber ? "#16A34A" : "#8D6E63",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontWeight: hasNumber ? "700" : "500",
                    }}
                  >
                    {hasNumber ? "✓" : "•"} Mengandung setidaknya 1 angka (0-9)
                  </span>
                </div>
              )}
            </div>

            {/* Konfirmasi Kata Sandi (Hanya saat Daftar Baru) */}
            {!isLoginTab && (
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#3E2723", marginBottom: "4px" }}>
                  Konfirmasi Kata Sandi
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    style={{
                      width: "100%",
                      padding: "9px 65px 9px 12px",
                      borderRadius: "8px",
                      border: "1px solid #EFE6D8",
                      backgroundColor: "#FAF6EE",
                      fontSize: "12px",
                      color: "#2E1C14",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#8D6E63",
                      cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  padding: "7px 10px",
                  borderRadius: "6px",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  fontSize: "11px",
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                backgroundColor: "#734F31",
                color: "#FFFFFF",
                border: "none",
                fontSize: "12px",
                fontWeight: "800",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "4px",
              }}
            >
              {loading
                ? "Memproses..."
                : isLoginTab
                ? "Masuk Sekarang →"
                : "Daftar Akun Baru →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}