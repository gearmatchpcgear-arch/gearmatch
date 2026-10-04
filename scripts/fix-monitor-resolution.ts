/**
 * Fix monitor resolution: ASIN overrides, tag conflicts, missing tags, display normalization.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const DRY = process.argv.includes("--dry-run")

const RES_TAGS = ["res-fhd", "res-wqhd", "res-uwqhd", "res-4k", "res-6k", "res-5k2k", "res-dqhd"]

const DISPLAY = {
  "res-fhd": "FHD (1920×1080)",
  "res-wqhd": "QHD (2560 x 1440)",
  "res-uwqhd": "UWQHD (3440×1440)",
  "res-4k": "4K (3840×2160)",
  "res-6k": "6K（6016 x 3384）",
  "res-5k2k": "5K2K (5120×2160)",
  "res-dqhd": "5K DQHD (5120×1440)",
}

const SPEC = {
  "res-fhd": "1920 x 1080 (FHD)",
  "res-wqhd": "2560 x 1440 (QHD)",
  "res-uwqhd": "3440 x 1440 (UWQHD)",
  "res-4k": "3840 x 2160 (4K UHD)",
  "res-6k": "6016 x 3384 (6K)",
  "res-5k2k": "5120 x 2160 (5K2K)",
  "res-dqhd": "5120 x 1440 (5K DQHD)",
}

/** Amazon-verified ASIN → tag */
const ASIN_OVERRIDES = {
  B0HB3KBD21: "res-wqhd",
}

const MONITOR_FILES = readdirSync(LIB)
  .filter(
    (f) =>
      f.startsWith("monitor-") &&
      f.endsWith(".ts") &&
      !f.includes("arm") &&
      !f.includes("filter") &&
      !f.includes("detail") &&
      !f.includes("vesa"),
  )
  .map((f) => join(LIB, f))

function inferTagFromHay(hay) {
  const t = String(hay)
  if (/6016\s*[x×]\s*3384|\b6k\b/i.test(t)) return "res-6k"
  if (/5120\s*[x×]\s*2160|5k2k/i.test(t)) return "res-5k2k"
  if (/5120\s*[x×]\s*1440|5k\s*dqhd|\bdqhd\b/i.test(t)) return "res-dqhd"
  if (/3840\s*[x×]\s*2160|\b4k\b|４Ｋ/i.test(t)) return "res-4k"
  if (/3440\s*[x×]\s*1440|uwqhd|ultrawide\s*qhd/i.test(t)) return "res-uwqhd"
  if (/2560\s*[x×]\s*1440|2\.5k|2k\/2\.5k|1440p|(?<![uw-])qhd\b|(?<![uw-])wqhd\b/i.test(t)) return "res-wqhd"
  if (/1920\s*[x×]\s*1080|\bfhd\b|1080p|フル\s*hd|フルhd|1080\s*p/i.test(t)) return "res-fhd"
  return null
}

/** Strong tag from explicit pixels / unambiguous keywords only */
function inferStrongTag(hay) {
  const t = String(hay)
  if (/3840\s*[x×]\s*2160/i.test(t)) return "res-4k"
  if (/3440\s*[x×]\s*1440/i.test(t)) return "res-uwqhd"
  if (/2560\s*[x×]\s*1440/i.test(t)) return "res-wqhd"
  if (/1920\s*[x×]\s*1080/i.test(t)) return "res-fhd"
  if (/\buwqhd\b/i.test(t)) return "res-uwqhd"
  if (/\b2\.5k\b|2k\/2\.5k/i.test(t)) return "res-wqhd"
  if (/\b4k\b|４Ｋ/i.test(t)) return "res-4k"
  if (/フル\s*hd|フルhd|\bfhd\b|1080p|1080\s*p/i.test(t)) return "res-fhd"
  if (/(?<![uw-])\bqhd\b|(?<![uw-])wqhd\b/i.test(t)) return "res-wqhd"
  return null
}

function parseBlocks(source) {
  const blocks = []
  const re = /(\{\s*\n\s*id: "(mon-[^"]+)"[\s\S]*?\n  \},)/g
  let m
  while ((m = re.exec(source))) {
    const block = m[1]
    if (!block.includes('category: "monitor"')) continue
    blocks.push({
      id: m[2],
      block,
      asin: block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1] ?? null,
      name: block.match(/name: "([^"]*)"/)?.[1] ?? "",
      tagline: block.match(/tagline: "([^"]*)"/)?.[1] ?? "",
    })
  }
  return blocks
}

function getStoredTag(block) {
  const m = block.match(/monitorFilterTags: \[([^\]]*)\]/)
  if (!m) return null
  return (
    m[1]
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .find((t) => RES_TAGS.includes(t)) ?? null
  )
}

function cardMatchesTag(card, tag) {
  if (!card || card === "—") return false
  const expected = DISPLAY[tag]
  if (card === expected) return true
  const specExpected = SPEC[tag]
  if (card === specExpected) return true
  const short = expected.split(" (")[0]
  return card.includes(short) && /\d{3,4}/.test(card)
}

function specMatchesTag(spec, tag) {
  if (!spec || spec === "—") return false
  return spec === SPEC[tag] || cardMatchesTag(spec, tag)
}

function patchResolution(block, tag) {
  const card = DISPLAY[tag]
  const spec = SPEC[tag]
  let next = block

  next = next.replace(/(highlights: \[[\s\S]*?\{ label: "解像度", value: ")[^"]*(")/, `$1${card}$2`)
  next = next.replace(
    /(\{ title: "ディスプレイ", rows: \[[\s\S]*?\{ label: "解像度", value: ")[^"]*(")/,
    `$1${spec}$2`,
  )

  const tagRe = /monitorFilterTags: \[([^\]]*)\]/
  const tm = next.match(tagRe)
  if (tm) {
    const existing = tm[1]
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .filter(Boolean)
      .filter((t) => !RES_TAGS.includes(t))
    const merged = [...existing, tag]
    next = next.replace(tagRe, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
  }

  return next
}

function resolveTag(meta) {
  const hay = `${meta.name} ${meta.tagline}`
  if (meta.asin && ASIN_OVERRIDES[meta.asin]) return { tag: ASIN_OVERRIDES[meta.asin], kind: "asin" }
  const stored = getStoredTag(meta.block)
  if (stored) return { tag: stored, kind: "stored" }
  const inferred = inferTagFromHay(hay)
  if (inferred) return { tag: inferred, kind: "inferred" }
  return null
}

function needsFix(meta) {
  const hay = `${meta.name} ${meta.tagline}`
  const stored = getStoredTag(meta.block)
  const asinTag = meta.asin ? ASIN_OVERRIDES[meta.asin] : null
  const strong = inferStrongTag(hay)
  const inferred = inferTagFromHay(hay)

  let tag = stored ?? inferred
  let reason = null

  if (asinTag) {
    tag = asinTag
    if (stored !== asinTag) reason = `asin ${stored ?? "none"}→${asinTag}`
  } else if (strong && stored && strong !== stored) {
    if (stored === "res-uwqhd" && strong === "res-wqhd") {
      tag = stored
    } else {
      tag = strong
      reason = `conflict ${stored}→${strong}`
    }
  } else if (!stored && inferred) {
    tag = inferred
    reason = `add ${inferred}`
  } else if (!tag) {
    return null
  }

  const cards = [...meta.block.matchAll(/\{\s*label: "解像度",\s*value: "([^"]*)"\s*\}/g)].map((m) => m[1])
  const card = cards[0]
  const spec = cards[1]

  const cardOk = cardMatchesTag(card, tag)
  const specOk = spec ? specMatchesTag(spec, tag) : true

  if (!reason && cardOk && specOk) return null
  if (!reason) reason = "normalize-display"

  return { tag, reason }
}

const fixes = []

for (const file of MONITOR_FILES) {
  let source = readFileSync(file, "utf8")
  let changed = false

  for (const meta of parseBlocks(source)) {
    const fix = needsFix(meta)
    if (!fix) continue

    const next = patchResolution(meta.block, fix.tag)
    if (next === meta.block) continue

    source = source.replace(meta.block, next)
    changed = true
    fixes.push({
      id: meta.id,
      asin: meta.asin,
      file: file.split(/[/\\]/).pop(),
      to: DISPLAY[fix.tag],
      reason: fix.reason,
    })
  }

  if (changed && !DRY) writeFileSync(file, source)
}

console.log(`${DRY ? "[dry-run] " : ""}Fixed ${fixes.length} monitor resolution(s)`)
for (const f of fixes) {
  console.log(`  ${f.id} (${f.asin ?? "?"}) → ${f.to} [${f.reason}] (${f.file})`)
}
