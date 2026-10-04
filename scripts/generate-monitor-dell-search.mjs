/**
 * monitor-dell-search-raw.json → lib/monitor-dell-search.ts
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
const RAW_PATH = join(__dirname, "monitor-dell-search-raw.json")
const OUT_PATH = join(ROOT, "lib", "monitor-dell-search.ts")
const OVERRIDES_PATH = join(__dirname, "monitor-dell-search-spec-overrides.json")

const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}

const { monitors } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
const merged = monitors.map((item) => {
  const o = overrides[item.asin] ?? {}
  return { ...item, ...o }
})

const gadgets = buildGadgetsFromRaw(merged, overrides, "mon-dell")

writeMonitorTs(
  OUT_PATH,
  "monitorDellSearch",
  "/** Amazon.co.jp Dell モニター検索（2151982051 / Dell）。 */",
  gadgets,
  "Amazon検索",
)

spawnSync(process.execPath, [join(__dirname, "apply-monitor-body-specs.mjs")], {
  stdio: "inherit",
})

console.log(`Wrote ${OUT_PATH} (${gadgets.length} monitors)`)
