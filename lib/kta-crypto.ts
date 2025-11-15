// lib/kta-crypto.ts
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  createHash,
} from "crypto";

/** gunakan SECRET dari env; default dev-only */
const RAW_SECRET = process.env.KTA_URL_SECRET ?? "dev-only-secret-change-me";

/** key 32 byte untuk AES-256-GCM */
const KEY = createHash("sha256").update(RAW_SECRET, "utf8").digest(); // 32 bytes
const ALGO = "aes-256-gcm";

/** base64url <-> buffer helpers */
function b64urlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}
function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  return Buffer.from(b64, "base64");
}

/** Enkripsi id menjadi token base64url (IV|TAG|CIPHERTEXT) */
export function encryptId(id: string): string {
  const iv = randomBytes(12); // GCM nonce
  const cipher = createCipheriv(ALGO, KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(id, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return b64urlEncode(Buffer.concat([iv, tag, ciphertext]));
}

/** Dekripsi token menjadi id */
export function decryptToken(
  token: string
): { ok: true; id: string } | { ok: false; error: "TOKEN_INVALID" } {
  try {
    const buf = b64urlDecode(token);
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ciphertext = buf.subarray(28);
    const decipher = createDecipheriv(ALGO, KEY, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    return { ok: true, id: plain.toString("utf8") };
  } catch {
    return { ok: false, error: "TOKEN_INVALID" };
  }
}