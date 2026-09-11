"use client"

import { SCHOOL_DAYS_TOTAL, SCHOOL_KIND_META, SCHOOL_KINDS } from "@/lib/school-calendar"

export function CalendarLegend() {
  return (
    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="relative size-4 rounded-sm border border-red-400 bg-red-50">
            <span className="absolute inset-0 text-center text-[10px] leading-4 text-red-600">✕</span>
          </span>
          學校假期
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative size-4 rounded-sm border border-rose-400 bg-rose-50">
            <span className="absolute inset-0 text-center text-[10px] leading-4 text-rose-600">/</span>
          </span>
          學校自決假期
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-zinc-400" />
          教師發展日（學生不用上課）
        </span>
        {SCHOOL_KINDS.filter((kind) => kind !== "holiday" && kind !== "discretionary" && kind !== "teacherPD").map(
          (kind) => (
            <span key={kind} className="inline-flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${SCHOOL_KIND_META[kind].dot}`} />
              {SCHOOL_KIND_META[kind].label}
            </span>
          ),
        )}
      </div>
      <p>全年上課日數 {SCHOOL_DAYS_TOTAL} 天。教師發展日不計入假期上課日數。</p>
    </div>
  )
}
