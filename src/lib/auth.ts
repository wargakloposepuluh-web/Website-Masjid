// Web Crypto API based Authentication & Session Module
// Compatible with both Node.js and Next.js Edge Runtime (middleware)

const SECRET_KEY = process.env.SESSION_SECRET || "masjid-baitul-maghfirah-secret-session-key-2026";
export const AUTH_COOKIE_NAME = "masjid_session";
export const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function base64UrlEncode(str: string): string {
  if (typeof btoa === "function") {
    return btoa(str)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof atob === "function") {
    return atob(base64);
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = bytesToHex(salt);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    textToBytes(password) as unknown as BufferSource,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const hashHex = bytesToHex(new Uint8Array(derivedBits));
  return saltHex + ":" + hashHex;
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) return false;

    const salt = hexToBytes(saltHex);
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      textToBytes(password) as unknown as BufferSource,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const checkHashHex = bytesToHex(new Uint8Array(derivedBits));
    return checkHashHex === hashHex;
  } catch (err) {
    console.error("Error verifying password:", err);
    return false;
  }
}

export interface SessionPayload {
  userId: number;
  username: string;
  nama: string;
  role: "SUPER_ADMIN" | "ADMIN_SURAT" | "ADMIN_KEUANGAN" | "ADMIN_IBADAH";
  exp: number;
}

export async function createSessionToken(user: {
  id: number;
  username: string;
  nama: string;
  role: string;
}): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    nama: user.nama,
    role: user.role as any,
    exp,
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);

  const key = await crypto.subtle.importKey(
    "raw",
    textToBytes(SECRET_KEY) as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textToBytes(encodedPayload) as unknown as BufferSource
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...Array.from(new Uint8Array(signature)))
  );

  return encodedPayload + "." + encodedSignature;
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, encodedSignature] = parts;

    const key = await crypto.subtle.importKey(
      "raw",
      textToBytes(SECRET_KEY) as unknown as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigString = base64UrlDecode(encodedSignature);
    const sigBytes = new Uint8Array(sigString.length);
    for (let i = 0; i < sigString.length; i++) {
      sigBytes[i] = sigString.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      textToBytes(encodedPayload) as unknown as BufferSource
    );

    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(
      base64UrlDecode(encodedPayload)
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
