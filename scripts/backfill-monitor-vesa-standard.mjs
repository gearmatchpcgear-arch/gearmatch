/**
 * lib/monitor*.ts の全モニターに vesaStandard プロパティを推論・追加
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMonitorVesaStandardFromBlock } from "./monitor-vesa-standard.mjs"
import { resolveMonitorVesaKnown } from "./monitor-vesa-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}

const SKIP = new Set([
  "monitor-filter-tags.ts",
  "monitor-detail-specs.ts",
  "monitor-arm-filter-tags.ts",
  "monitor-arm-bestsellers.ts",
  "monitor-arm-new-releases.ts",
  "monitor-arm-new-releases-page2.ts",
])

function vesaFilterTags(vesa) {
  const tags = []
  if (vesa === "非対応") tags.push("vesa-none")
  else {
    if (/75\s*[x×]\s*75/.test(vesa)) tags.push("vesa-75")
    if (/100\s*[x×]\s*100/.test(vesa)) tags.push("vesa-100")
    if (/200|以上/.test(vesa)) tags.push("vesa-200-plus")
  }
  return tags
}

function syncVesaTags(block, vesa) {
  const tagRe = /monitorFilterTags: \[([^\]]*)\]/
  const m = block.match(tagRe)
  if (!m) return block
  const existing = m[1]
    .split(",")
    .map((s) => s.trim().replace(/"/g, ""))
    .filter(Boolean)
    .filter((t) => !/^vesa-/.test(t))
  const merged = [...existing, ...vesaFilterTags(vesa)]
  return block.replace(tagRe, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
}

function patchBlock(block) {
  if (!block.includes('category: "monitor"')) return block

  const asin = block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/)?.[1]
  const name = block.match(/^\s*name:\s*"([^"]*)"/m)?.[1] ?? ""
  const tagline = block.match(/^\s*tagline:\s*"([^"]*)"/m)?.[1] ?? ""
  const hay = `${name} ${tagline} ${block.replace(/\\"/g, '"').replace(/\n/g, " ")}`
  const cached = asin ? cache[asin]?.vesaStandard : null
  const known = resolveMonitorVesaKnown(asin, hay)
  const vesa =
    known ??
    (cached && cached !== "—" ? cached : inferMonitorVesaStandardFromBlock(block))
  const vesaLine = `    vesaStandard: ${JSON.stringify(vesa)},`

  let next = block
  if (/^\s*vesaStandard:/m.test(next)) {
    next = next.replace(/^\s*vesaStandard:.*$/m, vesaLine)
  } else {
    const insertAfter = next.match(
      /(^\s*(?:monitorFilterTags:.*,\n|purchaseUrl:.*,\n))/m,
    )
    if (insertAfter) {
      const idx = next.indexOf(insertAfter[0]) + insertAfter[0].length
      next = next.slice(0, idx) + vesaLine + "\n" + next.slice(idx)
    } else {
      const purchaseMatch = next.match(/^\s*purchaseUrl:.*,\n/m)
      if (purchaseMatch) {
        const idx = next.indexOf(purchaseMatch[0]) + purchaseMatch[0].length
        next = next.slice(0, idx) + vesaLine + "\n" + next.slice(idx)
      }
    }
  }

  next = syncVesaTags(next, vesa)
  return next
}

function patchFile(filePath) {
  let src = readFileSync(filePath, "utf8")
  let changed = 0

  const blockRe =
    /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g

  src = src.replace(blockRe, (block) => {
    const next = patchBlock(block)
    if (next !== block) changed++
    return next
  })

  if (changed > 0) writeFileSync(filePath, src)
  return changed
}

let total = 0
const targets = [
  ...readdirSync(LIB).filter(
    (file) =>
      file.startsWith("monitor") &&
      file.endsWith(".ts") &&
      !SKIP.has(file) &&
      !file.startsWith("monitor-arm"),
  ).map((file) => join(LIB, file)),
  join(LIB, "gadgets.ts"),
]
for (const filePath of targets) {
  const n = patchFile(filePath)
  if (n > 0) {
    console.log(`${filePath.split(/[/\\]/).pop()}: ${n}`)
    total += n
  }
}

console.log(`Total patched: ${total}`)
