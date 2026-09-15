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
import { SCHOOL_SITE_URL } from "@/lib/school-calendar"
import { buildShareUrl, isLocalPreview } from "@/lib/share"
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
          <DialogTitle className="font-heading text-xl">一份網址，所有裝置都一樣</DialogTitle>
          <DialogDescription>
            正式網站是 {SCHOOL_SITE_URL}。電腦、手機、同事都開這一個，官方校曆更新後重新整理即可看到。
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 px-3 py-3 text-sm leading-6">
          <p className="font-medium">會自動同步的</p>
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            <li>學校假期、考試、交流團、校務活動</li>
            <li>圖例、月曆與年曆</li>
            <li>官方 PDF</li>
          </ul>
          <p className="mt-3 font-medium">不會自動同步的</p>
          <p className="mt-1 text-muted-foreground">
            你在某一裝置「新增安排」寫下的會議或備註，只存在該瀏覽器。要用「複製同步連結」或「匯出／匯入」帶到另一部裝置。
          </p>
        </div>

        <ol className="flex list-decimal flex-col gap-4 pl-4 text-sm leading-6">
          <li>
            <p className="font-medium">所有裝置都開正式網址</p>
            <p className="text-muted-foreground">
              不要用 127.0.0.1 或 Cursor 預覽給其他人。iPhone：Safari 打開後分享 → 加入主畫面。Android：Chrome 選單 → 加到主畫面。
            </p>
            {local && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
                你現在開的是預覽，只在這部電腦有效。請改開正式網址。
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-2"
              onClick={() => void copyText(SCHOOL_SITE_URL, "page")}
            >
              {copiedPage ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
              {copiedPage ? "已複製正式網址" : "複製正式網址"}
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
