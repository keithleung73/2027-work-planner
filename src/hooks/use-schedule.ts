"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { compareItemsByTime } from "@/lib/calendar"
import {
  createId,
  loadSchedule,
  parsePayload,
  saveSchedule,
  serializeSchedule,
} from "@/lib/storage"
import type { WorkItem } from "@/lib/types"

type ScheduleState = {
  items: WorkItem[]
  error: string | null
  saveError: string | null
}

const emptyState: ScheduleState = {
  items: [],
  error: null,
  saveError: null,
}

export function useSchedule() {
  const [state, setState] = useState<ScheduleState>(emptyState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const loaded = loadSchedule()
    // Hydrate from localStorage after mount; this is browser-only state.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is an external system
    setState({
      items: loaded.items,
      error: loaded.error,
      saveError: null,
    })
    setReady(true)
  }, [])

  const persist = useCallback((items: WorkItem[], error: string | null = null) => {
    let saveError: string | null = null
    try {
      saveSchedule(items)
    } catch {
      saveError = "無法寫入本機儲存。瀏覽器可能停用了 localStorage，或空間已滿。"
    }
    setState({ items, error, saveError })
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
  }
}
