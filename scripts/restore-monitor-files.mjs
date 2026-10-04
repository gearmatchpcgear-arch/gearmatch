/**
 * Regenerate monitor TS files from raw JSON (no Amazon fetch) after accidental removal.
 */
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { buildGadgetsFromRaw, writeMonitorTs } from "./monitor-new-releases-generate-lib.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const JOBS = [
  {
    raw: "monitor-lenovo-search-raw.json",
    overrides: "monitor-lenovo-search-spec-overrides.json",
    imageCache: "monitor-lenovo-search-image-cache.json",
    out: "lib/monitor-lenovo-search.ts",
    exportName: "monitorLenovoSearch",
    idPrefix: "mon-lenovo",
    comment: "/** Amazon.co.jp Lenovo ディスプレイ検索（22.0～25.9インチ / Lenovo）。 */",
    rankLabel: "Amazon検索",
  },
  {
    raw: "monitor-lenovo-search-page2-raw.json",
    overrides: "monitor-lenovo-search-page2-spec-overrides.json",
    imageCache: "monitor-lenovo-search-page2-image-cache.json",
    out: "lib/monitor-lenovo-search-page2.ts",
    exportName: "monitorLenovoSearchPage2",
    idPrefix: "mon-lenovo-p2",
    comment: "/** Amazon.co.jp Lenovo ディスプレイ検索 pg2（22.0～25.9インチ / Lenovo）。 */",
    rankLabel: "Amazon検索",
  },
  {
    raw: "monitor-lenovo-search-26plus-raw.json",
    overrides: "monitor-lenovo-search-26plus-spec-overrides.json",
    imageCache: "monitor-lenovo-search-26plus-image-cache.json",
    out: "lib/monitor-lenovo-search-26plus.ts",
    exportName: "monitorLenovoSearch26Plus",
    idPrefix: "mon-lenovo-26",
    comment: "/** Amazon.co.jp Lenovo ディスプレイ検索（26インチ以上 / Lenovo）。 */",
    rankLabel: "Amazon検索",
  },
  {
    raw: "monitor-lenovo-search-26plus-page2-raw.json",
    overrides: "monitor-lenovo-search-26plus-page2-spec-overrides.json",
    imageCache: "monitor-lenovo-search-26plus-page2-image-cache.json",
    out: "lib/monitor-lenovo-search-26plus-page2.ts",
    exportName: "monitorLenovoSearch26PlusPage2",
    idPrefix: "mon-lenovo-26p2",
    comment: "/** Amazon.co.jp Lenovo ディスプレイ検索 pg2（26インチ以上 / Lenovo）。 */",
    rankLabel: "Amazon検索",
  },
  {
    raw: "monitor-lenovo-search-1822-raw.json",
    overrides: "monitor-lenovo-search-1822-spec-overrides.json",
    imageCache: "monitor-lenovo-search-1822-image-cache.json",
    out: "lib/monitor-lenovo-search-1822.ts",
    exportName: "monitorLenovoSearch1822",
    idPrefix: "mon-lenovo-1822",
    comment: "/** Amazon.co.jp Lenovo ディスプレイ検索（18.0～22.0インチ / Lenovo）。 */",
    rankLabel: "Amazon検索",
  },
]

function loadJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {}
}

for (const job of JOBS) {
  const rawPath = join(__dirname, job.raw)
  if (!existsSync(rawPath)) {
    console.warn(`skip missing ${job.raw}`)
    continue
  }

  const { monitors } = JSON.parse(readFileSync(rawPath, "utf8"))
  const overrides = loadJson(join(__dirname, job.overrides))
  const imageCache = loadJson(join(__dirname, job.imageCache))

  const merged = monitors.map((item) => {
    const cached = imageCache[item.asin]?.image
    const image = normalizeAmazonImageUrl(cached || item.image || "")
    return { ...item, image }
  })

  const gadgets = buildGadgetsFromRaw(merged, overrides, job.idPrefix)
  writeMonitorTs(
    join(ROOT, job.out),
    job.exportName,
    job.comment,
    gadgets,
    job.rankLabel,
  )
  console.log(`Wrote ${gadgets.length} -> ${job.out}`)
}

spawnSync(process.execPath, [join(__dirname, "generate-monitor-most-gifted.mjs")], {
  stdio: "inherit",
})
spawnSync(process.execPath, [join(__dirname, "generate-monitor-lg-display.mjs")], {
  stdio: "inherit",
})
spawnSync(process.execPath, [join(__dirname, "generate-monitor-search-22-120.mjs")], {
  stdio: "inherit",
})

console.log("Restore complete")
