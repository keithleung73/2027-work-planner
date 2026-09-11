import { CATEGORIES, type SchedulePayload, type WorkItem } from "@/lib/types"
import { isKeyInRange } from "@/lib/calendar"

export const STORAGE_KEY = "work-calendar-2026-2027"

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function emptyItem(date: string): Omit<WorkItem, "id"> {
  return {
    date,
    title: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
    category: "task",
  }
}

function isCategory(value: unknown): value is WorkItem["category"] {
  return typeof value === "string" && CATEGORIES.includes(value as WorkItem["category"])
}

function sanitizeItem(value: unknown): WorkItem | null {
  if (!value || typeof value !== "object") return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== "string" || raw.id.trim().length === 0) return null
  if (typeof raw.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(raw.date)) return null
  if (!isKeyInRange(raw.date)) return null
  if (typeof raw.title !== "string") return null
  const title = raw.title.trim()
  if (title.length === 0) return null

  return {
    id: raw.id,
    date: raw.date,
    title,
    startTime: typeof raw.startTime === "string" ? raw.startTime : "",
    endTime: typeof raw.endTime === "string" ? raw.endTime : "",
    location: typeof raw.location === "string" ? raw.location : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    category: isCategory(raw.category) ? raw.category : "other",
  }
}

export function parsePayload(raw: string): WorkItem[] {
  const parsed = JSON.parse(raw) as unknown
  if (Array.isArray(parsed)) {
    return parsed.map(sanitizeItem).filter((item): item is WorkItem => item !== null)
  }
  if (!parsed || typeof parsed !== "object") {
    throw new Error("格式不正確")
  }
  const payload = parsed as Partial<SchedulePayload>
  if (!Array.isArray(payload.items)) {
    throw new Error("找不到工作安排資料")
  }
  return payload.items
    .map(sanitizeItem)
    .filter((item): item is WorkItem => item !== null)
}

export function loadSchedule(): { items: WorkItem[]; error: string | null } {
  if (typeof window === "undefined") {
    return { items: [], error: null }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], error: null }
    return { items: parsePayload(raw), error: null }
  } catch {
    return {
      items: [],
      error: "本機資料讀取失敗，可能已毀損。你可以清除後重新開始，或先匯出備份。",
    }
  }
}

export function saveSchedule(items: WorkItem[]) {
  const payload: SchedulePayload = { version: 1, items }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function serializeSchedule(items: WorkItem[]) {
  const payload: SchedulePayload = { version: 1, items }
  return JSON.stringify(payload, null, 2)
}
