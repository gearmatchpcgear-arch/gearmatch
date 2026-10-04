/**
 * monitor-asus-search-enriched.json → lib/monitor-asus-search.ts
 */
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import {
  buildGadgetsFromRaw,
  writeMonitorTs,
} from "./monitor-new-releases-generate-lib.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const ENRICHED_PATH = join(__dirname, "monitor-asus-search-enriched.json")
const RAW_PATH = join(__dirname, "monitor-asus-search-raw.json")
const OUT_PATH = join(ROOT, "lib", "monitor-asus-search.ts")
const OVERRIDES_PATH = join(__dirname, "monitor-asus-search-spec-overrides.json")

const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}

const source = existsSync(ENRICHED_PATH)
  ? JSON.parse(readFileSync(ENRICHED_PATH, "utf8"))
  : JSON.parse(readFileSync(RAW_PATH, "utf8"))

const monitors = source.monitors.map((item) => {
  const o = overrides[item.asin] ?? {}
  return { ...item, ...o }
})

const gadgets = buildGadgetsFromRaw(monitors, overrides, "mon-asus")

writeMonitorTs(
  OUT_PATH,
  "monitorAsusSearch",
  "/** Amazon.co.jp ASUS モニター検索・人気ランキング（2151982051 / ASUS）。 */",
  gadgets,
  "Amazon検索",
)

spawnSync(process.execPath, [join(__dirname, "apply-monitor-body-specs.mjs")], {
  stdio: "inherit",
})

console.log(`Wrote ${OUT_PATH} (${gadgets.length} monitors)`)
