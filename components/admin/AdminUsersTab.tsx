
"use client";

import { useCallback, useEffect, useState } from "react";

interface AdminUser {
  id: number;
  name: string;
  username: string;
  phone: string;
  createdAt: string;
}

export default function AdminUsersTab() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Mengambil daftar admin
    const loadAdmins = useCallback(async () => {
    try {
        const res = await fetch("/api/admin/users", {
        cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
        throw new Error(
            data.error || "Gagal mengambil data admin."
        );
        }

        setAdmins(data.admins || []);
        setError("");
    } catch (err) {
        setError(
        err instanceof Error
            ? err.message
            : "Terjadi kesalahan."
        );
    } finally {
        setLoading(false);
    }
    }, []);

  useEffect(() => {
  queueMicrotask(() => {
    void loadAdmins();
  });
}, [loadAdmins]);

  // Membuat akun admin baru
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Gagal membuat akun admin."
        );
      }

      setMessage("Akun admin berhasil dibuat!");

      setName("");
      setUsername("");
      setPhone("");
      setPassword("");
      setShowPassword(false);

      await loadAdmins();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* FORM TAMBAH ADMIN */}
      <div className="adm-card">
        <div className="adm-head">
          <div>
            <h3>+ Tambah Admin Baru</h3>
            <p>
              Buat akun baru untuk pengelola website Soto Banjar.
            </p>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: 12,
              background: "#DCFCE7",
              color: "#166534",
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div className="adm-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="adm-row2">
            <label className="adm-field">
              <span className="h">Nama Lengkap</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                minLength={2}
                maxLength={60}
                required
              />
            </label>

            <label className="adm-field">
              <span className="h">Username</span>
              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/\s/g, "")
                  )
                }
                placeholder="Contoh: admin_kedua"
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9_.]{3,20}"
                required
              />
            </label>
          </div>

          <div className="adm-row2">
            <label className="adm-field">
              <span className="h">Nomor HP</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                maxLength={16}
              />
            </label>

            <label className="adm-field">
              <span className="h">Password</span>

              <div className="adm-pw">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  maxLength={100}
                  required
                  style={{ paddingRight: 65 }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="adm-btn"
            disabled={submitting}
          >
            {submitting
              ? "Membuat akun..."
              : "+ Buat Akun Admin"}
          </button>
        </form>
      </div>

      {/* DAFTAR ADMIN */}
      <div className="adm-card" style={{ marginTop: 20 }}>
        <div className="adm-head">
          <div>
            <h3>Daftar Admin</h3>
            <p>
              Daftar seluruh akun yang memiliki akses admin.
            </p>
          </div>

          <button
            type="button"
            className="adm-btn out sm"
            onClick={() => void loadAdmins()}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="adm-loading">
            Memuat daftar admin...
          </div>
        ) : admins.length === 0 ? (
          <div className="adm-tablewrap">
            <div className="adm-table empty">
              Belum ada akun admin.
            </div>
          </div>
        ) : (
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nama Admin</th>
                  <th>Username</th>
                  <th>Nomor HP</th>
                  <th>Tanggal Dibuat</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin, index) => (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{admin.name}</strong>
                    </td>
                    <td>@{admin.username}</td>
                    <td>{admin.phone || "-"}</td>
                    <td>
                      {new Date(
                        admin.createdAt
                      ).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td>
                      <span
                        className="adm-badge"
                        style={{ background: "#166534" }}
                      >
                        ADMIN
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
