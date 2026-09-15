"use client"

import { useState } from "react"
import { CATEGORY_META } from "@/lib/categories"
import { formatLongDate } from "@/lib/calendar"
import { emptyItem } from "@/lib/storage"
import { CATEGORIES, type WorkItem } from "@/lib/types"
import {
  dayMark,
  eventsOnDate,
  formatEventRange,
  SCHOOL_KIND_META,
  schoolWeekNumber,
} from "@/lib/school-calendar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Pencil, Plus, Trash2 } from "lucide-react"

type DayPanelProps = {
  date: string | null
  items: WorkItem[]
  onClose: () => void
  onSave: (item: Omit<WorkItem, "id"> & { id?: string }) => void
  onDelete: (id: string) => void
}

type Draft = Omit<WorkItem, "id"> & { id?: string }

export function DayPanel({ date, items, onClose, onSave, onDelete }: DayPanelProps) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [titleError, setTitleError] = useState(false)
  const open = Boolean(date)
  const official = date ? eventsOnDate(date) : []
  const mark = date ? dayMark(date) : null
  const week = date ? schoolWeekNumber(date) : null

  function startCreate() {
    if (!date) return
    setDraft(emptyItem(date))
    setTitleError(false)
  }

  function startEdit(item: WorkItem) {
    setDraft({ ...item })
    setTitleError(false)
  }

  function submit() {
    if (!draft) return
    if (!draft.title.trim()) {
      setTitleError(true)
      return
    }
    onSave(draft)
    setDraft(null)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-lg" showCloseButton>
        {date && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {formatLongDate(date)}
              </DialogTitle>
              <DialogDescription>
                {week ? `校曆第 ${week} 週。` : ""}
                {mark === "holiday" && "這天是學校假期。"}
                {mark === "discretionary" && "這天是學校自決假期。"}
                {mark === "teacherPD" && "教師專業發展日，學生不用上課。"}
                {official.length === 0 && items.length === 0 && !mark
                  ? "這天還沒有校務或工作安排。"
                  : `可在下方寫下你當天的工作。`}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[min(28rem,55vh)] pr-3">
              <div className="flex flex-col gap-3">
                {official.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-medium tracking-wide text-muted-foreground">校曆</p>
                    {official.map((event) => (
                      <article key={event.id} className="rounded-xl border bg-muted/30 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={SCHOOL_KIND_META[event.kind].className} variant="secondary">
                            {SCHOOL_KIND_META[event.kind].label}
                          </Badge>
                        </div>
                        <h3 className="mt-2 font-medium">{event.title}</h3>
                        {event.detail ? (
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.detail}</p>
                        ) : null}
                        {event.start !== event.end ? (
                          <p className="mt-1 text-xs text-muted-foreground">{formatEventRange(event)}</p>
                        ) : null}
                      </article>
                    ))}
                  </div>
                )}

                {items.length === 0 && !draft && (
                  <div className="rounded-xl border border-dashed bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
                    點下方「新增安排」寫下當天工作。校曆活動已列於上方，不會被覆蓋。
                  </div>
                )}

                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border bg-card p-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={CATEGORY_META[item.category].className} variant="secondary">
                            {CATEGORY_META[item.category].label}
                          </Badge>
                          <TimeRange start={item.startTime} end={item.endTime} />
                        </div>
                        <h3 className="mt-2 truncate font-medium">{item.title}</h3>
                        {item.location && (
                          <p className="mt-1 text-sm text-muted-foreground">{item.location}</p>
                        )}
                        {item.notes && (
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="編輯這項安排"
                          onClick={() => startEdit(item)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          aria-label="刪除這項安排"
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}

                {draft && (
                  <form
                    className="rounded-xl border bg-muted/30 p-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      submit()
                    }}
                  >
                    <p className="mb-3 text-sm font-medium">
                      {draft.id ? "編輯安排" : "新增安排"}
                    </p>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="work-title">標題</Label>
                        <Input
                          id="work-title"
                          autoFocus
                          value={draft.title}
                          aria-invalid={titleError}
                          placeholder="例如：週會、客戶簡報、提交報告"
                          onChange={(event) => {
                            setTitleError(false)
                            setDraft({ ...draft, title: event.target.value })
                          }}
                        />
                        {titleError && (
                          <p className="text-xs text-destructive">請輸入標題。</p>
                        )}
                      </div>

                      <div className="grid gap-1.5">
                        <Label>類型</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {CATEGORIES.map((category) => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => setDraft({ ...draft, category })}
                              className={cn(
                                "rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-transparent transition-colors",
                                CATEGORY_META[category].className,
                                draft.category === category && "ring-foreground/40",
                              )}
                            >
                              {CATEGORY_META[category].label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="work-start">開始</Label>
                          <Input
                            id="work-start"
                            type="time"
                            value={draft.startTime}
                            onChange={(event) =>
                              setDraft({ ...draft, startTime: event.target.value })
                            }
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="work-end">結束</Label>
                          <Input
                            id="work-end"
                            type="time"
                            value={draft.endTime}
                            onChange={(event) =>
                              setDraft({ ...draft, endTime: event.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="work-location">地點</Label>
                        <Input
                          id="work-location"
                          value={draft.location}
                          placeholder="會議室、客戶公司或線上"
                          onChange={(event) =>
                            setDraft({ ...draft, location: event.target.value })
                          }
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor="work-notes">備註</Label>
                        <Textarea
                          id="work-notes"
                          value={draft.notes}
                          placeholder="議程、攜帶資料或其他提醒"
                          onChange={(event) =>
                            setDraft({ ...draft, notes: event.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                        取消
                      </Button>
                      <Button type="submit">{draft.id ? "儲存變更" : "加入這天"}</Button>
                    </div>
                  </form>
                )}
              </div>
            </ScrollArea>

            {!draft && (
              <Button type="button" onClick={startCreate} className="w-full">
                <Plus data-icon="inline-start" />
                新增安排
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TimeRange({ start, end }: { start: string; end: string }) {
  if (!start && !end) {
    return <span className="text-xs text-muted-foreground">時間未定</span>
  }
  return (
    <span className="text-xs text-muted-foreground">
      {start || "?"}
      {end ? `–${end}` : ""}
    </span>
  )
}
