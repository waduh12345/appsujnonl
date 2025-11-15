import { webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;
const te = new TextEncoder();
const td = new TextDecoder();

function b64urlEncode(bytes: Uint8Array): string {
  // Node friendly
  return Buffer.from(bytes).toString("base64url");
}
function b64urlDecode(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64url"));
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const hash = await subtle.digest("SHA-256", te.encode(secret));
  return subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/** Enkripsi -> token base64url(iv | ctTag) */
export async function encryptKtaToken(
  plain: string,
  secret: string
): Promise<string> {
  const key = await deriveKey(secret);
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const enc = await subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    te.encode(plain)
  );
  const ctTag = new Uint8Array(enc as ArrayBuffer);

  const out = new Uint8Array(iv.length + ctTag.length);
  out.set(iv, 0);
  out.set(ctTag, iv.length);

  return b64urlEncode(out);
}

/** Dekripsi token base64url(iv | ctTag) -> plain string */
export async function decryptKtaToken(
  token: string,
  secret: string
): Promise<string> {
  const all = b64urlDecode(token);
  if (all.length < 13) throw new Error("bad-token");

  const iv = all.slice(0, 12);
  const ctTag = all.slice(12);

  const key = await deriveKey(secret);
  const dec = await subtle.decrypt({ name: "AES-GCM", iv }, key, ctTag);
  return td.decode(dec);
}