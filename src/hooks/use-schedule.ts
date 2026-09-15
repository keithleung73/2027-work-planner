"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { compareItemsByTime } from "@/lib/calendar"
import {
  loadSavedSyncCode,
  loadLocalUpdatedAt,
  pullCloudSchedule,
  pushCloudSchedule,
  saveLocalUpdatedAt,
  saveSyncCode,
} from "@/lib/cloud-sync"
import {
  createId,
  loadSchedule,
  parsePayload,
  saveSchedule,
  serializeSchedule,
} from "@/lib/storage"
import { generateSyncCode, isValidSyncCode, normalizeSyncCode } from "@/lib/sync-crypto"
import type { WorkItem } from "@/lib/types"

type ScheduleState = {
  items: WorkItem[]
  error: string | null
  saveError: string | null
}

type CloudStatus = "off" | "connecting" | "on" | "error"

export type CloudSyncState = {
  code: string | null
  status: CloudStatus
  message: string | null
  lastSyncedAt: number | null
}

const emptyState: ScheduleState = {
  items: [],
  error: null,
  saveError: null,
}

const NOT_CONFIGURED =
  "正式網站尚未開啟雲端同步儲存。請在 Vercel 專案新增 SYNC_TOKEN（GitHub token，勾選 gist），或建立 KV 資料庫後重新部署。"

function cloudMessage(error: unknown) {
  const text = error instanceof Error ? error.message : ""
  if (text === "not_configured") return NOT_CONFIGURED
  return text || "雲端同步失敗。"
}

export function useSchedule() {
  const [state, setState] = useState<ScheduleState>(emptyState)
  const [ready, setReady] = useState(false)
  const [cloud, setCloud] = useState<CloudSyncState>({
    code: null,
    status: "off",
    message: null,
    lastSyncedAt: null,
  })

  const itemsRef = useRef<WorkItem[]>([])
  const codeRef = useRef<string | null>(null)
  const updatedAtRef = useRef(0)
  const skipPushRef = useRef(false)
  const pushTimer = useRef<number | null>(null)

  itemsRef.current = state.items

  const persist = useCallback((items: WorkItem[], error: string | null = null, sync = true) => {
    let saveError: string | null = null
    try {
      saveSchedule(items)
    } catch {
      saveError = "無法寫入本機儲存。瀏覽器可能停用了 localStorage，或空間已滿。"
    }
    const updatedAt = Date.now()
    updatedAtRef.current = updatedAt
    saveLocalUpdatedAt(updatedAt)
    setState({ items, error, saveError })
    if (sync && codeRef.current && !skipPushRef.current) {
      if (pushTimer.current) window.clearTimeout(pushTimer.current)
      const code = codeRef.current
      pushTimer.current = window.setTimeout(() => {
        void pushCloudSchedule(code, items, updatedAt)
          .then(() => {
            setCloud((current) =>
              current.code
                ? { ...current, status: "on", message: null, lastSyncedAt: updatedAt }
                : current,
            )
          })
          .catch((caught) => {
            setCloud((current) =>
              current.code
                ? { ...current, status: "error", message: cloudMessage(caught) }
                : current,
            )
          })
      }, 800)
    }
  }, [])

  const pullRemote = useCallback(async (code: string, localItems: WorkItem[]) => {
    const remote = await pullCloudSchedule(code)
    const localUpdatedAt = updatedAtRef.current
    if (!remote) {
      if (localItems.length > 0) {
        await pushCloudSchedule(code, localItems, localUpdatedAt || Date.now())
      }
      return
    }
    if (remote.updatedAt >= localUpdatedAt || localItems.length === 0) {
      skipPushRef.current = true
      try {
        saveSchedule(remote.items)
      } catch {
        throw new Error("無法把雲端資料寫入本機。")
      }
      updatedAtRef.current = remote.updatedAt
      saveLocalUpdatedAt(remote.updatedAt)
      setState({ items: remote.items, error: null, saveError: null })
      skipPushRef.current = false
      return
    }
    await pushCloudSchedule(code, localItems, localUpdatedAt || Date.now())
  }, [])

  useEffect(() => {
    const loaded = loadSchedule()
    updatedAtRef.current = loadLocalUpdatedAt()
    const savedCode = loadSavedSyncCode()
    setState({
      items: loaded.items,
      error: loaded.error,
      saveError: null,
    })
    setReady(true)
    if (!savedCode) return
    codeRef.current = savedCode
    setCloud({ code: savedCode, status: "connecting", message: null, lastSyncedAt: null })
    void pullRemote(savedCode, loaded.items)
      .then(() => {
        setCloud({
          code: savedCode,
          status: "on",
          message: null,
          lastSyncedAt: Date.now(),
        })
      })
      .catch((error) => {
        setCloud({
          code: savedCode,
          status: "error",
          message: cloudMessage(error),
          lastSyncedAt: null,
        })
      })
  }, [pullRemote])

  useEffect(() => {
    function refresh() {
      const code = codeRef.current
      if (!code || document.visibilityState === "hidden") return
      void pullRemote(code, itemsRef.current)
        .then(() => {
          setCloud((current) =>
            current.code ? { ...current, status: "on", message: null, lastSyncedAt: Date.now() } : current,
          )
        })
        .catch((error) => {
          setCloud((current) =>
            current.code ? { ...current, status: "error", message: cloudMessage(error) } : current,
          )
        })
    }
    window.addEventListener("focus", refresh)
    document.addEventListener("visibilitychange", refresh)
    const timer = window.setInterval(refresh, 45000)
    return () => {
      window.removeEventListener("focus", refresh)
      document.removeEventListener("visibilitychange", refresh)
      window.clearInterval(timer)
      if (pushTimer.current) window.clearTimeout(pushTimer.current)
    }
  }, [pullRemote])

  const enableCloud = useCallback(
    async (rawCode: string) => {
      const code = normalizeSyncCode(rawCode)
      if (!isValidSyncCode(code)) {
        throw new Error("同步碼至少 8 個字。")
      }
      codeRef.current = code
      saveSyncCode(code)
      setCloud({ code, status: "connecting", message: null, lastSyncedAt: null })
      await pullRemote(code, itemsRef.current)
      setCloud({ code, status: "on", message: null, lastSyncedAt: Date.now() })
    },
    [pullRemote],
  )

  const disableCloud = useCallback(() => {
    codeRef.current = null
    saveSyncCode(null)
    if (pushTimer.current) window.clearTimeout(pushTimer.current)
    setCloud({ code: null, status: "off", message: null, lastSyncedAt: null })
  }, [])

  const upsert = useCallback(
    (item: Omit<WorkItem, "id"> & { id?: string }) => {
      const id = item.id ?? createId()
      const nextItem: WorkItem = { ...item, id, title: item.title.trim() }
      persist(
        state.items.some((existing) => existing.id === id)
          ? state.items.map((existing) => (existing.id === id ? nextItem : existing))
          : [...state.items, nextItem],
      )
      return id
    },
    [persist, state.items],
  )

  const remove = useCallback(
    (id: string) => {
      persist(state.items.filter((item) => item.id !== id))
    },
    [persist, state.items],
  )

  const clearAll = useCallback(() => {
    persist([], null)
  }, [persist])

  const importJson = useCallback(
    (raw: string) => {
      const next = parsePayload(raw)
      persist(next, null)
      return next.length
    },
    [persist],
  )

  const exportJson = useCallback(() => serializeSchedule(state.items), [state.items])

  const byDate = useMemo(() => {
    const map = new Map<string, WorkItem[]>()
    for (const item of state.items) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    for (const list of map.values()) {
      list.sort(compareItemsByTime)
    }
    return map
  }, [state.items])

  const sorted = useMemo(() => {
    return [...state.items].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return compareItemsByTime(a, b)
    })
  }, [state.items])

  return {
    items: sorted,
    byDate,
    ready,
    error: state.error,
    saveError: state.saveError,
    upsert,
    remove,
    clearAll,
    importJson,
    exportJson,
    cloud,
    enableCloud,
    disableCloud,
    generateSyncCode,
  }
}
