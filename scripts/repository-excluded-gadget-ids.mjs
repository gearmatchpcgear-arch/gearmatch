import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
export const EXCLUDED_JSON_PATH = path.join(root, "data", "repository-excluded-gadget-ids.json")

export function readExcludedIds() {
  if (!fs.existsSync(EXCLUDED_JSON_PATH)) return []
  try {
    const parsed = JSON.parse(fs.readFileSync(EXCLUDED_JSON_PATH, "utf8"))
    if (!Array.isArray(parsed)) return []
    return [...new Set(parsed.filter((id) => typeof id === "string" && id.trim()))]
  } catch {
    return []
  }
}

export function writeExcludedIds(ids) {
  const unique = [...new Set(ids.filter((id) => typeof id === "string" && id.trim()))]
  fs.mkdirSync(path.dirname(EXCLUDED_JSON_PATH), { recursive: true })
  fs.writeFileSync(EXCLUDED_JSON_PATH, `${JSON.stringify(unique, null, 2)}\n`, "utf8")
  return unique
}

export function addExcludedIds(newIds) {
  const merged = [...new Set([...readExcludedIds(), ...newIds])]
  return writeExcludedIds(merged)
}

export function removeExcludedIds(idsToRemove) {
  const drop = new Set(idsToRemove)
  return writeExcludedIds(readExcludedIds().filter((id) => !drop.has(id)))
}
