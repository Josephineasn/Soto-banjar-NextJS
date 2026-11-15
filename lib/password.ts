import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Cek apakah string password di database sudah terenkripsi (hash) atau masih teks biasa
export function isPasswordHashed(storedPassword: string): boolean {
  return storedPassword.startsWith("$s2$");
}

// Ubah password asli (misal: "josephine123") menjadi huruf & angka acak untuk disimpan di Prisma
export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(plainPassword, salt, 32).toString("hex");
  return `$s2$${salt}$${derivedKey}`;
}

// Cocokkan password yang diketik customer saat login dengan kode acak di Prisma
export function verifyPassword(
  inputPassword: string,
  storedPassword: string
): boolean {
  if (!storedPassword) return false;

  // Jika di database sudah berupa kode acak ($s2$...)
  if (isPasswordHashed(storedPassword)) {
    const parts = storedPassword.split("$");
    const salt = parts[2];
    const keyHex = parts[3];
    if (!salt || !keyHex) return false;

    const keyBuffer = Buffer.from(keyHex, "hex");
    const derivedBuffer = scryptSync(inputPassword, salt, 32);

    if (keyBuffer.length !== derivedBuffer.length) return false;
    return timingSafeEqual(keyBuffer, derivedBuffer);
  }

  // Fallback untuk akun lama yang masih teks biasa (sebelum otomatis di-upgrade ke hash)
  return inputPassword === storedPassword;
}