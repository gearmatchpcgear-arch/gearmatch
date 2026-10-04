/**
 * Audit monitor card specs (画面サイズ / 解像度 / リフレッシュレート / VESA).
 * Uses compiled TS via tsx when available, or falls back to parsing source files.
 *
 * Usage:
 *   npx tsx scripts/audit-monitor-card-specs.mjs
 *   npx tsx scripts/audit-monitor-card-specs.mjs --json
 */
import { spawnSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const runner = `
import {
  allGadgets,
  getCardHighlights,
  isCardSpecValueFilled,
  countCardHighlightsFilled,
  gadgets,
} from "../lib/gadgets.ts"

const CARD_LABELS = ["画面サイズ", "解像度", "リフレッシュレート", "VESA"]
const monitorsAll = allGadgets.filter((g) => g.category === "monitor")
const monitorsListed = gadgets.filter((g) => g.category === "monitor")

function audit(list, label) {
  const bad = list.filter((g) => countCardHighlightsFilled(g) < 2)
  return { label, total: list.length, bad: bad.length, items: bad.map((g) => {
    const hl = getCardHighlights(g)
    return {
      id: g.id,
      name: g.name,
      asin: g.purchaseUrl?.match(/\\/dp\\/([A-Z0-9]{10})/)?.[1] ?? null,
      filled: countCardHighlightsFilled(g),
      missing: hl.filter((h) => !isCardSpecValueFilled(h.value)).map((h) => h.label),
      specs: Object.fromEntries(hl.map((h) => [h.label, h.value])),
    }
  })}
}

const result = {
  cardLabels: CARD_LABELS,
  allGadgets: audit(monitorsAll, "allGadgets"),
  listedGadgets: audit(monitorsListed, "gadgets"),
}
console.log(JSON.stringify(result, null, 2))
`

const tmp = join(__dirname, "_audit-monitor-card-specs-runner.ts")
import { writeFileSync, unlinkSync } from "fs"
writeFileSync(tmp, runner)

const proc = spawnSync("npx", ["--yes", "tsx", tmp], {
  cwd: ROOT,
  encoding: "utf8",
  shell: true,
  maxBuffer: 50 * 1024 * 1024,
})

try {
  unlinkSync(tmp)
} catch {}

if (proc.status !== 0) {
  console.error(proc.stderr || proc.stdout)
  process.exit(proc.status ?? 1)
}

const result = JSON.parse(proc.stdout)
if (process.argv.includes("--json")) {
  console.log(JSON.stringify(result, null, 2))
} else {
  console.log(`Monitor card spec audit (${result.cardLabels.join(" / ")})`)
  console.log(`allGadgets: ${result.allGadgets.total} total, ${result.allGadgets.bad} with 2+ missing`)
  console.log(`gadgets (listed): ${result.listedGadgets.total} total, ${result.listedGadgets.bad} with 2+ missing`)
  if (result.allGadgets.items.length) {
    console.log("\nMonitors to backfill or delete (allGadgets):")
    for (const item of result.allGadgets.items) {
      console.log(`  ${item.id} [${item.asin}] missing: ${item.missing.join(", ")} | ${item.name.slice(0, 60)}`)
    }
  }
}
