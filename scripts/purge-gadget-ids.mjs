/**
 * リポジトリ除外リストまたは --ids 指定のガジェットを lib から削除
 *
 * npx tsx scripts/purge-gadget-ids.mjs --from-repo-excluded --apply
 * npx tsx scripts/purge-gadget-ids.mjs --ids=chair-foo,m-bar --apply
 */
import { purgeGadgetIdsFromLib } from "./purge-gadget-lib.mjs"
import {
  readExcludedIds,
  removeExcludedIds,
} from "./repository-excluded-gadget-ids.mjs"

const apply = process.argv.includes("--apply")

function parseIdsArg() {
  const idsArg = process.argv.find((a) => a.startsWith("--ids="))
  if (!idsArg) return []
  return idsArg
    .slice("--ids=".length)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
}

let ids = parseIdsArg()
if (process.argv.includes("--from-repo-excluded")) {
  ids = [...new Set([...ids, ...readExcludedIds()])]
}

if (ids.length === 0) {
  console.log("No gadget ids to purge.")
  process.exit(0)
}

console.log(`Purging ${ids.length} id(s) (${apply ? "apply" : "dry-run"})`)
const result = purgeGadgetIdsFromLib(ids, { apply })
console.log(result)

if (apply && result.removedBlocks > 0) {
  removeExcludedIds(ids)
  console.log("Cleared purged ids from data/repository-excluded-gadget-ids.json")
}

if (!apply && result.removedBlocks > 0) {
  console.log("Re-run with --apply to write files")
}
