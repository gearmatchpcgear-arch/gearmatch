/**
 * Audit and fix keyboard connection values (2.4GHz/BT/wired mix-ups).
 * Conservative: only fixes clear errors, not normalization of valid values.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")

function extractField(block, field) {
  const m = block.match(new RegExp(`${field}:\\s*"([^"]*)"`))
  return m?.[1] ?? ""
}

function isKeychronProNoMax(name, tagline) {
  const hay = `${name} ${tagline}`
  if (/Max/i.test(hay)) return false
  if (/B1 Pro|C1 Pro|C2 Pro|C3 Pro|B6 Pro|B3 Pro/i.test(hay)) return false
  return /Keychron\s+(Q|K|V)\d*\s*Pro\b/i.test(hay)
}

function haySupports24GHz(hay) {
  return /2\.4\s*ghz|2\.4g\b|2\.4\s*g\b|lightspeed|logi bolt|logi…|,\s*log|unifying|レシーバー|ドングル|3モード|三モード|3つモード/i.test(
    hay,
  )
}

function haySupportsBluetooth(hay) {
  return /bluetooth|ブルートゥース|\bbt\s*5|\bbt\//i.test(hay)
}

function haySupportsWired(hay) {
  if (/有線(接続| USB|キーボード)|wired connection|usb接続|type-c有線|usb-c有線|\/有線|有線\/|3モード/i.test(hay)) {
    return true
  }
  if (/2\.4g\/bt\/usb|bt\/2\.4|usb-c\/.*bt|bluetooth.*\/.*usb/i.test(hay)) return true
  return false
}

function buildConnectionFromHay(hay) {
  const parts = []
  if (haySupportsWired(hay)) {
    parts.push(/usb-c|type-c/i.test(hay) ? "有線 USB-C" : "有線 USB")
  }
  if (haySupports24GHz(hay)) {
    if (/logi bolt/i.test(hay)) parts.push("2.4GHz (Logi Bolt)")
    else if (/unifying/i.test(hay)) parts.push("2.4GHz (Unifying USBレシーバー)")
    else parts.push("2.4GHz (USBレシーバー)")
  }
  if (haySupportsBluetooth(hay)) {
    if (/bluetooth\s*5\.1/i.test(hay)) parts.push("Bluetooth 5.1")
    else if (/bluetooth\s*5\.[02]/i.test(hay)) parts.push("Bluetooth 5.0")
    else parts.push("Bluetooth")
  }
  return parts.join(" / ")
}

function shouldApplyFix(connection, built, hay) {
  if (!built || built === connection) return false

  const cur24 = /2\.4/i.test(connection)
  const built24 = /2\.4/i.test(built)
  const curBt = /bluetooth/i.test(connection)
  const builtBt = /bluetooth/i.test(built)

  // Remove 2.4GHz when product text never mentions it
  if (cur24 && !built24 && !haySupports24GHz(hay)) return true

  // Never strip Logi Bolt when product mentions it
  if (/logi bolt|logi…|,\s*log/i.test(hay) && cur24 && /logi bolt/i.test(connection)) return false

  // Remove Bluetooth when product text never mentions it
  if (curBt && !builtBt && !haySupportsBluetooth(hay)) return true

  // Add missing Logi Bolt when explicitly in product text
  if (/logi bolt/i.test(hay) && !/logi bolt/i.test(connection) && built24) return true

  return false
}

function fixConnection(connection, name, tagline, brand) {
  const hay = `${brand} ${name} ${tagline}`

  if (isKeychronProNoMax(name, tagline)) {
    return /bluetooth\s*5\.1/i.test(hay)
      ? "有線 USB-C / Bluetooth 5.1"
      : "有線 USB-C / Bluetooth"
  }

  if (/Magic Keyboard|マジックキーボード/i.test(hay) && /2\.4/i.test(connection)) {
    return haySupportsWired(hay) ? "Bluetooth / USB-C" : "Bluetooth"
  }

  const built = buildConnectionFromHay(hay)
  if (shouldApplyFix(connection, built, hay)) return built

  return connection
}

function patchConnectionInBlock(block) {
  if (!/category: "keyboard"/.test(block)) return { block, changed: false }

  const name = extractField(block, "name")
  const tagline = extractField(block, "tagline")
  const brand = extractField(block, "brand")
  const oldConn = extractField(block, "connection")
  const newConn = fixConnection(oldConn, name, tagline, brand)

  if (newConn === oldConn) return { block, changed: false }

  let next = block.replace(/connection:\s*"([^"]*)"/, `connection: "${newConn}"`)
  next = next.replace(
    /(\{ label: "接続方式", value: ")([^"]*)(" \})/g,
    `$1${newConn}$3`,
  )

  return { block: next, changed: true, name, oldConn, newConn }
}

function processGadgetArrayFile(filePath) {
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
    const { block, changed, name, oldConn, newConn } = patchConnectionInBlock(chunk)
    if (changed) {
      updated++
      fixes.push({ name: name?.slice(0, 60), oldConn, newConn })
    }
    return block
  })

  if (updated) writeFileSync(filePath, head + next.join("\n") + tail)
  return { updated, fixes }
}

function processGadgetsTs(filePath) {
  const src = readFileSync(filePath, "utf8")
  const fixes = []
  let updated = 0
  const chunks = src.split(/\n  \},\n/).map((chunk, i, arr) =>
    i < arr.length - 1 ? chunk + "\n  }," : chunk,
  )
  const next = chunks.map((chunk) => {
    if (!/category: "keyboard"/.test(chunk)) return chunk
    const { block, changed, name, oldConn, newConn } = patchConnectionInBlock(chunk)
    if (changed) {
      updated++
      fixes.push({ name: name?.slice(0, 60), oldConn, newConn })
    }
    return block
  })
  if (updated) writeFileSync(filePath, next.join("\n"))
  return { updated, fixes }
}

let total = 0
const gadgetsResult = processGadgetsTs(join(LIB, "gadgets.ts"))
if (gadgetsResult.updated) {
  console.log(`gadgets.ts: fixed ${gadgetsResult.updated}`)
  total += gadgetsResult.updated
}

for (const file of readdirSync(LIB)) {
  if (!file.startsWith("keyboard") || !file.endsWith(".ts")) continue
  const { updated, fixes } = processGadgetArrayFile(join(LIB, file))
  if (updated) {
    console.log(`${file}: fixed ${updated}`)
    for (const fix of fixes) console.log(`  ${fix.name}: "${fix.oldConn}" → "${fix.newConn}"`)
    total += updated
  }
}

console.log(`\nDone. fixed ${total} keyboard connection entries`)
