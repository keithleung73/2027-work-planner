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
  title: "萬鈞伯裘書院 2026–2027 校曆",
  description: "依校務手冊26-27-007顯示萬鈞伯裘書院校曆，並可在每天填寫個人工作安排。",
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
