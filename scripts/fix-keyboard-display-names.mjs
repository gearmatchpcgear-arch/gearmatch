/**
 * Fix misleading keyboard card titles in lib/*.ts keyboard sources.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import {
  isCaseOnlyKeyboardProduct,
  normalizeKeyboardBodyName,
  normalizeKeyboardBodyTagline,
} from "./keyboard-display-name.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")

function patchQuotedField(block, field, value) {
  const re = new RegExp(`(\\n    ${field}: )"([^"]*)"(,?)`)
  if (!re.test(block)) return block
  return block.replace(re, `$1${JSON.stringify(value)}$3`)
}

function processFile(filePath) {
  let src = readFileSync(filePath, "utf8")
  const match = src.match(/^([\s\S]*?export const \w+: Gadget\[\] = \[)([\s\S]*?)(\n\]\n?)$/)
  if (!match) return { removed: 0, updated: 0 }

  const [, head, body, tail] = match
  const chunks = body.split(/\n  \},\n/).map((chunk, i, arr) =>
    i < arr.length - 1 ? chunk + "\n  }," : chunk,
  )

  let removed = 0
  let updated = 0
  const kept = []

  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    const name = chunk.match(/name:\s*"([^"]+)"/)?.[1]
    const tagline = chunk.match(/tagline:\s*"([^"]+)"/)?.[1]
    if (!name) {
      kept.push(chunk)
      continue
    }

    if (isCaseOnlyKeyboardProduct(name, tagline ?? "")) {
      removed++
      continue
    }

    const nextName = normalizeKeyboardBodyName(name, tagline ?? name, tagline ?? "")
    let next = chunk
    if (nextName && nextName !== name) {
      next = patchQuotedField(next, "name", nextName)
      updated++
    }

    if (tagline) {
      const nextTagline = normalizeKeyboardBodyTagline(tagline, tagline)
      if (nextTagline && nextTagline !== tagline) {
        next = patchQuotedField(next, "tagline", nextTagline)
      }
    }

    kept.push(next)
  }

  if (removed || updated) {
    writeFileSync(filePath, head + kept.join("\n") + tail)
  }
  return { removed, updated }
}

let totalRemoved = 0
let totalUpdated = 0

for (const file of readdirSync(LIB)) {
  if (!file.startsWith("keyboard") || !file.endsWith(".ts")) continue
  const path = join(LIB, file)
  const { removed, updated } = processFile(path)
  if (removed || updated) {
    console.log(`${file}: removed=${removed} updated=${updated}`)
    totalRemoved += removed
    totalUpdated += updated
  }
}

console.log(`Done. removed=${totalRemoved} updated=${totalUpdated}`)
