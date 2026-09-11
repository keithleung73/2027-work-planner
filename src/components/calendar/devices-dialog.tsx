"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { buildShareUrl, isLocalPreview, siteUrl } from "@/lib/share"
import type { WorkItem } from "@/lib/types"
import { Check, Copy, Smartphone } from "lucide-react"

type DevicesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: WorkItem[]
}

export function DevicesDialog({ open, onOpenChange, items }: DevicesDialogProps) {
  const [copiedPage, setCopiedPage] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const local = typeof window !== "undefined" && isLocalPreview()

  async function copyText(value: string, kind: "page" | "share") {
    await navigator.clipboard.writeText(value)
    if (kind === "page") {
      setCopiedPage(true)
      window.setTimeout(() => setCopiedPage(false), 2000)
    } else {
      setCopiedShare(true)
      window.setTimeout(() => setCopiedShare(false), 2000)
    }
  }

  async function copyShareLink() {
    setShareError(null)
    try {
      const url = await buildShareUrl(items)
      if (url.length > 12000) {
        setShareError("備註太多，連結會太長。請改用「匯出」JSON，再在另一部裝置「匯入」。")
        return
      }
      await copyText(url, "share")
    } catch {
      setShareError("無法產生同步連結。請改用匯出 JSON。")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">用網頁就適合，不必做獨立 App</DialogTitle>
          <DialogDescription>
            這是校曆網站，電腦、手機用瀏覽器打開即可。同事分享一個網址就能看官方假期與考試，不必到 App Store 下載。
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 px-3 py-3 text-sm leading-6">
          <p className="font-medium">為何用網頁</p>
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            <li>一份網址，電腦同手機都用到，唔使分開做 iPhone / Android App</li>
            <li>官方校曆更新一次，所有裝置即時見到</li>
            <li>唔使審批上架，亦唔使佔用手機安裝空間</li>
            <li>想似 App：用瀏覽器打開後「加到主畫面」即可</li>
          </ul>
        </div>

        <ol className="flex list-decimal flex-col gap-4 pl-4 text-sm leading-6">
          <li>
            <p className="font-medium">把網站放到互聯網（一次就可以）</p>
            <p className="text-muted-foreground">
              在 Cursor 先建立 GitHub 倉庫，然後到{" "}
              <a href="https://vercel.com/new" target="_blank" rel="noreferrer">
                vercel.com/new
              </a>{" "}
              用 GitHub 登入，匯入這個專案並免費部署。完成後會得到類似{" "}
              <code className="rounded bg-muted px-1">https://你的專案.vercel.app</code>{" "}
              的網址。
            </p>
            {local && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
                現在這個預覽只在這次雲端工作階段有效，手機打不開 127.0.0.1。部署到 Vercel 之後，任何裝置都能開。
              </p>
            )}
          </li>
          <li>
            <p className="font-medium">用同一個網址開所有裝置</p>
            <p className="text-muted-foreground">
              iPhone：Safari 打開網址 → 分享 → 加入主畫面。Android：Chrome 打開 → 選單 → 加到主畫面。之後圖示會像 App 一樣。官方假期、考試、活動會自動顯示。
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => void copyText(siteUrl(), "page")}
            >
              {copiedPage ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
              {copiedPage ? "已複製網址" : "複製目前網址"}
            </Button>
          </li>
          <li>
            <p className="font-medium">把個人工作安排帶到另一部裝置</p>
            <p className="text-muted-foreground">
              產生同步連結，傳給自己（訊息、電郵或備忘錄），在另一部裝置打開。會覆蓋該裝置現有的個人備註，校曆活動不受影響。
            </p>
            <Button type="button" className="mt-2" onClick={() => void copyShareLink()}>
              {copiedShare ? <Check data-icon="inline-start" /> : <Smartphone data-icon="inline-start" />}
              {copiedShare ? "已複製同步連結" : "複製同步連結"}
            </Button>
            {shareError && <p className="mt-2 text-destructive">{shareError}</p>}
          </li>
        </ol>
      </DialogContent>
    </Dialog>
  )
}
