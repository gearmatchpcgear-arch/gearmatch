/**
 * Generate lib/monitor-search-22-120.ts from monitor-search-22-120-raw.json
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
const RAW_PATH = join(__dirname, "monitor-search-22-120-raw.json")
const OUT_PATH = join(ROOT, "lib", "monitor-search-22-120.ts")
const OVERRIDES_PATH = join(__dirname, "monitor-search-22-120-overrides.json")

const overrides = existsSync(OVERRIDES_PATH)
  ? JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"))
  : {}

const { monitors } = JSON.parse(readFileSync(RAW_PATH, "utf8"))
const gadgets = buildGadgetsFromRaw(monitors, overrides, "mon-s22120")

writeMonitorTs(
  OUT_PATH,
  "monitorSearch22120",
  "/** Amazon.co.jp ディスプレイ検索（22.0〜25.9インチ / 120Hz〜）。 */",
  gadgets,
  "Amazon検索",
)

spawnSync(process.execPath, [join(__dirname, "apply-monitor-body-specs.mjs")], {
  stdio: "inherit",
})

console.log(`Wrote ${OUT_PATH} (${gadgets.length} monitors)`)
