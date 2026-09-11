import type { Category } from "@/lib/types"

export const CATEGORY_META: Record<
  Category,
  { label: string; className: string; dot: string }
> = {
  meeting: {
    label: "會議",
    className: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100",
    dot: "bg-sky-500",
  },
  task: {
    label: "任務",
    className: "bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-100",
    dot: "bg-orange-500",
  },
  travel: {
    label: "出差",
    className: "bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-100",
    dot: "bg-teal-500",
  },
  personal: {
    label: "私人",
    className: "bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-100",
    dot: "bg-violet-500",
  },
  other: {
    label: "其他",
    className: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-100",
    dot: "bg-stone-500",
  },
}
