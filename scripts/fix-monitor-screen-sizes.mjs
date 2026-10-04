/**
 * Fix monitor screen sizes polluted by Amazon search rank (PCモニター #80 -> 80").
 *
 * Usage:
 *   node scripts/fix-monitor-screen-sizes.mjs           # dry-run
 *   node scripts/fix-monitor-screen-sizes.mjs --apply
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const apply = process.argv.includes("--apply")

function monitorDataFiles() {
  return readdirSync(LIB).filter(
    (f) => f.startsWith("monitor") && f.endsWith(".ts") && !f.startsWith("monitor-arm"),
  )
}

function parseInches(text) {
  if (!text || text === "—") return null
  const unescaped = text.replace(/\\"/g, '"')
  const m = unescaped.match(/([\d.]+)\s*(?:インチ|"|型|inch)/i)
  return m ? Number(m[1]) : null
}

function tsQuote(inches) {
  const display = formatInches(inches)
  return display.replace(/"/g, '\\"')
}

function inferInches(name, tagline) {
  const hay = `${name} ${tagline}`

  const quoted = [...hay.matchAll(/(\d{2}(?:\.\d)?)\s*(?:インチ|"|型|inch)/gi)]
  for (const m of quoted) {
    const n = Number(m[1])
    if (n >= 10 && n <= 55) return n
  }

  if (/23\.8\s*(?:Type|型|インチ|")/i.test(hay)) return 23.8
  if (/61\s*cm|61cm/i.test(hay)) return 23.8
  if (/80\s*cm|80cm/i.test(hay)) return 32
  if (/68\.6\s*cm|68cm/i.test(hay)) return 27

  const typeInch = hay.match(/(\d{2}(?:\.\d)?)\s*Type/i)
  if (typeInch) {
    const n = Number(typeInch[1])
    if (n >= 10 && n <= 55) return n
  }

  if (/20\.1\s*IN|\bL201\b/i.test(hay)) return 20.1
  if (/\bT32|\b32p-30|\b32Q|\bLOQ 32/i.test(hay)) return 32
  if (/\bT22|\bT23|\b21\.5/i.test(hay)) return 21.5
  if (/\bE27|\bP27|\bS27|\bT27|\b27\s*QHD/i.test(hay)) return 27
  if (/\bVZ249|\b249HR|\bVA249|\bBE249|\bV247/i.test(hay)) return 23.8

  if (/\b(P24|T24|U24|VA24|BE249|V247|LS24|S24|24U|H24|G24|CB24|VP24|SE24|XG24|249Q)/i.test(hay)) {
    return /23\.8|61\s*cm|61cm/i.test(hay) ? 23.8 : 24
  }

  if (/\b27\s*(?:インチ|"|型|inch)|\bP27|\bS27|27GP|27UN|27GN|68\.6\s*cm/i.test(hay)) return 27
  if (/\b32\s*(?:インチ|"|型|inch)|\bP32|LS32|32UN|32GP|S32GF/i.test(hay) && /LS24|24/i.test(hay)) return 24
  if (/\b32\s*(?:インチ|"|型|inch)|\bP32|LS32|32UN|32GP/i.test(hay)) return 32
  if (/\b34\s*(?:インチ|"|型|inch)|\bU34|34GP|34WN/i.test(hay)) return 34

  return null
}

function sizeTags(inches) {
  if (inches == null) return []
  const tags = []
  if (inches <= 23.8) {
    tags.push("size-238", "size-24")
  } else if (inches >= 24 && inches < 26.5) {
    tags.push("size-24")
  } else if (inches >= 26.5 && inches < 30) {
    tags.push("size-27")
  }
  if (inches >= 31.5) tags.push("size-315-plus")
  return tags
}

function formatInches(inches) {
  if (inches == null) return null
  return Number.isInteger(inches) ? `${inches}"` : `${inches}"`
}

function formatInchesJa(inches) {
  if (inches == null) return null
  return Number.isInteger(inches) ? `${inches} インチ` : `${inches} インチ`
}

function fixBlock(block) {
  if (!/category: "monitor"/.test(block)) return { block, changed: false }

  const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  const rank = block.match(/label: "Amazon検索", value: "PCモニター #(\d+)"/)?.[1]
  const rankNum = rank ? Number(rank) : null

  const highlightRe = /(\{ label: "画面サイズ", value: ")((?:[^"\\]|\\.)*)(" \})/
  const highlightMatch = block.match(highlightRe)
  if (!highlightMatch) return { block, changed: false }

  const current = parseInches(highlightMatch[2])
  const inferred = inferInches(name, tagline)
  const wrongRank =
    rankNum != null &&
    current != null &&
    Math.abs(current - rankNum) < 0.01 &&
    inferred != null &&
    Math.abs(inferred - current) > 0.4
  const tooLarge = current != null && current >= 60
  const hasWrong315 =
    block.includes("size-315-plus") &&
    current != null &&
    current < 31.5

  if (!wrongRank && !tooLarge && !hasWrong315) return { block, changed: false }

  if (inferred == null) {
    console.warn(`  SKIP (no infer): ${name.slice(0, 50)}`)
    return { block, changed: false }
  }

  let next = block
  next = next.replace(highlightRe, `$1${tsQuote(inferred)}$3`)

  // Fix spec group 画面サイズ when unset or wrong
  next = next.replace(
    /(title: "ディスプレイ"[\s\S]*?label: "画面サイズ", value: ")((?:[^"\\]|\\.)*)(")/,
    (full, pre, val, post) => {
      const vInches = parseInches(val)
      if (val === "—" || vInches == null || vInches >= 60 || (rankNum != null && vInches === rankNum)) {
        return `${pre}${formatInchesJa(inferred)}${post}`
      }
      return full
    },
  )

  const SIZE_TAGS = ["size-238", "size-24", "size-27", "size-315-plus"]
  const tagMatch = next.match(/monitorFilterTags: \[([^\]]*)\]/)
  if (tagMatch) {
    const existing = tagMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/^"|"$/g, ""))
      .filter(Boolean)
      .filter((t) => !SIZE_TAGS.includes(t))
    const merged = [...new Set([...sizeTags(inferred), ...existing])]
    next = next.replace(/monitorFilterTags: \[[^\]]*\]/, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
  } else if (inferred != null) {
    next = next.replace(
      /(purchaseUrl: "[^"]+",\n)/,
      `$1    monitorFilterTags: [${sizeTags(inferred).map((t) => `"${t}"`).join(",")}],\n`,
    )
  }

  return { block: next, changed: true, inferred, name: name.slice(0, 55), from: current }
}

function fixFile(file) {
  const path = join(LIB, file)
  let src = readFileSync(path, "utf8").replace(/\r\n/g, "\n")
  const parts = src.split(/(?=\n  \{\n    id: "mon-)/)
  let changes = 0
  const fixed = parts.map((part, idx) => {
    if (idx === 0) return part
    const { block, changed, inferred, name, from } = fixBlock(part)
    if (changed) {
      changes++
      console.log(`  ${file}: ${from}" -> ${inferred}"  ${name}`)
    }
    return block
  })
  if (changes && apply) writeFileSync(path, fixed.join(""))
  return changes
}

let total = 0
for (const file of monitorDataFiles()) {
  total += fixFile(file)
}
console.log(`\n${apply ? "Applied" : "Dry-run"}: ${total} block(s) fixed`)
if (!apply && total > 0) console.log("Pass --apply to write changes.")
