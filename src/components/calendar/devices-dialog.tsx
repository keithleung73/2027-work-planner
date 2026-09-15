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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CloudSyncState } from "@/hooks/use-schedule"
import { SCHOOL_SITE_URL } from "@/lib/school-calendar"
import { buildShareUrl, isLocalPreview } from "@/lib/share"
import type { WorkItem } from "@/lib/types"
import { Check, Copy, Smartphone } from "lucide-react"

type DevicesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: WorkItem[]
  cloud: CloudSyncState
  onEnableCloud: (code: string) => Promise<void>
  onDisableCloud: () => void
  onGenerateCode: () => string
}

export function DevicesDialog({
  open,
  onOpenChange,
  items,
  cloud,
  onEnableCloud,
  onDisableCloud,
  onGenerateCode,
}: DevicesDialogProps) {
  const [copiedPage, setCopiedPage] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const [codeDraft, setCodeDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const local = typeof window !== "undefined" && isLocalPreview()

  async function copyText(value: string, kind: "page" | "share" | "code") {
    await navigator.clipboard.writeText(value)
    if (kind === "page") {
      setCopiedPage(true)
      window.setTimeout(() => setCopiedPage(false), 2000)
    } else if (kind === "share") {
      setCopiedShare(true)
      window.setTimeout(() => setCopiedShare(false), 2000)
    } else {
      setCopiedCode(true)
      window.setTimeout(() => setCopiedCode(false), 2000)
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

  async function enable() {
    setFormError(null)
    setBusy(true)
    try {
      await onEnableCloud(codeDraft || onGenerateCode())
      setCodeDraft("")
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "無法啟用同步。")
    } finally {
      setBusy(false)
    }
  }

  const synced = cloud.status === "on" || cloud.status === "error" || cloud.status === "connecting"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">同步到其他裝置</DialogTitle>
          <DialogDescription>
            官方校曆跟網站走。你自己寫的會議／備註用同步碼，同一組碼的裝置會自動更新。
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/40 px-3 py-3 text-sm leading-6">
          <p className="font-medium">個人安排雲端同步</p>
          <p className="mt-1 text-muted-foreground">
            在電腦設定一組同步碼，手機用同一個網站輸入同一組碼。之後在任何一部改備註，其他裝置重新整理或過一會兒就會見到。
          </p>
          {synced && cloud.code ? (
            <div className="mt-3 flex flex-col gap-2">
              <p>
                狀態：
                {cloud.status === "connecting" && "連接中…"}
                {cloud.status === "on" && "已同步"}
                {cloud.status === "error" && "同步失敗"}
              </p>
              <p className="break-all font-mono text-sm">{cloud.code}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => void copyText(cloud.code ?? "", "code")}>
                  {copiedCode ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                  {copiedCode ? "已複製同步碼" : "複製同步碼"}
                </Button>
                <Button type="button" variant="outline" onClick={onDisableCloud}>
                  停止此裝置同步
                </Button>
              </div>
              {cloud.message && <p className="text-destructive">{cloud.message}</p>}
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <Label htmlFor="sync-code">同步碼（至少 8 個字）</Label>
              <Input
                id="sync-code"
                value={codeDraft}
                onChange={(event) => setCodeDraft(event.target.value)}
                placeholder="例如 mkpc-ab3d-k7nq 或自訂密碼"
                autoComplete="off"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setCodeDraft(onGenerateCode())}>
                  產生同步碼
                </Button>
                <Button type="button" onClick={() => void enable()} disabled={busy}>
                  {busy ? "連接中…" : "啟用同步"}
                </Button>
              </div>
              {formError && <p className="text-destructive">{formError}</p>}
            </div>
          )}
        </div>

        <ol className="flex list-decimal flex-col gap-4 pl-4 text-sm leading-6">
          <li>
            <p className="font-medium">所有裝置都開正式網址</p>
            <p className="text-muted-foreground">
              {SCHOOL_SITE_URL}。不要用 127.0.0.1 或 Cursor 預覽。
            </p>
            {local && (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
                你現在開的是預覽。請用正式網址做同步。
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
            <p className="font-medium">備用：一次性同步連結</p>
            <p className="text-muted-foreground">
              不設同步碼時，仍可用連結或匯出 JSON 搬一次資料。
            </p>
            <Button type="button" variant="outline" className="mt-2" onClick={() => void copyShareLink()}>
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
