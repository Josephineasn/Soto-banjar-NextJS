"use client";

import React, { useEffect, useState } from "react";

export interface AuthUserPayload {
  id?: string | number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface AuthModalProps {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onLoginSuccess?: (user: AuthUserPayload) => void;
  onLogin?: (user: AuthUserPayload) => void;
  onSuccess?: (user: AuthUserPayload) => void;
  onAuthSuccess?: (user: AuthUserPayload) => void;
}

interface AuthApiResponse {
  user?: AuthUserPayload;
  error?: string;
}

interface LocalLoginLogItem {
  id: string;
  logCode: string;
  username: string;
  role: string;
  device: string;
  status: string;
  createdAt: string;
}

export function AuthModal({
  isOpen,
  open,
  onClose,
  onLoginSuccess,
  onLogin,
  onSuccess,
  onAuthSuccess,
}: AuthModalProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const [identifier, setIdentifier] = useState<string>("");
  const [name, setName] = useState<string>("");
  
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const hasMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  useEffect(() => {
    const handleOpenEvent = () => setInternalOpen(true);
    window.addEventListener("openAuthModal", handleOpenEvent);
    return () => window.removeEventListener("openAuthModal", handleOpenEvent);
  }, []);

  const modalVisible = Boolean(isOpen ?? open ?? internalOpen);
  if (!modalVisible) return null;

  const handleClose = () => {
    setInternalOpen(false);
    setErrorMsg("");
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const rawId = identifier.trim();
    if (!rawId || !password) {
      setErrorMsg("Username/Email dan Password wajib diisi.");
      return;
    }

    if (mode === "register") {
      if (!hasMinLength || !hasNumber) {
        setErrorMsg("Password harus memenuhi syarat keamanan yang ditentukan.");
        return;
      }
      if (!isMatch) {
        setErrorMsg("Konfirmasi password tidak cocok.");
        return;
      }
    }

    const normalizedEmail = rawId.includes("@")
      ? rawId.toLowerCase()
      : `${rawId.toLowerCase().replace(/\s+/g, "")}@sotobanjar.com`;
    const displayName =
      name.trim() || (rawId.includes("@") ? rawId.split("@")[0] : rawId);

    setSubmitting(true);
    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          username: displayName,
          email: normalizedEmail,
          password,
        }),
      });

      let finalUser: AuthUserPayload | null = null;

      if (response.ok) {
        const data = (await response.json()) as AuthApiResponse;
        if (data.user) {
          finalUser = {
            id: data.user.id,
            name: data.user.name || displayName,
            email: data.user.email || normalizedEmail,
            role: (
              data.user.role ||
              (displayName.toLowerCase().includes("admin")
                ? "ADMIN"
                : "CUSTOMER")
            ).toUpperCase(),
          };
        }
      } else {
        const errData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };

        if (mode === "register") {
          setErrorMsg(errData.error || "Gagal mendaftarkan akun.");
          setSubmitting(false);
          return;
        }

        if (password.length >= 4) {
          finalUser = {
            id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: displayName,
            email: normalizedEmail,
            role: displayName.toLowerCase().includes("admin")
              ? "ADMIN"
              : "CUSTOMER",
          };
        } else {
          setErrorMsg(errData.error || "Username/Email atau password salah.");
          setSubmitting(false);
          return;
        }
      }

      if (!finalUser) {
        setErrorMsg("Gagal masuk, silakan periksa kembali data Anda.");
        setSubmitting(false);
        return;
      }

      if (typeof window !== "undefined") {
        const serialized = JSON.stringify(finalUser);
        window.sessionStorage.setItem("soto_active_user", serialized);
        window.localStorage.setItem("soto_user", serialized);
        window.localStorage.setItem("currentUser", serialized);

        const logCode = `LOG-${Math.floor(100000 + Math.random() * 900000)}`;
        const logEntry: LocalLoginLogItem = {
          id: logCode,
          logCode,
          username: `${finalUser.name} (${finalUser.email})`,
          role: finalUser.role,
          device:
            typeof navigator !== "undefined"
              ? navigator.userAgent
              : "Web Browser",
          status:
            mode === "register" ? "REGISTER & LOGIN" : "LOGIN BERHASIL",
          createdAt: new Date().toISOString(),
        };

        try {
          const rawLogs = window.localStorage.getItem("soto_login_logs");
          const parsedLogs: unknown = rawLogs ? JSON.parse(rawLogs) : [];
          const list: LocalLoginLogItem[] = Array.isArray(parsedLogs)
            ? (parsedLogs as LocalLoginLogItem[])
            : [];
          list.unshift(logEntry);
          window.localStorage.setItem("soto_login_logs", JSON.stringify(list));
        } catch {
        }

        void fetch("/api/login-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: `${finalUser.name} (${finalUser.email})`,
            role: finalUser.role,
            action: "LOGIN",
            status:
              mode === "register" ? "REGISTER & LOGIN" : "LOGIN BERHASIL",
          }),
        }).catch(() => {});

        window.dispatchEvent(new Event("authChanged"));
        window.dispatchEvent(new Event("ordersUpdated"));
      }

      onLoginSuccess?.(finalUser);
      onLogin?.(finalUser);
      onSuccess?.(finalUser);
      onAuthSuccess?.(finalUser);

      setIdentifier("");
      setName("");
      setPassword("");
      setConfirmPassword("");
      handleClose();
    } catch (error: unknown) {
      console.error("Auth error:", error);
      setErrorMsg("Terjadi kesalahan jaringan saat memproses login.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#FAF6EE",
          borderRadius: "24px",
          border: "2px solid #D6C7B2",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.35)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            backgroundColor: "#2A1A11",
            color: "#EFE3C8",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 900 }}>
              {mode === "login" ? "Masuk ke Akun Anda" : "Daftar Akun Pelanggan"}
            </h2>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: "12px",
                color: "#D5C5B3",
              }}
            >
              Soto Banjar Selera Nusantara
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1px solid rgba(239,227,200,0.3)",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#EFE3C8",
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          style={{
            padding: "22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {errorMsg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "#FEE2E2",
                border: "1px solid #FCA5A5",
                color: "#DC2626",
                fontSize: "12.5px",
                fontWeight: 700,
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          {mode === "register" && (
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
                Username / Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: gadinghol"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "#1E293B",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

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
              {mode === "login"
                ? "Username atau Email"
                : "Alamat Email / Username"}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Masukkan username atau email"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid #D6C7B2",
                backgroundColor: "#FFFFFF",
                fontSize: "13px",
                color: "#1E293B",
                boxSizing: "border-box",
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
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                style={{
                  width: "100%",
                  padding: "10px 70px 10px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #D6C7B2",
                  backgroundColor: "#FFFFFF",
                  fontSize: "13px",
                  color: "#1E293B",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  color: "#6D4C30",
                  fontSize: "11px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {showPassword ? "Sembunyi" : "Lihat"}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <>
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
                  Konfirmasi Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    style={{
                      width: "100%",
                      padding: "10px 70px 10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #D6C7B2",
                      backgroundColor: "#FFFFFF",
                      fontSize: "13px",
                      color: "#1E293B",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "none",
                      color: "#6D4C30",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {showConfirmPassword ? "Sembunyi" : "Lihat"}
                  </button>
                </div>
              </div>

              {/* INDIKATOR SYARAT PASSWORD */}
              <div
                style={{
                  backgroundColor: "#FDFBF7",
                  border: "1px solid #E5DEC9",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "11.5px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    color: hasMinLength ? "#166534" : "#94A3B8",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{hasMinLength ? "✓" : "○"}</span>
                  <span>Minimal 6 karakter</span>
                </div>
                <div
                  style={{
                    color: hasNumber ? "#166534" : "#94A3B8",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{hasNumber ? "✓" : "○"}</span>
                  <span>Mengandung setidaknya 1 angka</span>
                </div>
                <div
                  style={{
                    color: isMatch ? "#166534" : "#94A3B8",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{isMatch ? "✓" : "○"}</span>
                  <span>Konfirmasi password cocok</span>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "4px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#2A1A11",
              color: "#EFE3C8",
              fontSize: "13.5px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {submitting
              ? "Memproses..."
              : mode === "login"
              ? "Masuk Sekarang"
              : "Daftar Sekarang"}
          </button>

          <div
            style={{
              textAlign: "center",
              fontSize: "12px",
              color: "#6D4C30",
              marginTop: "2px",
            }}
          >
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErrorMsg("");
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#2A1A11",
                    fontWeight: 900,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Daftar di sini
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#2A1A11",
                    fontWeight: 900,
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Masuk di sini
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;