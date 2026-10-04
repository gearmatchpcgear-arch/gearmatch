/**
 * Verify monitor gadget titles against Amazon (sample or file).
 */
import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const fileArg = process.argv.find((a) => a.startsWith("--file="))?.split("=")[1]
const LIMIT = Number(process.argv.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 40)

function parseMonitors(filePath) {
  const src = readFileSync(filePath, "utf8")
  const rel = filePath.replace(LIB + "\\", "").replace(LIB + "/", "")
  const blocks = [...src.matchAll(/(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g)]
  return blocks
    .map((m) => m[1])
    .filter((b) => b.includes('category: "monitor"'))
    .map((block) => ({
      file: rel,
      id: block.match(/\bid: "([^"]+)"/)?.[1],
      asin: block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1],
      name: block.match(/\bname: "([^"]*)"/)?.[1] ?? "",
    }))
    .filter((g) => g.asin)
}

function similarity(a, b) {
  const tok = (s) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[【】]/g, "")
        .split(/[\s/・、]+/)
        .filter((w) => w.length > 1),
    )
  const ta = tok(a)
  const tb = tok(b)
  if (!ta.size || !tb.size) return 0
  let inter = 0
  for (const w of ta) if (tb.has(w)) inter++
  return inter / Math.max(ta.size, tb.size)
}

async function fetchTitle(asin) {
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "ja-JP,ja;q=0.9" },
  })
  const html = await res.text()
  return (
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim() ??
    null
  )
}

const files = fileArg
  ? [join(LIB, fileArg)]
  : readdirSync(LIB)
      .filter((f) => f.startsWith("monitor") && f.endsWith(".ts"))
      .map((f) => join(LIB, f))

const gadgets = files.flatMap(parseMonitors).slice(0, LIMIT)
const mismatches = []

for (const g of gadgets) {
  const amazon = await fetchTitle(g.asin)
  if (!amazon) {
    console.log(`SKIP ${g.asin} (no title)`)
    continue
  }
  const sim = similarity(g.name, amazon)
  if (sim < 0.22) {
    mismatches.push({ ...g, amazon: amazon.slice(0, 100), sim: sim.toFixed(2) })
    console.log(`MISMATCH sim=${sim.toFixed(2)} ${g.asin} ${g.id}`)
    console.log(`  local:  ${g.name.slice(0, 75)}`)
    console.log(`  amazon: ${amazon.slice(0, 75)}`)
  } else {
    console.log(`OK ${sim.toFixed(2)} ${g.asin}`)
  }
  await new Promise((r) => setTimeout(r, 700))
}

console.log(`\n${mismatches.length} mismatch(es) of ${gadgets.length} checked`)
