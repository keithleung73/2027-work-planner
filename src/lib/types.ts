export const MIN_YEAR = 2026
export const MAX_YEAR = 2027

export const CATEGORIES = [
  "meeting",
  "task",
  "travel",
  "personal",
  "other",
] as const

export type Category = (typeof CATEGORIES)[number]

export type WorkItem = {
  id: string
  date: string
  title: string
  startTime: string
  endTime: string
  location: string
  notes: string
  category: Category
}

export type SchedulePayload = {
  version: 1
  items: WorkItem[]
}
