import type { Metadata } from "next"
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google"
import "./globals.css"

const sans = Noto_Sans_TC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const serif = Noto_Serif_TC({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700"],
})

export const metadata: Metadata = {
  title: "2026–2027 工作月曆",
  description: "在 2026 與 2027 年的月曆上填寫每天的工作安排，資料保存在本機瀏覽器。",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
