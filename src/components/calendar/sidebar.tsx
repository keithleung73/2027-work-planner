"use client"

import { CATEGORY_META } from "@/lib/categories"
import { parseDateKey, todayKey } from "@/lib/calendar"
import {
  formatEventRange,
  monthEvents,
  SCHOOL_KIND_META,
  searchSchoolEvents,
  tentativeForMonth,
} from "@/lib/school-calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WorkItem } from "@/lib/types"
import { Search } from "lucide-react"

type SidebarProps = {
  year: number
  month: number
  items: WorkItem[]
  query: string
  onQueryChange: (value: string) => void
  onSelectDate: (key: string) => void
}

export function Sidebar({
  year,
  month,
  items,
  query,
  onQueryChange,
  onSelectDate,
}: SidebarProps) {
  const today = todayKey()
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`
  const monthItems = items.filter((item) => item.date.startsWith(monthPrefix))
  const school = monthEvents(year, month)
  const tentative = tentativeForMonth(year, month)

  const normalized = query.trim().toLowerCase()
  const workResults = normalized
    ? items.filter((item) => {
        const haystack = `${item.title} ${item.location} ${item.notes}`.toLowerCase()
        return haystack.includes(normalized)
      })
    : []
  const schoolResults = normalized ? searchSchoolEvents(query) : []

  return (
    <aside className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
      <div className="relative">
        <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜尋校曆或工作安排"
          className="pl-8"
          aria-label="搜尋校曆或工作安排"
        />
      </div>

      {normalized ? (
        <section className="rounded-2xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold">搜尋結果</h2>
          {workResults.length === 0 && schoolResults.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              找不到「{query.trim()}」。試試其他關鍵字。
            </p>
          ) : (
            <>
              {schoolResults.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {schoolResults.slice(0, 8).map((event) => (
                    <li key={event.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-full items-start justify-start px-2 py-2 text-left whitespace-normal"
                        onClick={() => onSelectDate(event.start)}
                      >
                        <span className="flex w-full min-w-0 flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatEventRange(event)}</span>
                            <Badge className={SCHOOL_KIND_META[event.kind].className} variant="secondary">
                              {SCHOOL_KIND_META[event.kind].label}
                            </Badge>
                          </span>
                          <span className="truncate text-sm font-medium">{event.title}</span>
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              {workResults.length > 0 && (
                <ItemList items={workResults.slice(0, 8)} today={today} onSelectDate={onSelectDate} />
              )}
            </>
          )}
        </section>
      ) : (
        <>
          <section className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold">本月校務</h2>
              <span className="text-xs text-muted-foreground">{school.length} 項</span>
            </div>
            {school.length === 0 && tentative.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                這個月沒有載入校曆活動。學年校曆由 2026 年 9 月至 2027 年 8 月。
              </p>
            ) : (
              <ScrollArea className="mt-1 max-h-72">
                <ul className="mt-3 flex flex-col gap-2">
                  {school.map((event) => (
                    <li key={event.id}>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-full items-start justify-start px-2 py-2 text-left whitespace-normal"
                        onClick={() => onSelectDate(event.start)}
                      >
                        <span className="flex w-full min-w-0 flex-col gap-1">
                          <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatEventRange(event)}</span>
                            <Badge className={SCHOOL_KIND_META[event.kind].className} variant="secondary">
                              {SCHOOL_KIND_META[event.kind].label}
                            </Badge>
                          </span>
                          <span className="truncate text-sm font-medium">{event.title}</span>
                        </span>
                      </Button>
                    </li>
                  ))}
                  {tentative.map((event) => (
                    <li key={event.title} className="px-2 py-1 text-sm text-muted-foreground">
                      {event.title}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </section>

          <section className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold">我的安排</h2>
              <span className="text-xs text-muted-foreground">{monthItems.length} 項</span>
            </div>
            {monthItems.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                這個月還沒有個人工作。點日期即可加會議或待辦。
              </p>
            ) : (
              <ScrollArea className="mt-1 max-h-56">
                <ItemList items={monthItems} today={today} onSelectDate={onSelectDate} />
              </ScrollArea>
            )}
          </section>
        </>
      )}
    </aside>
  )
}

function ItemList({
  items,
  today,
  onSelectDate,
}: {
  items: WorkItem[]
  today: string
  onSelectDate: (key: string) => void
}) {
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {items.map((item) => {
        const { month, day } = parseDateKey(item.date)
        return (
          <li key={item.id}>
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full items-start justify-start px-2 py-2 text-left whitespace-normal"
              onClick={() => onSelectDate(item.date)}
            >
              <span className="flex w-full min-w-0 flex-col gap-1">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {month + 1}/{day}
                    {item.date === today ? " · 今天" : ""}
                  </span>
                  <Badge className={CATEGORY_META[item.category].className} variant="secondary">
                    {CATEGORY_META[item.category].label}
                  </Badge>
                </span>
                <span className="truncate text-sm font-medium">
                  {item.startTime ? `${item.startTime} ` : ""}
                  {item.title}
                </span>
                {item.location && (
                  <span className="truncate text-xs text-muted-foreground">{item.location}</span>
                )}
              </span>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}
