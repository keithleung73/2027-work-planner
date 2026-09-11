"use client"

import { CATEGORY_META } from "@/lib/categories"
import { getMonthCells, todayKey, WEEKDAYS } from "@/lib/calendar"
import { cn } from "@/lib/utils"
import type { WorkItem } from "@/lib/types"

type MonthGridProps = {
  year: number
  month: number
  selectedDate: string | null
  byDate: Map<string, WorkItem[]>
  onSelectDate: (key: string) => void
}

export function MonthGrid({
  year,
  month,
  selectedDate,
  byDate,
  onSelectDate,
}: MonthGridProps) {
  const cells = getMonthCells(year, month)
  const today = todayKey()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="grid grid-cols-7 border-b bg-muted/60">
        {WEEKDAYS.map((label) => (
          <div
            key={label}
            className={cn(
              "py-2 text-center text-xs font-medium tracking-widest text-muted-foreground",
              (label === "日" || label === "六") && "text-primary/80",
            )}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid min-h-[28rem] flex-1 grid-cols-7 grid-rows-6 gap-px bg-border">
        {cells.map((cell) => {
          const items = byDate.get(cell.key) ?? []
          const isToday = cell.key === today
          const isSelected = cell.key === selectedDate
          const clickable = cell.inRange

          return (
            <button
              key={cell.key}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelectDate(cell.key)}
              className={cn(
                "flex min-h-0 flex-col gap-1 bg-card p-1.5 text-left transition-colors sm:p-2",
                clickable && "hover:bg-accent/60",
                !cell.inMonth && "bg-muted/40 text-muted-foreground",
                cell.isWeekend && cell.inMonth && "bg-[color-mix(in_oklch,var(--card),var(--primary)_4%)]",
                isSelected && "ring-2 ring-primary ring-inset",
                !clickable && "cursor-not-allowed opacity-45",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                  isToday && "bg-primary text-primary-foreground",
                  !isToday && cell.inMonth && "text-foreground",
                )}
              >
                {cell.day}
              </span>
              <div className="hidden min-h-0 flex-1 flex-col gap-1 overflow-hidden sm:flex">
                {items.slice(0, 3).map((item) => (
                  <span
                    key={item.id}
                    className={cn(
                      "truncate rounded-md px-1.5 py-0.5 text-[11px] leading-4",
                      CATEGORY_META[item.category].className,
                    )}
                  >
                    {item.startTime ? `${item.startTime} ${item.title}` : item.title}
                  </span>
                ))}
                {items.length > 3 && (
                  <span className="px-1 text-[11px] text-muted-foreground">
                    還有 {items.length - 3} 項
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-0.5 sm:hidden">
                {items.slice(0, 4).map((item) => (
                  <span
                    key={item.id}
                    className={cn("size-1.5 rounded-full", CATEGORY_META[item.category].dot)}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
