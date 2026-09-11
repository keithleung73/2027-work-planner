"use client"

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react"
import { compareItemsByTime } from "@/lib/calendar"
import {
  createId,
  loadSchedule,
  parsePayload,
  saveSchedule,
  serializeSchedule,
} from "@/lib/storage"
import type { WorkItem } from "@/lib/types"

type StoreState = {
  items: WorkItem[]
  error: string | null
  saveError: string | null
  ready: boolean
}

const emptyState: StoreState = {
  items: [],
  error: null,
  saveError: null,
  ready: false,
}

let state: StoreState = emptyState
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return state
}

function getServerSnapshot() {
  return emptyState
}

function hydrate() {
  if (state.ready || typeof window === "undefined") return
  const loaded = loadSchedule()
  state = {
    items: loaded.items,
    error: loaded.error,
    saveError: null,
    ready: true,
  }
  emit()
}

function persist(items: WorkItem[], error: string | null = null) {
  let saveError: string | null = null
  try {
    saveSchedule(items)
  } catch {
    saveError = "無法寫入本機儲存。瀏覽器可能停用了 localStorage，或空間已滿。"
  }
  state = { items, error, saveError, ready: true }
  emit()
}

export function useSchedule() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    hydrate()
  }, [])

  const upsert = useCallback((item: Omit<WorkItem, "id"> & { id?: string }) => {
    const current = state.items
    const id = item.id ?? createId()
    const nextItem: WorkItem = { ...item, id, title: item.title.trim() }
    persist(
      current.some((existing) => existing.id === id)
        ? current.map((existing) => (existing.id === id ? nextItem : existing))
        : [...current, nextItem],
    )
    return id
  }, [])

  const remove = useCallback((id: string) => {
    persist(state.items.filter((item) => item.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    persist([], null)
  }, [])

  const importJson = useCallback((raw: string) => {
    const next = parsePayload(raw)
    persist(next, null)
    return next.length
  }, [])

  const exportJson = useCallback(() => serializeSchedule(state.items), [])

  const byDate = useMemo(() => {
    const map = new Map<string, WorkItem[]>()
    for (const item of snapshot.items) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    for (const list of map.values()) {
      list.sort(compareItemsByTime)
    }
    return map
  }, [snapshot.items])

  const sorted = useMemo(() => {
    return [...snapshot.items].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return compareItemsByTime(a, b)
    })
  }, [snapshot.items])

  return {
    items: sorted,
    byDate,
    ready: snapshot.ready,
    error: snapshot.error,
    saveError: snapshot.saveError,
    upsert,
    remove,
    clearAll,
    importJson,
    exportJson,
  }
}
