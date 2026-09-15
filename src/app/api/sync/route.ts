import { NextResponse } from "next/server"
import { isSyncEnvelope } from "@/lib/sync-crypto"
import { isSyncConfigured, isSyncId, readEnvelope, writeEnvelope } from "@/lib/sync-store"

export const dynamic = "force-dynamic"

const MAX_BODY = 400_000

function errorResponse(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, code }, { status })
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? ""
  if (!isSyncId(id)) return errorResponse("同步識別碼不正確。", 400)
  if (!isSyncConfigured()) {
    return errorResponse("尚未設定雲端同步儲存。", 503, "not_configured")
  }
  try {
    const envelope = await readEnvelope(id)
    if (!envelope) return NextResponse.json({ envelope: null })
    return NextResponse.json({ envelope })
  } catch (error) {
    console.error(error)
    return errorResponse("讀取雲端資料失敗。", 502)
  }
}

export async function PUT(request: Request) {
  if (!isSyncConfigured()) {
    return errorResponse("尚未設定雲端同步儲存。", 503, "not_configured")
  }
  const raw = await request.text()
  if (raw.length > MAX_BODY) return errorResponse("同步資料太大。", 413)
  let body: unknown
  try {
    body = JSON.parse(raw) as unknown
  } catch {
    return errorResponse("資料格式不正確。", 400)
  }
  if (!body || typeof body !== "object") return errorResponse("資料格式不正確。", 400)
  const { id, envelope } = body as { id?: unknown; envelope?: unknown }
  if (typeof id !== "string" || !isSyncId(id) || !isSyncEnvelope(envelope)) {
    return errorResponse("同步資料不正確。", 400)
  }
  try {
    await writeEnvelope(id, envelope)
    return NextResponse.json({ ok: true, updatedAt: envelope.updatedAt })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message === "not_configured") {
      return errorResponse("尚未設定雲端同步儲存。", 503, "not_configured")
    }
    console.error(error)
    return errorResponse("寫入雲端資料失敗。", 502)
  }
}
