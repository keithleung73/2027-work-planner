"use client"

import { CATEGORY_META } from "@/lib/categories"
import { getMonthCells, todayKey, WEEKDAYS } from "@/lib/calendar"
import { dayMark, eventsOnDate, isExamDay, SCHOOL_KIND_META } from "@/lib/school-calendar"
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
          const official = eventsOnDate(cell.key)
          const mark = dayMark(cell.key)
          const exam = isExamDay(cell.key)
          const isToday = cell.key === today
          const isSelected = cell.key === selectedDate
          const clickable = cell.inRange
          const officialPreview = official.filter((event) => event.kind !== "holiday" && event.kind !== "discretionary")

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
                cell.isWeekend && cell.inMonth && mark === null && "bg-[color-mix(in_oklch,var(--card),var(--primary)_4%)]",
                mark === "holiday" && cell.inMonth && "bg-red-50 dark:bg-red-950/40",
                mark === "discretionary" && cell.inMonth && "bg-rose-50 dark:bg-rose-950/30",
                mark === "teacherPD" && cell.inMonth && "bg-zinc-200/80 dark:bg-zinc-800/80",
                isSelected && "ring-2 ring-primary ring-inset",
                !clickable && "cursor-not-allowed opacity-45",
              )}
            >
              <span className="flex items-start justify-between gap-1">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                    isToday && "bg-primary text-primary-foreground",
                    !isToday && cell.inMonth && mark === "holiday" && "text-red-700 dark:text-red-300",
                    !isToday && cell.inMonth && mark === "discretionary" && "text-rose-700",
                    !isToday && cell.inMonth && mark === null && "text-foreground",
                    exam && !isToday && "underline decoration-amber-500 decoration-2 underline-offset-2",
                  )}
                >
                  {cell.day}
                </span>
                {mark === "holiday" && <span className="text-[10px] font-semibold text-red-600">假</span>}
                {mark === "discretionary" && <span className="text-[10px] font-semibold text-rose-600">自決</span>}
                {mark === "teacherPD" && <span className="text-[10px] font-semibold text-zinc-600">教師</span>}
              </span>
              <div className="hidden min-h-0 flex-1 flex-col gap-0.5 overflow-hidden sm:flex">
                {officialPreview.slice(0, 2).map((event) => (
                  <span
                    key={event.id}
                    className={cn(
                      "truncate rounded-md px-1.5 py-0.5 text-[11px] leading-4",
                      SCHOOL_KIND_META[event.kind].className,
                    )}
                  >
                    {event.title}
                  </span>
                ))}
                {items.slice(0, mark ? 1 : 2).map((item) => (
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
              </div>
              <div className="flex flex-wrap gap-0.5 sm:hidden">
                {official.slice(0, 3).map((event) => (
                  <span key={event.id} className={cn("size-1.5 rounded-full", SCHOOL_KIND_META[event.kind].dot)} />
                ))}
                {items.slice(0, 3).map((item) => (
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
