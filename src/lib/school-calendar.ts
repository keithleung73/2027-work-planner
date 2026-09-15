import { parseDateKey, toDateKey } from "@/lib/calendar"

export const SCHOOL_NAME = "萬鈞伯裘書院"
export const SCHOOL_YEAR_LABEL = "2026–2027年度"
export const SCHOOL_HANDBOOK_CODE = "校務手冊26-27-007"
export const SCHOOL_DAYS_TOTAL = 191
export const SCHOOL_YEAR_START = "2026-09-01"
export const SCHOOL_YEAR_END = "2027-08-31"
export const SCHOOL_PDF_HREF = "/mkpc-calendar-2026-2027.pdf"
export const SCHOOL_SITE_URL = "https://2027-work-planner.vercel.app"

export const SCHOOL_KINDS = [
  "holiday",
  "discretionary",
  "teacherPD",
  "exam",
  "learning",
  "tour",
  "other",
  "foundation",
] as const

export type SchoolKind = (typeof SCHOOL_KINDS)[number]
export type DayMark = "holiday" | "discretionary" | "teacherPD"

export type SchoolEvent = {
  id: string
  title: string
  kind: SchoolKind
  start: string
  end: string
  detail?: string
}

export const SCHOOL_KIND_META: Record<
  SchoolKind,
  { label: string; className: string; dot: string }
> = {
  holiday: {
    label: "學校假期",
    className: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100",
    dot: "bg-red-500",
  },
  discretionary: {
    label: "學校自決假期",
    className: "bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-100",
    dot: "bg-rose-400",
  },
  teacherPD: {
    label: "教師發展日",
    className: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
    dot: "bg-zinc-500",
  },
  exam: {
    label: "考試／統測",
    className: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
    dot: "bg-amber-500",
  },
  learning: {
    label: "學習活動",
    className: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
    dot: "bg-emerald-500",
  },
  tour: {
    label: "交流團／出團",
    className: "bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-100",
    dot: "bg-teal-600",
  },
  other: {
    label: "其他活動／會議",
    className: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100",
    dot: "bg-sky-500",
  },
  foundation: {
    label: "機構／基金活動",
    className: "bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-100",
    dot: "bg-violet-500",
  },
}

export const SCHOOL_EVENTS: SchoolEvent[] = [
  { id: "admin-2026-09-05", title: "聯校行政會", kind: "foundation", start: "2026-09-05", end: "2026-09-05" },
  {
    id: "tour-sz-band",
    title: "深圳銀樂隊少青團",
    kind: "tour",
    start: "2026-09-15",
    end: "2026-09-19",
    detail: "學生交流團｜帶隊：陳秋雲",
  },
  {
    id: "tour-seoul-maker",
    title: "韓國首爾 Maker Faire",
    kind: "tour",
    start: "2026-09-17",
    end: "2026-09-21",
    detail: "IT 展覽｜帶隊：萬嘉傑、何慧欣",
  },
  {
    id: "tour-hackmit",
    title: "HackMIT（美國）",
    kind: "tour",
    start: "2026-09-18",
    end: "2026-09-23",
    detail: "IT 比賽｜帶隊：張永泰",
  },
  { id: "assembly-2026-09-24", title: "開學集會", kind: "learning", start: "2026-09-24", end: "2026-09-24" },
  { id: "mid-autumn", title: "中秋節翌日", kind: "holiday", start: "2026-09-26", end: "2026-09-26" },
  { id: "sports-day", title: "陸運會", kind: "learning", start: "2026-09-28", end: "2026-09-29" },
  {
    id: "tour-nagoya",
    title: "名古屋自主學習考察團",
    kind: "tour",
    start: "2026-09-29",
    end: "2026-10-05",
    detail: "學生交流團｜帶隊：伍卓鍵、馬嘉雯",
  },
  { id: "sports-day-holiday", title: "陸運會後假期", kind: "discretionary", start: "2026-09-30", end: "2026-09-30" },
  { id: "national-day", title: "國慶日", kind: "holiday", start: "2026-10-01", end: "2026-10-01" },
  { id: "national-day-after", title: "國慶日後假期", kind: "holiday", start: "2026-10-02", end: "2026-10-02" },
  { id: "interschool-swim", title: "校際游泳比賽", kind: "other", start: "2026-10-08", end: "2026-10-09" },
  { id: "pd-oct", title: "教師專業發展日", kind: "teacherPD", start: "2026-10-09", end: "2026-10-09" },
  { id: "teacher-dinner", title: "老師表揚晚宴", kind: "foundation", start: "2026-10-09", end: "2026-10-09" },
  { id: "yl-secondary-fair", title: "元朗區中學巡禮", kind: "foundation", start: "2026-10-10", end: "2026-10-10" },
  {
    id: "tour-indonesia-science",
    title: "印尼學生科學比賽",
    kind: "tour",
    start: "2026-10-12",
    end: "2026-10-19",
    detail: "IT 比賽｜帶隊：雷俊曜",
  },
  {
    id: "tour-xinjiang",
    title: "新疆姊妹學校簽訂",
    kind: "tour",
    start: "2026-10-14",
    end: "2026-10-19",
    detail: "學校專業發展｜帶隊：馬穎嫻、呂詩恩",
  },
  { id: "staff-2026-10-16", title: "校務會議", kind: "other", start: "2026-10-16", end: "2026-10-16" },
  {
    id: "tour-gz-maker",
    title: "廣州 Maker Faire",
    kind: "tour",
    start: "2026-10-16",
    end: "2026-10-19",
    detail: "IT 展覽｜帶隊：李麗娟、羅祉臻",
  },
  {
    id: "tour-sz-drone",
    title: "深圳無人機培訓",
    kind: "tour",
    start: "2026-10-16",
    end: "2026-10-20",
    detail: "IT 比賽｜帶隊：黃子毅、何靜妍、張思華、黃守宏",
  },
  { id: "s1-brief-2026-10-17", title: "升中簡介會", kind: "other", start: "2026-10-17", end: "2026-10-17" },
  { id: "chung-yeung", title: "重陽節翌日", kind: "holiday", start: "2026-10-19", end: "2026-10-19" },
  {
    id: "tour-taipei-maker",
    title: "台北 Maker Faire",
    kind: "tour",
    start: "2026-10-23",
    end: "2026-10-26",
    detail: "IT 展覽｜帶隊：周柏言（其餘待定）",
  },
  { id: "test-1", title: "第一次統測（S.4–S.6）", kind: "exam", start: "2026-10-27", end: "2026-10-30" },
  { id: "dlw-oct", title: "Deep Learning Week", kind: "learning", start: "2026-10-27", end: "2026-10-30" },
  {
    id: "tour-sz-guangming",
    title: "深圳光明姊妹學校交流",
    kind: "tour",
    start: "2026-10-28",
    end: "2026-10-29",
    detail: "學生交流團｜帶隊：張敬才、陳淑真、姚嘉宏、林至泰",
  },
  {
    id: "tour-zhangjiagang",
    title: "張家港 STEAM 會議",
    kind: "tour",
    start: "2026-10-29",
    end: "2026-11-01",
    detail: "學生交流團｜帶隊：郭鳳萍、盧澤境、姚嘉宏",
  },
  {
    id: "tour-sg-pd",
    title: "新加坡老師專業發展",
    kind: "tour",
    start: "2026-11-03",
    end: "2026-11-06",
    detail: "老師專業發展｜帶隊：李麗娟",
  },
  { id: "cross-country", title: "校際越野比賽", kind: "other", start: "2026-11-04", end: "2026-11-04" },
  { id: "dss-fair", title: "直資聯展", kind: "foundation", start: "2026-11-07", end: "2026-11-07" },
  { id: "staff-2026-11-13", title: "校務會議", kind: "other", start: "2026-11-13", end: "2026-11-13" },
  { id: "s1-brief-2026-11-14", title: "升中簡介會", kind: "other", start: "2026-11-14", end: "2026-11-14" },
  {
    id: "tour-fuzhou-football",
    title: "福州姊妹學校足球隊交流",
    kind: "tour",
    start: "2026-11-19",
    end: "2026-11-22",
    detail: "學生交流團｜帶隊：陸平中、梁國龍、呂詩恩",
  },
  { id: "school-picnic", title: "全校旅行", kind: "learning", start: "2026-11-20", end: "2026-11-20" },
  {
    id: "tour-s2-guangzhou",
    title: "中二廣州交流",
    kind: "tour",
    start: "2026-11-20",
    end: "2026-11-21",
    detail: "學生交流團",
  },
  { id: "athletics-nov", title: "校際田徑運動會", kind: "other", start: "2026-11-30", end: "2026-12-04" },
  {
    id: "tour-taiwan-reading",
    title: "台灣閱讀及歷史文化交流團",
    kind: "tour",
    start: "2026-12-03",
    end: "2026-12-06",
    detail: "學生交流團｜帶隊：張敬才（其餘待定）",
  },
  { id: "s1-brief-2026-12-04", title: "升中簡介會", kind: "other", start: "2026-12-04", end: "2026-12-05" },
  { id: "open-day", title: "學校開放日", kind: "other", start: "2026-12-04", end: "2026-12-05" },
  { id: "pta-agm", title: "家教會周年大會", kind: "other", start: "2026-12-04", end: "2026-12-04" },
  { id: "open-day-holiday", title: "開放日後假期", kind: "holiday", start: "2026-12-07", end: "2026-12-07" },
  { id: "dlw-dec", title: "Deep Learning Week", kind: "learning", start: "2026-12-08", end: "2026-12-11" },
  {
    id: "tour-cs-s4-ial",
    title: "公民科、S.4 IAL 長沙團",
    kind: "tour",
    start: "2026-12-08",
    end: "2026-12-11",
    detail: "學生交流團",
  },
  {
    id: "tour-sh-s5",
    title: "公民科、S.5 上海團",
    kind: "tour",
    start: "2026-12-08",
    end: "2026-12-12",
    detail: "學生交流團",
  },
  { id: "study-tour-dec", title: "聯校遊學團（待定）", kind: "foundation", start: "2026-12-14", end: "2026-12-14" },
  { id: "christmas-show", title: "聖誕才藝表演", kind: "learning", start: "2026-12-22", end: "2026-12-22" },
  { id: "xmas-ny", title: "聖誕節及新年假期", kind: "holiday", start: "2026-12-23", end: "2027-01-02" },
  { id: "new-year", title: "元旦", kind: "holiday", start: "2027-01-01", end: "2027-01-01" },
  { id: "exam-1", title: "第一次考試", kind: "exam", start: "2027-01-07", end: "2027-01-20" },
  { id: "s6-exam", title: "中六畢業考試", kind: "exam", start: "2027-01-07", end: "2027-01-20" },
  { id: "s1-brief-2027-01-09", title: "升中簡介會", kind: "other", start: "2027-01-09", end: "2027-01-09" },
  { id: "admin-2027-01-14", title: "聯校行政會", kind: "foundation", start: "2027-01-14", end: "2027-01-14" },
  { id: "staff-2027-01-15", title: "校務會議", kind: "other", start: "2027-01-15", end: "2027-01-15" },
  {
    id: "tour-bett",
    title: "英國 BETT Show",
    kind: "tour",
    start: "2027-01-17",
    end: "2027-01-27",
    detail: "學生交流團｜帶隊：伍卓鍵、盧澤境",
  },
  { id: "high-table", title: "高桌晚宴", kind: "other", start: "2027-01-29", end: "2027-01-29" },
  { id: "cny", title: "農曆新年假期", kind: "holiday", start: "2027-02-04", end: "2027-02-16" },
  { id: "pd-feb", title: "教師專業發展日", kind: "teacherPD", start: "2027-02-17", end: "2027-02-17" },
  { id: "life-planner", title: "人生規劃師", kind: "other", start: "2027-02-19", end: "2027-02-19" },
  { id: "s6-tea", title: "中六茶會", kind: "other", start: "2027-02-26", end: "2027-02-26" },
  { id: "parents-day", title: "家長日", kind: "learning", start: "2027-02-28", end: "2027-02-28" },
  { id: "parents-day-holiday", title: "家長日後假期", kind: "discretionary", start: "2027-03-01", end: "2027-03-01" },
  { id: "s6-stop", title: "中六開始停課", kind: "other", start: "2027-03-01", end: "2027-03-01" },
  { id: "joint-sports", title: "聯校陸運會", kind: "learning", start: "2027-03-04", end: "2027-03-04" },
  { id: "joint-sports-holiday", title: "聯校陸運會後假期", kind: "discretionary", start: "2027-03-05", end: "2027-03-05" },
  { id: "staff-2027-03-12", title: "校務會議", kind: "other", start: "2027-03-12", end: "2027-03-12" },
  { id: "easter", title: "復活節假期", kind: "holiday", start: "2027-03-22", end: "2027-03-29" },
  { id: "ching-ming", title: "清明節", kind: "holiday", start: "2027-04-05", end: "2027-04-05" },
  { id: "test-2", title: "第二次統測（S.4–S.5）", kind: "exam", start: "2027-04-06", end: "2027-04-09" },
  { id: "admin-2027-04-10", title: "聯校行政會", kind: "foundation", start: "2027-04-10", end: "2027-04-10" },
  { id: "s1-brief-2027-04-17", title: "升中簡介會（暫定）", kind: "other", start: "2027-04-17", end: "2027-04-17" },
  { id: "tin-shui-wai", title: "天水圍的孩子面試日", kind: "foundation", start: "2027-04-24", end: "2027-04-24" },
  { id: "labour-day", title: "勞動節", kind: "holiday", start: "2027-05-01", end: "2027-05-01" },
  { id: "dlw-may", title: "Deep Learning Week（環球自主學習週）", kind: "learning", start: "2027-05-03", end: "2027-05-07" },
  { id: "staff-2027-05-07", title: "校務會議", kind: "other", start: "2027-05-07", end: "2027-05-07" },
  { id: "buddha", title: "佛誕", kind: "holiday", start: "2027-05-13", end: "2027-05-13" },
  { id: "global-link", title: "Global Link International Conference", kind: "other", start: "2027-05-15", end: "2027-05-15" },
  { id: "graduation", title: "畢業典禮", kind: "learning", start: "2027-05-27", end: "2027-05-27" },
  { id: "graduation-holiday", title: "畢業典禮後假期", kind: "discretionary", start: "2027-05-28", end: "2027-05-28" },
  { id: "tuen-ng", title: "端午節", kind: "holiday", start: "2027-06-09", end: "2027-06-09" },
  { id: "exam-2", title: "第二次考試", kind: "exam", start: "2027-06-10", end: "2027-06-23" },
  { id: "staff-2027-06-18", title: "校務會議", kind: "other", start: "2027-06-18", end: "2027-06-18" },
  { id: "admin-2027-06-19", title: "聯校行政會", kind: "foundation", start: "2027-06-19", end: "2027-06-19" },
  { id: "stem-fair", title: "數理科技學習匯", kind: "other", start: "2027-06-26", end: "2027-06-26" },
  { id: "dlw-jun", title: "Deep Learning Week（環球自主學習週）", kind: "learning", start: "2027-06-28", end: "2027-07-02" },
  { id: "hksar", title: "香港特別行政區成立紀念日", kind: "holiday", start: "2027-07-01", end: "2027-07-01" },
  { id: "elite-award", title: "才藝薈萃菁英孩子頒獎禮", kind: "foundation", start: "2027-07-03", end: "2027-07-03" },
  { id: "s1-results", title: "中一收生放榜", kind: "learning", start: "2027-07-06", end: "2027-07-06" },
  { id: "staff-2027-07-06", title: "校務會議（下午）", kind: "other", start: "2027-07-06", end: "2027-07-06" },
  { id: "s3-rite", title: "中三成長禮", kind: "learning", start: "2027-07-07", end: "2027-07-07" },
  { id: "s1-reg", title: "中一新生註冊日", kind: "learning", start: "2027-07-08", end: "2027-07-09" },
  { id: "learning-award", title: "學習成果頒獎禮（上午）", kind: "learning", start: "2027-07-12", end: "2027-07-12" },
  { id: "next-year-reg", title: "下學年註冊", kind: "learning", start: "2027-07-12", end: "2027-07-12" },
  { id: "dse-results", title: "中六 DSE 放榜", kind: "other", start: "2027-07-14", end: "2027-07-14" },
  { id: "summer", title: "暑假", kind: "holiday", start: "2027-07-15", end: "2027-08-31" },
]

export const TENTATIVE_EVENTS: { month: string; title: string; kind: SchoolKind }[] = [
  { month: "2026-11", title: "聯校學習營", kind: "foundation" },
  { month: "2027-03", title: "聯校領袖培訓（待定）", kind: "foundation" },
  { month: "2027-07", title: "聯校辯論比賽（待定）", kind: "foundation" },
  { month: "2027-07", title: "聯校遊學團（待定）", kind: "foundation" },
]

const DISCRETIONARY_DAYS = new Set(["2026-09-30", "2027-03-01", "2027-03-05", "2027-05-28"])
const TEACHER_PD_DAYS = new Set(["2026-10-09", "2027-02-17"])
const HOLIDAY_RANGES: Array<[string, string]> = [
  ["2026-09-26", "2026-09-26"],
  ["2026-10-01", "2026-10-02"],
  ["2026-10-19", "2026-10-19"],
  ["2026-12-07", "2026-12-07"],
  ["2026-12-23", "2027-01-02"],
  ["2027-02-04", "2027-02-16"],
  ["2027-03-22", "2027-03-29"],
  ["2027-04-05", "2027-04-05"],
  ["2027-05-01", "2027-05-01"],
  ["2027-05-13", "2027-05-13"],
  ["2027-06-09", "2027-06-09"],
  ["2027-07-01", "2027-07-01"],
  ["2027-07-15", "2027-08-31"],
]

const holidayDays = new Set<string>()
for (const [start, end] of HOLIDAY_RANGES) {
  for (const key of eachDate(start, end)) holidayDays.add(key)
}

const eventsByDate = new Map<string, SchoolEvent[]>()
for (const event of SCHOOL_EVENTS) {
  for (const key of eachDate(event.start, event.end)) {
    const list = eventsByDate.get(key) ?? []
    list.push(event)
    eventsByDate.set(key, list)
  }
}

export function eachDate(start: string, end: string) {
  const keys: string[] = []
  const cursor = dateFromKey(start)
  const last = dateFromKey(end)
  while (cursor <= last) {
    keys.push(toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

function dateFromKey(key: string) {
  const { year, month, day } = parseDateKey(key)
  return new Date(year, month, day)
}

export function eventsOnDate(key: string) {
  return eventsByDate.get(key) ?? []
}

export function dayMark(key: string): DayMark | null {
  if (TEACHER_PD_DAYS.has(key)) return "teacherPD"
  if (DISCRETIONARY_DAYS.has(key)) return "discretionary"
  if (holidayDays.has(key)) return "holiday"
  return null
}

export function isExamDay(key: string) {
  return (eventsByDate.get(key) ?? []).some((event) => event.kind === "exam")
}

export function monthEvents(year: number, month: number) {
  const start = toDateKey(year, month, 1)
  const end = toDateKey(year, month, new Date(year, month + 1, 0).getDate())
  return SCHOOL_EVENTS.filter((event) => event.start <= end && event.end >= start)
}

export function tentativeForMonth(year: number, month: number) {
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`
  return TENTATIVE_EVENTS.filter((event) => event.month === prefix)
}

export function schoolWeekNumber(key: string) {
  const start = new Date(2026, 7, 30)
  const end = new Date(2027, 7, 31)
  const { year, month, day } = parseDateKey(key)
  const current = new Date(year, month, day)
  if (current < start || current > end) return null
  const diff = Math.floor((current.getTime() - start.getTime()) / 86400000)
  return Math.floor(diff / 7) + 1
}

export function formatEventRange(event: SchoolEvent) {
  if (event.start === event.end) return event.start.slice(5).replace("-", "/")
  return `${event.start.slice(5).replace("-", "/")}–${event.end.slice(5).replace("-", "/")}`
}

export function searchSchoolEvents(query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return SCHOOL_EVENTS.filter((event) => {
    const haystack = `${event.title} ${event.detail ?? ""}`.toLowerCase()
    return haystack.includes(needle)
  })
}
