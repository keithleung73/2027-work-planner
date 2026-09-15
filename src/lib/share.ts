import { SCHOOL_SITE_URL } from "@/lib/school-calendar"
import { parsePayload, serializeSchedule } from "@/lib/storage"
import type { WorkItem } from "@/lib/types"

const SHARE_PREFIX = "#n="

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ""
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

async function gzipEncode(bytes: Uint8Array) {
  if (typeof CompressionStream === "undefined") return bytes
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new CompressionStream("gzip"))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gzipDecode(bytes: Uint8Array) {
  if (typeof DecompressionStream === "undefined") {
    return new TextDecoder().decode(bytes)
  }
  try {
    const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(
      new DecompressionStream("gzip"),
    )
    return await new Response(stream).text()
  } catch {
    return new TextDecoder().decode(bytes)
  }
}

export async function encodeSharePayload(items: WorkItem[]) {
  const json = serializeSchedule(items)
  const compressed = await gzipEncode(new TextEncoder().encode(json))
  return bytesToBase64Url(compressed)
}

export async function decodeSharePayload(encoded: string) {
  const json = await gzipDecode(base64UrlToBytes(encoded))
  return parsePayload(json)
}

export function shareHashFromLocation() {
  if (typeof window === "undefined") return null
  const hash = window.location.hash
  if (!hash.startsWith(SHARE_PREFIX)) return null
  const encoded = hash.slice(SHARE_PREFIX.length)
  return encoded.length > 0 ? encoded : null
}

export async function buildShareUrl(items: WorkItem[]) {
  const encoded = await encodeSharePayload(items)
  const url = new URL(siteUrl())
  url.hash = `${SHARE_PREFIX.slice(1)}${encoded}`
  return url.toString()
}

export function siteUrl() {
  return SCHOOL_SITE_URL
}

export function isLocalPreview() {
  if (typeof window === "undefined") return false
  const host = window.location.hostname
  return host === "localhost" || host === "127.0.0.1"
}

export function clearShareHash() {
  if (typeof window === "undefined") return
  const url = `${window.location.pathname}${window.location.search}`
  window.history.replaceState(null, "", url)
}
