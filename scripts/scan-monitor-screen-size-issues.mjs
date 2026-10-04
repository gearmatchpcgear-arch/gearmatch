import { readFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")

function monitorDataFiles() {
  return readdirSync(LIB).filter(
    (f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.startsWith("monitor-arm"),
  )
}

function findBlockBounds(src, idx) {
  const start = src.lastIndexOf("\n  {", idx)
  if (start < 0) return null
  let end = src.indexOf("\n  },", idx)
  let endLen = "\n  },".length
  if (end < 0) {
    end = src.indexOf("\n  }\n", idx)
    endLen = "\n  }".length
  }
  if (end < 0) return null
  return { start, end, endLen, block: src.slice(start, end + endLen) }
}

function parseBlock(block, file) {
  const id = block.match(/id: "([^"]+)"/)?.[1] ?? ""
  const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  const highlight = block.match(/label: "画面サイズ", value: "([^"]*)"/)?.[1] ?? "—"
  const specSize = block.match(/label: "画面サイズ", value: "([^"]*)"/g)
  const amazonRank = block.match(/label: "Amazon検索", value: "PCモニター #(\d+)"/)?.[1]
  const tags = block.match(/monitorFilterTags: \[([^\]]*)\]/)?.[1] ?? ""
  return { id, name, tagline, highlight, amazonRank: amazonRank ? Number(amazonRank) : null, tags, file, block }
}

function parseInches(text) {
  if (!text || text === "—") return null
  const m = text.match(/([\d.]+)\s*(?:インチ|"|型|inch)/i)
  return m ? Number(m[1]) : null
}

function inferInchesFromText(text) {
  const hay = text
  if (/61\s*cm|61cm/i.test(hay)) return 23.8
  if (/68\.6\s*cm|68cm/i.test(hay)) return 27
  const cm = hay.match(/(\d{2,3})\s*cm\b/i)
  if (cm) {
    const n = Number(cm[1])
    if (n >= 54 && n <= 62) return 23.8
    if (n >= 63 && n <= 65) return 24
    if (n >= 66 && n <= 70) return 27
    if (n >= 75 && n <= 82) return 32
    if (n >= 85 && n <= 90) return 34
  }
  const quoted = hay.match(/(\d{2}(?:\.\d)?)\s*(?:インチ|"|型)/i)
  if (quoted) {
    const n = Number(quoted[1])
    if (n >= 10 && n <= 55) return n
  }
  const model = hay.match(/\b(24|27|32|34|38|40|43|45|49|55)(?:[A-Z]|[-\s"(]|$)/)
  if (model) return Number(model[1])
  return null
}

function sizeTag(inches) {
  if (inches == null) return []
  const tags = []
  if (inches <= 23.8) tags.push("size-238")
  else if (inches >= 24 && inches < 26.5) tags.push("size-24")
  else if (inches >= 26.5 && inches < 30) tags.push("size-27")
  if (inches >= 31.5) tags.push("size-315-plus")
  return tags
}

const issues = []
for (const file of monitorDataFiles()) {
  const src = readFileSync(join(LIB, file), "utf8")
  const re = /id: "mon-[^"]+"/g
  let m
  while ((m = re.exec(src)) !== null) {
    const bounds = findBlockBounds(src, m.index)
    if (!bounds) continue
    const item = parseBlock(bounds.block, file)
    const inches = parseInches(item.highlight)
    const rank = item.amazonRank
    const wrongRank = rank != null && inches != null && Math.abs(inches - rank) < 0.01
    const tooLarge = inches != null && inches >= 60
    const wrongTag =
      item.tags.includes("size-315-plus") &&
      inches != null &&
      inches < 31.5
    if (!wrongRank && !tooLarge && !wrongTag) continue
    const inferred = inferInchesFromText(`${item.name} ${item.tagline}`)
    issues.push({ ...item, inches, wrongRank, tooLarge, inferred, wantTags: sizeTag(inferred) })
  }
}

for (const i of issues) {
  console.log(
    `${i.file}\t${i.id}\t${i.inches}"\trank#${i.amazonRank}\t=> ${i.inferred}"\t${i.name.slice(0, 50)}`,
  )
}
console.error(`\nTotal issues: ${issues.length}`)
