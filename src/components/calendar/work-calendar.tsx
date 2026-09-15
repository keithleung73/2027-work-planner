"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  canShiftMonth,
  defaultView,
  MONTHS,
  shiftMonth,
  todayKey,
} from "@/lib/calendar"
import { MAX_YEAR, MIN_YEAR } from "@/lib/types"
import { useSchedule } from "@/hooks/use-schedule"
import { MonthGrid } from "@/components/calendar/month-grid"
import { YearGrid } from "@/components/calendar/year-grid"
import { DayPanel } from "@/components/calendar/day-panel"
import { Sidebar } from "@/components/calendar/sidebar"
import { DevicesDialog } from "@/components/calendar/devices-dialog"
import { CalendarLegend } from "@/components/calendar/legend"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Ellipsis,
  FileText,
  Smartphone,
  Upload,
} from "lucide-react"
import {
  SCHOOL_HANDBOOK_CODE,
  SCHOOL_NAME,
  SCHOOL_PDF_HREF,
  SCHOOL_YEAR_LABEL,
} from "@/lib/school-calendar"
import { clearShareHash, decodeSharePayload, shareHashFromLocation } from "@/lib/share"

export function WorkCalendar() {
  const initial = defaultView()
  const [year, setYear] = useState(initial.year)
  const [month, setMonth] = useState(initial.month)
  const [view, setView] = useState<"month" | "year">("month")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [devicesOpen, setDevicesOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const consumedShare = useRef(false)

  const schedule = useSchedule()
  const today = todayKey()
  const todayInRange = today.startsWith("2026") || today.startsWith("2027")

  const selectedItems = useMemo(
    () => (selectedDate ? schedule.byDate.get(selectedDate) ?? [] : []),
    [schedule.byDate, selectedDate],
  )

  function goToday() {
    const next = defaultView()
    setYear(next.year)
    setMonth(next.month)
    setView("month")
    if (todayInRange) setSelectedDate(today)
  }

  function goMonth(delta: number) {
    if (!canShiftMonth(year, month, delta)) return
    const next = shiftMonth(year, month, delta)
    setYear(next.year)
    setMonth(next.month)
    setView("month")
  }

  function openDate(key: string) {
    const [nextYear, nextMonth] = key.split("-").map(Number)
    setYear(nextYear)
    setMonth(nextMonth - 1)
    setView("month")
    setSelectedDate(key)
  }

  function downloadBackup() {
    const blob = new Blob([schedule.exportJson()], {
      type: "application/json;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "工作月曆-2026-2027.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  async function onImportFile(file: File | undefined) {
    if (!file) return
    try {
      const text = await file.text()
      const count = schedule.importJson(text)
      setImportMessage(`已匯入 ${count} 項工作安排。`)
    } catch {
      setImportMessage("匯入失敗，請確認檔案是由此月曆匯出的 JSON。")
    }
  }

  const importJson = schedule.importJson
  const scheduleReady = schedule.ready

  useEffect(() => {
    if (!scheduleReady || consumedShare.current) return
    const encoded = shareHashFromLocation()
    if (!encoded) return
    consumedShare.current = true
    void (async () => {
      try {
        const items = await decodeSharePayload(encoded)
        const ok = window.confirm(
          `這個連結有 ${items.length} 項個人工作安排。載入到這部裝置會覆蓋現有備註，校曆活動不受影響。繼續？`,
        )
        if (!ok) {
          clearShareHash()
          return
        }
        const count = importJson(JSON.stringify({ version: 1, items }))
        clearShareHash()
        setImportMessage(`已從其他裝置載入 ${count} 項工作安排。`)
      } catch {
        clearShareHash()
        setImportMessage("同步連結無效或已損壞。")
      }
    })()
  }, [scheduleReady, importJson])

  if (!schedule.ready) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="min-h-[32rem] flex-1 animate-pulse rounded-2xl bg-muted" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 pb-10 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium tracking-[0.2em] text-primary">{SCHOOL_NAME}</p>
          <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            {SCHOOL_YEAR_LABEL}校曆
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            依{SCHOOL_HANDBOOK_CODE}標示假期、考試、交流團與活動。正式網址給所有裝置用；官方校曆更新後重新整理即同步。個人會議／備註可在「其他裝置」設定同步碼，之後各裝置會自動更新。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={SCHOOL_PDF_HREF}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            <FileText data-icon="inline-start" />
            官方校曆
          </a>
          <Button type="button" variant="outline" onClick={() => setDevicesOpen(true)}>
            <Smartphone data-icon="inline-start" />
            {schedule.cloud.status === "on" ? "已同步" : "其他裝置"}
          </Button>
          <Button type="button" variant="outline" onClick={goToday} disabled={!todayInRange}>
            <CalendarDays data-icon="inline-start" />
            今天
          </Button>
          <Button type="button" variant="outline" onClick={downloadBackup}>
            <Download data-icon="inline-start" />
            匯出
          </Button>
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload data-icon="inline-start" />
            匯入
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" variant="outline" size="icon" />}
            >
              <Ellipsis />
              <span className="sr-only">更多動作</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  if (window.confirm("確定清除 2026–2027 全部工作安排？此動作無法復原。")) {
                    schedule.clearAll()
                  }
                }}
              >
                清除全部安排
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  schedule.clearAll()
                  setImportMessage("已清除本機資料。")
                }}
              >
                修復並清空毀損資料
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              void onImportFile(event.target.files?.[0])
              event.target.value = ""
            }}
          />
        </div>
      </header>

      {(schedule.error || schedule.saveError) && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {schedule.error || schedule.saveError}
        </div>
      )}
      {importMessage && (
        <div className="rounded-xl border bg-card px-4 py-3 text-sm text-foreground">
          {importMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="上一個月"
            disabled={view === "month" ? !canShiftMonth(year, month, -1) : year <= MIN_YEAR}
            onClick={() => {
              if (view === "year") setYear((value) => Math.max(MIN_YEAR, value - 1))
              else goMonth(-1)
            }}
          >
            <ChevronLeft />
          </Button>
          <div className="min-w-36 text-center">
            <p className="font-heading text-xl font-semibold">
              {view === "year" ? `${year} 年` : `${year} 年 ${MONTHS[month]}`}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="下一個月"
            disabled={view === "month" ? !canShiftMonth(year, month, 1) : year >= MAX_YEAR}
            onClick={() => {
              if (view === "year") setYear((value) => Math.min(MAX_YEAR, value + 1))
              else goMonth(1)
            }}
          >
            <ChevronRight />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border bg-card p-0.5">
            {([MIN_YEAR, MAX_YEAR] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setYear(value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm",
                  year === value && "bg-primary text-primary-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setView("month")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                view === "month" && "bg-secondary",
              )}
            >
              月曆
            </button>
            <button
              type="button"
              onClick={() => setView("year")}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                view === "year" && "bg-secondary",
              )}
            >
              年曆
            </button>
          </div>
        </div>
      </div>

      {view === "month" && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {MONTHS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setMonth(index)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-sm text-muted-foreground hover:bg-accent",
                month === index && "bg-primary text-primary-foreground hover:bg-primary",
              )}
            >
              {index + 1}月
            </button>
          ))}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          {view === "month" ? (
            <MonthGrid
              year={year}
              month={month}
              selectedDate={selectedDate}
              byDate={schedule.byDate}
              onSelectDate={openDate}
            />
          ) : (
            <YearGrid
              year={year}
              selectedDate={selectedDate}
              byDate={schedule.byDate}
              onSelectDate={openDate}
              onSelectMonth={(nextMonth) => {
                setMonth(nextMonth)
                setView("month")
              }}
            />
          )}
        </div>
        <Sidebar
          year={year}
          month={month}
          items={schedule.items}
          query={query}
          onQueryChange={setQuery}
          onSelectDate={openDate}
        />
      </div>

      <CalendarLegend />

      <DayPanel
        key={selectedDate ?? "closed"}
        date={selectedDate}
        items={selectedItems}
        onClose={() => setSelectedDate(null)}
        onSave={schedule.upsert}
        onDelete={schedule.remove}
      />
      <DevicesDialog
        open={devicesOpen}
        onOpenChange={setDevicesOpen}
        items={schedule.items}
        cloud={schedule.cloud}
        onEnableCloud={schedule.enableCloud}
        onDisableCloud={schedule.disableCloud}
        onGenerateCode={schedule.generateSyncCode}
      />
    </div>
  )
}
