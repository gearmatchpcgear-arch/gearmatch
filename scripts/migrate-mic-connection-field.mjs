/**
 * Rename mic card field 端子 → 接続方式 and sync multi-connection values.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  DASH,
  formatMicConnectionDisplay,
  inferConnectionFromText,
  pickBestMicConnection,
} from "./mic-connection-format.mjs"
import { MIC_CONNECTION_KNOWN } from "./mic-connection-known.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function getConnection(block) {
  return block.match(/connection: "([^"]*)"/)?.[1]
}

function getTitleHaystack(block) {
  const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  return `${name} ${tagline}`
}

function getSpecConnection(block) {
  const m = block.match(/\{ label: "接続方式", value: "([^"]*)" \}/)
  return m?.[1]
}

function resolveConnection(block, asin) {
  if (MIC_CONNECTION_KNOWN[asin]) return MIC_CONNECTION_KNOWN[asin]

  const connection = getConnection(block)
  if (connection) {
    const formatted = formatMicConnectionDisplay(connection)
    if (formatted !== DASH) return formatted
  }

  const hay = getTitleHaystack(block)
  const inferred = inferConnectionFromText(hay)
  if (inferred) return inferred

  const specConn = getSpecConnection(block)
  if (specConn) return formatMicConnectionDisplay(specConn)

  return DASH
}

function replaceConnectionField(block, value) {
  const re = /connection: "[^"]*"/
  if (!re.test(block)) return block
  return block.replace(re, `connection: "${value}"`)
}

function replaceLabelValue(block, label, value) {
  const re = new RegExp(`(\\{ label: "${label}", value: ")[^"]*(" \\})`, "g")
  return block.replace(re, `$1${value}$2`)
}

let blocks = 0
let files = 0

for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const original = readFileSync(path, "utf8")
  let src = original.replace(/label: "端子"/g, 'label: "接続方式"')

  if (!src.includes('category: "mic"')) continue

  const blockRe =
    /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"[\s\S]*?\n  \}(?:,|\n)/g

  let changed = false
  const out = src.replace(blockRe, (block, asin) => {
    const conn = resolveConnection(block, asin)
    let next = replaceConnectionField(block, conn)
    next = replaceLabelValue(next, "接続方式", conn)
    if (next !== block) {
      blocks++
      changed = true
    }
    return next
  })

  if (out !== original) {
    writeFileSync(path, out)
    files++
  }
}

console.log(`Updated mic connection in ${blocks} blocks across ${files} files`)
