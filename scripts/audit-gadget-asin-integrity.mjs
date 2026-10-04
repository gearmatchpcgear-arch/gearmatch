/**
 * ASIN ↔ タイトル/スペック整合性監査
 * Usage:
 *   node scripts/audit-gadget-asin-integrity.mjs
 *   node scripts/audit-gadget-asin-integrity.mjs --verify-remote --limit 20
 */
import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const VERIFY = process.argv.includes("--verify-remote")
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 30)

const MAJOR_OEM = /富士通|Fujitsu|Dell|デル|HP|ヒューレット|Lenovo|レノボ|NEC|EIZO|エイゾー|BenQ|ASUS|エイスース|Acer|エイサー|LG|Samsung|サムスung|ViewSonic/i
const MOBILE_HINT = /モバイル|ポータブル|7インチ|7"|8インチ|10\.1|1024\s*[x×]\s*600|KIMOCA|EVICIV|ARZOPA|LUMPER/i
const REFURB = /整備済み|再生品|リファービッシュ/i

function parseGadgetsFromFile(filePath) {
  const src = readFileSync(filePath, "utf8")
  const rel = filePath.replace(LIB + "\\", "").replace(LIB + "/", "")
  const blocks = [...src.matchAll(/(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g)]
  const out = []
  for (const m of blocks) {
    const block = m[1]
    const id = block.match(/\bid: "([^"]+)"/)?.[1]
    const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
    if (!id || !asin) continue
    const name = block.match(/\bname: "([^"]*)"/)?.[1] ?? ""
    const brand = block.match(/\bbrand: "([^"]*)"/)?.[1] ?? ""
    const category = block.match(/category: "([^"]+)"/)?.[1] ?? ""
    const screenHl = block.match(/\{ label: "画面サイズ", value: "([^"]+)" \}/)?.[1]
    const screenSpec = block.match(/\{ label: "画面サイズ", value: "([^"]+)" \}/g)?.[1]
      ? null
      : null
    const specScreen = block.match(/label: "画面サイズ", value: "([^"]+)"/)?.[1]
    out.push({ file: rel, id, asin, name, brand, category, block, screenHl, specScreen })
  }
  return out
}

function normalizeTitle(s) {
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[【】]/g, "")
    .trim()
}

function titleSimilarity(a, b) {
  const ta = new Set(normalizeTitle(a).split(/\s+/).filter((w) => w.length > 1))
  const tb = new Set(normalizeTitle(b).split(/\s+/).filter((w) => w.length > 1))
  if (ta.size === 0 || tb.size === 0) return 0
  let inter = 0
  for (const w of ta) if (tb.has(w)) inter++
  return inter / Math.max(ta.size, tb.size)
}

function parseInches(raw) {
  if (!raw) return null
  const m = raw.match(/([\d.]+)\s*(?:インチ|")/)
  return m ? parseFloat(m[1]) : null
}

function heuristicFlags(g) {
  const flags = []
  const hay = `${g.name} ${g.brand}`
  const hlIn = parseInches(g.screenHl)
  const specIn = parseInches(g.specScreen)

  if (hlIn != null && specIn != null && Math.abs(hlIn - specIn) >= 1) {
    flags.push({
      type: "internal-size-mismatch",
      detail: `highlights ${g.screenHl} vs spec ${g.specScreen}`,
    })
  }

  if (MAJOR_OEM.test(g.name) && MOBILE_HINT.test(hay) && !REFURB.test(g.name)) {
    flags.push({ type: "oem-mobile-mix", detail: "major OEM title with mobile monitor hints" })
  }

  if (MAJOR_OEM.test(g.name) && hlIn != null && hlIn <= 15 && !MOBILE_HINT.test(g.name)) {
    flags.push({
      type: "oem-small-screen",
      detail: `OEM refurb/large name but ${hlIn}" in highlights`,
    })
  }

  if (MOBILE_HINT.test(g.name) && hlIn != null && hlIn >= 20 && !/モバイル|ポータブル|mobile/i.test(g.name)) {
    flags.push({ type: "mobile-name-large-screen", detail: `${g.name.slice(0, 40)}… vs ${g.screenHl}` })
  }

  return flags
}

async function fetchAmazonTitle(asin) {
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" },
  })
  const html = await res.text()
  const title =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
    null
  return title
}

const all = []
for (const f of readdirSync(LIB).filter((x) => x.endsWith(".ts"))) {
  all.push(...parseGadgetsFromFile(join(LIB, f)))
}

const byAsin = new Map()
for (const g of all) {
  const list = byAsin.get(g.asin) ?? []
  list.push(g)
  byAsin.set(g.asin, list)
}

console.log(`Scanned ${all.length} gadgets with ASIN across ${new Set(all.map((g) => g.file)).size} files\n`)

const duplicateConflicts = []
for (const [asin, items] of byAsin) {
  if (items.length < 2) continue
  const names = [...new Set(items.map((i) => i.name))]
  if (names.length > 1) {
    duplicateConflicts.push({ asin, items: items.map((i) => ({ file: i.file, id: i.id, name: i.name })) })
  }
}

const heuristicIssues = all.flatMap((g) =>
  heuristicFlags(g).map((f) => ({ ...f, file: g.file, id: g.id, asin: g.asin, name: g.name.slice(0, 70) })),
)

if (duplicateConflicts.length) {
  console.log("=== Duplicate ASIN, different titles ===")
  for (const d of duplicateConflicts.slice(0, 20)) {
    console.log(`\n${d.asin}:`)
    for (const i of d.items) console.log(`  ${i.file} ${i.id}: ${i.name.slice(0, 60)}`)
  }
  console.log(`\nTotal: ${duplicateConflicts.length}\n`)
}

if (heuristicIssues.length) {
  console.log("=== Heuristic flags ===")
  for (const h of heuristicIssues.slice(0, 40)) {
    console.log(`[${h.type}] ${h.asin} ${h.id} (${h.file})`)
    console.log(`  ${h.name}`)
    console.log(`  → ${h.detail}`)
  }
  console.log(`\nTotal: ${heuristicIssues.length}\n`)
}

let remoteIssues = []
if (VERIFY) {
  const suspects = [
    ...new Map(
      heuristicIssues.map((h) => [h.asin, all.find((g) => g.asin === h.asin)]),
    ).values(),
  ]
    .filter(Boolean)
    .slice(0, LIMIT)

  console.log(`=== Remote Amazon verify (${suspects.length}) ===`)
  for (const g of suspects) {
    try {
      const amazonTitle = await fetchAmazonTitle(g.asin)
      if (!amazonTitle) continue
      const sim = titleSimilarity(g.name, amazonTitle)
      if (sim < 0.25) {
        remoteIssues.push({
          asin: g.asin,
          id: g.id,
          file: g.file,
          local: g.name.slice(0, 80),
          amazon: amazonTitle.slice(0, 80),
          similarity: sim.toFixed(2),
        })
        console.log(`MISMATCH ${g.asin} sim=${sim.toFixed(2)}`)
        console.log(`  local:   ${g.name.slice(0, 70)}`)
        console.log(`  amazon:  ${amazonTitle.slice(0, 70)}`)
      }
      await new Promise((r) => setTimeout(r, 800))
    } catch (e) {
      console.warn(`fetch failed ${g.asin}:`, e.message)
    }
  }
}

const report = {
  scanned: all.length,
  duplicateConflicts: duplicateConflicts.length,
  heuristicIssues: heuristicIssues.length,
  remoteIssues: remoteIssues.length,
  duplicates: duplicateConflicts,
  heuristics: heuristicIssues,
  remote: remoteIssues,
  generatedAt: new Date().toISOString(),
}

const reportPath = join(__dirname, "asin-integrity-report.json")
writeFileSync(reportPath, JSON.stringify(report, null, 2))
console.log(`Report: ${reportPath}`)
