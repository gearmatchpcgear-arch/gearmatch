/**
 * Audit and fix keyboard 電源 values (connection/power mix-ups, hybrid models, vague labels).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferPowerFromText } from "./amazon-keyboard-specs.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")
const specCachePath = join(ROOT, "scripts", "keyboard-specs-cache.json")
const tabletSpecCachePath = join(ROOT, "scripts", "keyboard-tablet-specs-cache.json")
const specCache = existsSync(specCachePath)
  ? JSON.parse(readFileSync(specCachePath, "utf8"))
  : {}
const tabletSpecCache = existsSync(tabletSpecCachePath)
  ? JSON.parse(readFileSync(tabletSpecCachePath, "utf8"))
  : {}
const HYBRID_POWER = "有線給電 / 単3形乾電池×2本"

function asinFromBlock(block) {
  const m = block.match(/purchaseUrl:\s*"https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]+)"/)
  return m?.[1] ?? ""
}

function inferFromSpecCache(asin, hay, connection) {
  const cached = specCache[asin] ?? tabletSpecCache[asin]
  const bullets = cached?.specs?.bullets ?? cached?.bullets ?? ""
  const tableHay = cached?.specs?.table
    ? Object.values(cached.specs.table).join(" ")
    : ""
  const combined = `${bullets} ${tableHay} ${hay}`
  return inferPowerFromText(combined, connection)
}

function isHybridKeyboard(name, tagline) {
  const hay = `${name} ${tagline}`
  return (
    /REALFORCE\s+R[34][A-Z0-9]*.*ハイブリッド|REALFORCE\s+R[34].*Hybrid/i.test(hay) ||
    /HHKB.*HYBRID|HYBRID.*HHKB/i.test(hay)
  )
}

function fixPowerValue(power, name, tagline, connection, asin = "") {
  if (!power || power === "—") return power
  const hay = `${name} ${tagline} ${connection}`

  if (isHybridKeyboard(name, tagline)) {
    return HYBRID_POWER
  }

  if (/^USB電源[。.]?$/i.test(power.trim())) {
    if (/usb-c|type-c|充電|wireless|ワイヤレス|bluetooth|2\.4/i.test(hay)) {
      return "充電式 (USB-C)"
    }
    return "有線給電"
  }

  if (/^Usb Type-c/i.test(power)) {
    return "充電式 (USB-C)"
  }

  if (/^単3形乾電池×2本\s*\/\s*USB-C$/i.test(power)) {
    return HYBRID_POWER
  }

  if (/bluetooth|2\.4\s*ghz|logi bolt|lightspeed|unifying|ワイヤレス|wireless/i.test(power)) {
    if (/有線/i.test(connection) || /有線/i.test(power)) {
      if (/単4/i.test(hay)) return "有線給電 / 単4形乾電池×2本"
      if (/単3/i.test(hay)) return HYBRID_POWER
      if (/充電|rechargeable|usb-c|type-c/i.test(hay)) return "有線給電 / 充電式 (USB-C)"
      return HYBRID_POWER
    }
    const inferred = inferPowerFromText(hay, connection)
    return inferred ?? power
  }

  if (power === "バッテリー式") {
    const inferred = inferFromSpecCache(asin, hay, connection) ?? inferPowerFromText(hay, connection)
    if (inferred) return inferred
  }

  if (power === "充電式" && /usb-c|type-c/i.test(hay)) {
    return "充電式 (USB-C)"
  }

  if (power === "電源コード式") {
    return "有線給電"
  }

  return power
}

function extractField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*"([^"]*)"`))
  return m?.[1] ?? ""
}

function patchPowerInBlock(block) {
  if (!/category: "keyboard"/.test(block)) return { block, changed: false }

  const name = extractField(block, "name")
  const tagline = extractField(block, "tagline")
  const connection = extractField(block, "connection")
  const asin = asinFromBlock(block)
  const powerRe = /(\{ label: "電源", value: ")([^"]*)(" \})/g

  let changed = false
  const next = block.replace(powerRe, (full, pre, value, post) => {
    const fixed = fixPowerValue(value, name, tagline, connection, asin)
    if (fixed !== value) changed = true
    return `${pre}${fixed}${post}`
  })

  return { block: next, changed }
}

function processFile(filePath) {
  const src = readFileSync(filePath, "utf8")
  const match = src.match(/^([\s\S]*?export const \w+: Gadget\[\] = \[)([\s\S]*?)(\n\]\n?)$/)
  if (!match) return { updated: 0, fixes: [] }

  const [, head, body, tail] = match
  const chunks = body.split(/\n  \},\n/).map((chunk, i, arr) =>
    i < arr.length - 1 ? chunk + "\n  }," : chunk,
  )

  const fixes = []
  let updated = 0
  const next = chunks.map((chunk) => {
    if (!chunk.trim()) return chunk
    const { block, changed } = patchPowerInBlock(chunk)
    if (changed) {
      updated++
      const name = extractField(chunk, "name").slice(0, 60)
      const oldPower = chunk.match(/\{ label: "電源", value: "([^"]*)" \}/)?.[1]
      const newPower = block.match(/\{ label: "電源", value: "([^"]*)" \}/)?.[1]
      fixes.push({ name, oldPower, newPower })
    }
    return block
  })

  if (updated) {
    writeFileSync(filePath, head + next.join("\n") + tail)
  }
  return { updated, fixes }
}

let total = 0
const allFixes = []

for (const file of readdirSync(LIB)) {
  if (!file.startsWith("keyboard") || !file.endsWith(".ts")) continue
  const { updated, fixes } = processFile(join(LIB, file))
  if (updated) {
    console.log(`${file}: fixed ${updated}`)
    for (const fix of fixes) {
      console.log(`  ${fix.name}: "${fix.oldPower}" → "${fix.newPower}"`)
    }
    total += updated
    allFixes.push(...fixes)
  }
}

console.log(`\nDone. fixed ${total} keyboard entries (${allFixes.length} power corrections)`)
