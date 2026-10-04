/**
 * ブラウザ localStorage に残っているゴミ箱 ID を JSON に取り込み、lib から purge
 *
 * Usage:
 *   npx tsx scripts/migrate-legacy-hidden-gadget-ids.mjs --file=hidden.json --apply
 *
 * hidden.json は DevTools で:
 *   copy(localStorage.getItem('gadget-comparison:hidden-gadget-ids'))
 */
import fs from "node:fs"
import { addExcludedIds } from "./repository-excluded-gadget-ids.mjs"
import { purgeGadgetIdsFromLib } from "./purge-gadget-lib.mjs"
import { removeExcludedIds } from "./repository-excluded-gadget-ids.mjs"

const apply = process.argv.includes("--apply")
const fileArg = process.argv.find((a) => a.startsWith("--file="))
if (!fileArg) {
  console.error("Usage: npx tsx scripts/migrate-legacy-hidden-gadget-ids.mjs --file=hidden.json [--apply]")
  process.exit(1)
}

const raw = fs.readFileSync(fileArg.slice("--file=".length), "utf8").trim()
const parsed = JSON.parse(raw)
const ids = [...new Set((Array.isArray(parsed) ? parsed : []).filter((id) => typeof id === "string"))]
console.log(`Legacy hidden ids: ${ids.length}`)

if (ids.length === 0) process.exit(0)

addExcludedIds(ids)
const result = purgeGadgetIdsFromLib(ids, { apply })
console.log(result)

if (apply && result.removedBlocks > 0) {
  removeExcludedIds(ids)
  console.log("Purged from lib and cleared repository-excluded list for migrated ids")
} else if (!apply) {
  console.log("Re-run with --apply to write lib files")
}
