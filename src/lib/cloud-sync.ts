import { parsePayload, serializeSchedule } from "@/lib/storage"
import {
  decryptSchedule,
  encryptSchedule,
  isSyncEnvelope,
  syncCodeToId,
  type SyncEnvelope,
} from "@/lib/sync-crypto"
import type { WorkItem } from "@/lib/types"

export const SYNC_CODE_KEY = "work-calendar-2026-2027-sync-code"
export const SYNC_UPDATED_KEY = "work-calendar-2026-2027-updated-at"

type SyncGetResponse = {
  envelope?: SyncEnvelope | null
  error?: string
  code?: string
}

export function loadSavedSyncCode() {
  if (typeof window === "undefined") return null
  const code = window.localStorage.getItem(SYNC_CODE_KEY)
  return code && code.trim().length >= 8 ? code : null
}

export function saveSyncCode(code: string | null) {
  if (typeof window === "undefined") return
  if (code) window.localStorage.setItem(SYNC_CODE_KEY, code)
  else window.localStorage.removeItem(SYNC_CODE_KEY)
}

export function loadLocalUpdatedAt() {
  if (typeof window === "undefined") return 0
  const raw = window.localStorage.getItem(SYNC_UPDATED_KEY)
  const value = raw ? Number(raw) : 0
  return Number.isFinite(value) ? value : 0
}

export function saveLocalUpdatedAt(value: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SYNC_UPDATED_KEY, String(value))
}

export async function pullCloudSchedule(code: string) {
  const id = await syncCodeToId(code)
  const response = await fetch(`/api/sync?id=${id}`, { cache: "no-store" })
  const payload = (await response.json()) as SyncGetResponse
  if (response.status === 503 && payload.code === "not_configured") {
    throw new Error("not_configured")
  }
  if (!response.ok) {
    throw new Error(payload.error || "讀取雲端資料失敗。")
  }
  if (!payload.envelope) return null
  if (!isSyncEnvelope(payload.envelope)) {
    throw new Error("雲端資料格式不正確。")
  }
  try {
    const json = await decryptSchedule(code, payload.envelope)
    return {
      items: parsePayload(json),
      updatedAt: payload.envelope.updatedAt,
    }
  } catch {
    throw new Error("同步碼不正確，或雲端資料無法解碼。")
  }
}

export async function pushCloudSchedule(code: string, items: WorkItem[], updatedAt: number) {
  const id = await syncCodeToId(code)
  const envelope = await encryptSchedule(code, serializeSchedule(items), updatedAt)
  const response = await fetch("/api/sync", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, envelope }),
  })
  const payload = (await response.json()) as { error?: string; code?: string }
  if (response.status === 503 && payload.code === "not_configured") {
    throw new Error("not_configured")
  }
  if (!response.ok) {
    throw new Error(payload.error || "寫入雲端資料失敗。")
  }
}
