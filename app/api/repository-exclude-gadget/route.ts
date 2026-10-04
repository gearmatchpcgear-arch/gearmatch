import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

export const runtime = "nodejs"

const EXCLUDED_JSON_PATH = path.join(process.cwd(), "data", "repository-excluded-gadget-ids.json")

function readExcludedIds(): string[] {
  try {
    const parsed = JSON.parse(readFileSync(EXCLUDED_JSON_PATH, "utf8"))
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter((id): id is string => typeof id === "string" && id.trim()))]
  } catch {
    return []
  }
}

function writeExcludedIds(ids: string[]): string[] {
  const unique = [...new Set(ids.filter((id) => typeof id === "string" && id.trim()))]
  mkdirSync(path.dirname(EXCLUDED_JSON_PATH), { recursive: true })
  writeFileSync(EXCLUDED_JSON_PATH, `${JSON.stringify(unique, null, 2)}\n`, "utf8")
  return unique
}

async function purgeFromSource(ids: string[]) {
  if (ids.length === 0) return { removedBlocks: 0, removedCsvRows: 0 }
  const mod = await import(
    pathToFileURL(path.join(process.cwd(), "scripts", "purge-gadget-lib.mjs")).href
  )
  return mod.purgeGadgetIdsFromLib(ids, { apply: true })
}

export async function POST(request: Request) {
  let body: { id?: string; ids?: string[]; purgeSource?: boolean }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const incoming = [
    ...(body.id ? [body.id] : []),
    ...(Array.isArray(body.ids) ? body.ids : []),
  ].filter((id): id is string => typeof id === "string" && id.trim().length > 0)

  if (incoming.length === 0) {
    return Response.json({ error: "Missing id or ids" }, { status: 400 })
  }

  const merged = writeExcludedIds([...readExcludedIds(), ...incoming])

  let purgeResult = { removedBlocks: 0, removedCsvRows: 0 }
  if (body.purgeSource !== false) {
    purgeResult = await purgeFromSource(incoming)
    if (purgeResult.removedBlocks > 0) {
      writeExcludedIds(merged.filter((id) => !incoming.includes(id)))
    }
  }

  return Response.json({
    ok: true,
    excluded: merged,
    purged: purgeResult,
  })
}
