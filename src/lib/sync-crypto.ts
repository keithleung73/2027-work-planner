const CODE_PREFIX = "mkpc-2026-2027:"
const PBKDF2_ITERATIONS = 120_000

export type SyncEnvelope = {
  v: 1
  updatedAt: number
  salt: string
  iv: string
  ciphertext: string
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export function normalizeSyncCode(code: string) {
  return code.trim().replace(/\s+/g, " ")
}

export function isValidSyncCode(code: string) {
  return normalizeSyncCode(code).length >= 8
}

export function generateSyncCode() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  let body = ""
  for (const byte of bytes) body += alphabet[byte % alphabet.length]
  return `mkpc-${body.slice(0, 4)}-${body.slice(4)}`
}

export async function syncCodeToId(code: string) {
  const normalized = normalizeSyncCode(code)
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${CODE_PREFIX}${normalized}`),
  )
  return bytesToHex(new Uint8Array(digest))
}

async function deriveKey(code: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(normalizeSyncCode(code)),
    "PBKDF2",
    false,
    ["deriveKey"],
  )
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  )
}

export async function encryptSchedule(code: string, json: string, updatedAt: number): Promise<SyncEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(code, salt)
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    new TextEncoder().encode(json),
  )
  return {
    v: 1,
    updatedAt,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  }
}

export async function decryptSchedule(code: string, envelope: SyncEnvelope) {
  const salt = base64ToBytes(envelope.salt)
  const iv = base64ToBytes(envelope.iv)
  const key = await deriveKey(code, salt)
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(base64ToBytes(envelope.ciphertext)),
  )
  return new TextDecoder().decode(decrypted)
}

export function isSyncEnvelope(value: unknown): value is SyncEnvelope {
  if (!value || typeof value !== "object") return false
  const raw = value as Record<string, unknown>
  return (
    raw.v === 1 &&
    typeof raw.updatedAt === "number" &&
    typeof raw.salt === "string" &&
    typeof raw.iv === "string" &&
    typeof raw.ciphertext === "string"
  )
}
