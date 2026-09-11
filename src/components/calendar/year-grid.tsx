"use client"

import { getMonthCells, MONTHS, todayKey } from "@/lib/calendar"
import { cn } from "@/lib/utils"
import type { WorkItem } from "@/lib/types"

type YearGridProps = {
  year: number
  selectedDate: string | null
  byDate: Map<string, WorkItem[]>
  onSelectDate: (key: string) => void
  onSelectMonth: (month: number) => void
}

export function YearGrid({
  year,
  selectedDate,
  byDate,
  onSelectDate,
  onSelectMonth,
}: YearGridProps) {
  const today = todayKey()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {MONTHS.map((label, month) => {
        const cells = getMonthCells(year, month)
        const count = cells.filter((cell) => cell.inMonth && (byDate.get(cell.key)?.length ?? 0) > 0).length

        return (
          <section
            key={label}
            className="rounded-2xl border bg-card p-3 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onSelectMonth(month)}
                className="text-sm font-semibold tracking-wide hover:text-primary"
              >
                {label}
              </button>
              <span className="text-xs text-muted-foreground">
                {count > 0 ? `${count} 天有安排` : "尚未安排"}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-muted-foreground">
              {"日一二三四五六".split("").map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-y-1">
              {cells.map((cell) => {
                const hasItems = (byDate.get(cell.key)?.length ?? 0) > 0
                const isToday = cell.key === today
                const isSelected = cell.key === selectedDate
                return (
                  <button
                    key={cell.key}
                    type="button"
                    disabled={!cell.inRange}
                    onClick={() => cell.inRange && onSelectDate(cell.key)}
                    className={cn(
                      "mx-auto flex size-7 items-center justify-center rounded-full text-xs",
                      !cell.inMonth && "opacity-0",
                      cell.inMonth && "hover:bg-accent",
                      hasItems && cell.inMonth && "font-semibold text-primary",
                      isToday && "bg-primary text-primary-foreground hover:bg-primary",
                      isSelected && !isToday && "ring-2 ring-primary",
                    )}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
