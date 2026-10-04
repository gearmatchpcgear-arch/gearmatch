/** Patch cache entries missing weight/button using title text extraction, then regenerate TS. */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import {
  extractWeightFromText,
  extractButtonCountFromText,
} from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_PATH = join(__dirname, "mouse-specs-cache.json")
const DASH = "—"
const cache = JSON.parse(readFileSync(CACHE_PATH, "utf8"))

let wFixed = 0
let bFixed = 0

for (const entry of Object.values(cache)) {
  const specs = entry.specs
  const title = entry.title ?? ""
  const hay = title

  if (!specs?.highlights) continue

  if (!specs.highlights.weight || specs.highlights.weight === DASH) {
    const w = extractWeightFromText(hay)
    if (w) {
      specs.highlights.weight = w
      const idx = specs.sizeRows.findIndex((r) => r.label === "重量")
      if (idx >= 0) specs.sizeRows[idx].value = w
      else specs.sizeRows.push({ label: "重量", value: w })
      wFixed++
    }
  }

  const btnRow = specs.sensorRows.find((r) => r.label === "ボタン数")
  const btnMissing = !btnRow?.value || btnRow.value === DASH
  if (btnMissing) {
    const c = extractButtonCountFromText(hay)
    if (c) {
      if (btnRow) btnRow.value = String(c)
      else specs.sensorRows.push({ label: "ボタン数", value: String(c) })
      if (!specs.meta) specs.meta = {}
      specs.meta.buttonCount = c
      bFixed++
    }
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n")
console.log(`Text patch: weight=${wFixed}, button=${bFixed}`)

for (const script of ["merge-popular-brands.mjs", "merge-bestsellers.mjs"]) {
  spawnSync("node", [join(__dirname, script)], { stdio: "inherit", cwd: join(__dirname, "..") })
}

spawnSync("node", [join(__dirname, "audit-weight-buttons.mjs")], { stdio: "inherit" })
