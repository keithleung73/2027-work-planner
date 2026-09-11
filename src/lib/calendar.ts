import { MAX_YEAR, MIN_YEAR } from "@/lib/types"

export const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"] as const

export const MONTHS = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
] as const

export type CalendarCell = {
  key: string
  year: number
  month: number
  day: number
  inMonth: boolean
  inRange: boolean
  isWeekend: boolean
}

export function pad2(n: number) {
  return String(n).padStart(2, "0")
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`
}

export function todayKey() {
  const now = new Date()
  return toDateKey(now.getFullYear(), now.getMonth(), now.getDate())
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return { year, month: month - 1, day }
}

export function isInRange(year: number, month: number, day: number) {
  if (year < MIN_YEAR || year > MAX_YEAR) return false
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false
  }
  if (month < 0 || month > 11 || day < 1) return false
  const last = new Date(year, month + 1, 0).getDate()
  return day <= last
}

export function isKeyInRange(key: string) {
  const { year, month, day } = parseDateKey(key)
  return isInRange(year, month, day)
}

export function weekdayIndex(year: number, month: number, day: number) {
  return new Date(year, month, day).getDay()
}

export function formatLongDate(key: string) {
  const { year, month, day } = parseDateKey(key)
  const weekday = WEEKDAYS[weekdayIndex(year, month, day)]
  return `${year}年${month + 1}月${day}日（${weekday}）`
}

export function formatShortDate(key: string) {
  const { year, month, day } = parseDateKey(key)
  return `${year}/${month + 1}/${day}`
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function canShiftMonth(year: number, month: number, delta: number) {
  const next = shiftMonth(year, month, delta)
  if (next.year < MIN_YEAR) return false
  if (next.year > MAX_YEAR) return false
  return true
}

export function defaultView() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  if (year < MIN_YEAR) return { year: MIN_YEAR, month: 0 }
  if (year > MAX_YEAR) return { year: MAX_YEAR, month: 11 }
  return { year, month }
}

export function getMonthCells(year: number, month: number): CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: CalendarCell[] = []

  const prev = shiftMonth(year, month, -1)
  const prevDays = new Date(prev.year, prev.month + 1, 0).getDate()
  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = prevDays - i
    cells.push(makeCell(prev.year, prev.month, day, false))
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(makeCell(year, month, day, true))
  }

  const next = shiftMonth(year, month, 1)
  let nextDay = 1
  while (cells.length < 42) {
    cells.push(makeCell(next.year, next.month, nextDay, false))
    nextDay += 1
  }

  return cells
}

function makeCell(
  year: number,
  month: number,
  day: number,
  inMonth: boolean,
): CalendarCell {
  const weekday = weekdayIndex(year, month, day)
  return {
    key: toDateKey(year, month, day),
    year,
    month,
    day,
    inMonth,
    inRange: isInRange(year, month, day),
    isWeekend: weekday === 0 || weekday === 6,
  }
}

export function compareItemsByTime(
  a: { startTime: string; title: string },
  b: { startTime: string; title: string },
) {
  const aTime = a.startTime || "99:99"
  const bTime = b.startTime || "99:99"
  if (aTime !== bTime) return aTime.localeCompare(bTime)
  return a.title.localeCompare(b.title, "zh-Hant")
}
