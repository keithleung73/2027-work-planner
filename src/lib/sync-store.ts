import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { isSyncEnvelope, type SyncEnvelope } from "@/lib/sync-crypto"

const GIST_DESCRIPTION = "mkpc-calendar-2026-2027-sync"
const SYNC_ID_PATTERN = /^[a-f0-9]{64}$/

export function isSyncId(value: string) {
  return SYNC_ID_PATTERN.test(value)
}

export function isSyncConfigured() {
  return Boolean(kvConfig() || gistToken() || canUseFileStore())
}

function kvConfig() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ""), token }
}

function gistToken() {
  return process.env.SYNC_TOKEN || process.env.GITHUB_TOKEN || ""
}

function canUseFileStore() {
  return process.env.VERCEL !== "1"
}

function kvKey(id: string) {
  return `mkpc-sync:${id}`
}

async function readFileStore(): Promise<Record<string, SyncEnvelope>> {
  const file = path.join(process.cwd(), "data", "cloud-sync.json")
  try {
    const raw = await readFile(file, "utf8")
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return {}
    const out: Record<string, SyncEnvelope> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (isSyncId(key) && isSyncEnvelope(value)) out[key] = value
    }
    return out
  } catch {
    return {}
  }
}

async function writeFileStore(store: Record<string, SyncEnvelope>) {
  const dir = path.join(process.cwd(), "data")
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, "cloud-sync.json"), JSON.stringify(store), "utf8")
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json" as const,
    Authorization: `Bearer ${token}`,
    "User-Agent": "mkpc-calendar-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  }
}

async function findGistId(token: string) {
  const response = await fetch("https://api.github.com/gists?per_page=100", {
    headers: githubHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error(`gist_list_${response.status}`)
  }
  const gists = (await response.json()) as Array<{ id?: string; description?: string }>
  return gists.find((gist) => gist.description === GIST_DESCRIPTION)?.id ?? null
}

async function readGistEnvelope(token: string, id: string) {
  const gistId = await findGistId(token)
  if (!gistId) return null
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: githubHeaders(token),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`gist_get_${response.status}`)
  const gist = (await response.json()) as {
    files?: Record<string, { content?: string } | undefined>
  }
  const raw = gist.files?.[`${id}.json`]?.content
  if (!raw) return null
  const parsed = JSON.parse(raw) as unknown
  return isSyncEnvelope(parsed) ? parsed : null
}

async function writeGistEnvelope(token: string, id: string, envelope: SyncEnvelope) {
  const gistId = await findGistId(token)
  const file = { [`${id}.json`]: { content: JSON.stringify(envelope) } }
  if (!gistId) {
    const response = await fetch("https://api.github.com/gists", {
      method: "POST",
        headers: { ...githubHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false,
        files: {
          "README.md": {
            content: "Encrypted personal notes for the MKPC 2026-2027 calendar. Not human-readable.",
          },
          ...file,
        },
      }),
    })
    if (!response.ok) throw new Error(`gist_create_${response.status}`)
    return
  }
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
        headers: { ...githubHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ files: file }),
  })
  if (!response.ok) throw new Error(`gist_patch_${response.status}`)
}

async function readKv(id: string) {
  const kv = kvConfig()
  if (!kv) return null
  const response = await fetch(`${kv.url}/get/${encodeURIComponent(kvKey(id))}`, {
    headers: { Authorization: `Bearer ${kv.token}` },
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`kv_get_${response.status}`)
  const payload = (await response.json()) as { result?: unknown }
  if (payload.result == null) return null
  if (isSyncEnvelope(payload.result)) return payload.result
  if (typeof payload.result === "string") {
    const parsed = JSON.parse(payload.result) as unknown
    return isSyncEnvelope(parsed) ? parsed : null
  }
  return null
}

async function writeKv(id: string, envelope: SyncEnvelope) {
  const kv = kvConfig()
  if (!kv) return false
  const response = await fetch(`${kv.url}/set/${encodeURIComponent(kvKey(id))}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${kv.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(envelope),
  })
  if (!response.ok) throw new Error(`kv_set_${response.status}`)
  return true
}

export async function readEnvelope(id: string): Promise<SyncEnvelope | null> {
  if (kvConfig()) return readKv(id)
  const token = gistToken()
  if (token) return readGistEnvelope(token, id)
  if (canUseFileStore()) {
    const store = await readFileStore()
    return store[id] ?? null
  }
  return null
}

export async function writeEnvelope(id: string, envelope: SyncEnvelope) {
  if (kvConfig()) {
    await writeKv(id, envelope)
    return
  }
  const token = gistToken()
  if (token) {
    await writeGistEnvelope(token, id, envelope)
    return
  }
  if (canUseFileStore()) {
    const store = await readFileStore()
    store[id] = envelope
    await writeFileStore(store)
    return
  }
  throw new Error("not_configured")
}
