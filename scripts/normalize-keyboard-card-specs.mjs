/**
 * Normalize keyboard highlights to the 4 standard card specs.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const LIB = join(ROOT, "lib")
const DASH = "—"

const STANDARD = ["レイアウト", "内部構造", "キーキャップ", "電源"]

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function pickValue(block, label) {
  const rowRe = new RegExp(
    `\\{ label: "${escapeRegExp(label)}", value: "([^"]*)" \\}`,
    "g",
  )
  let match
  while ((match = rowRe.exec(block))) {
    if (match[1] && match[1] !== DASH) return match[1]
  }
  return DASH
}

function normalizeBlock(block) {
  if (!/category: "keyboard"/.test(block)) return block

  const values = Object.fromEntries(
    STANDARD.map((label) => [label, pickValue(block, label)]),
  )

  const highlightLines = [
    "    highlights: [",
    ...STANDARD.map(
      (label) =>
        `      { label: "${label}", value: "${values[label]}" },`,
    ),
    "    ],",
  ].join("\n")

  if (!/highlights: \[\s*\n/.test(block)) return block
  return block.replace(/highlights: \[[\s\S]*?\n    \],/, highlightLines)
}

function processFile(filePath) {
  let src = readFileSync(filePath, "utf8")
  const match = src.match(/^([\s\S]*?export const \w+: Gadget\[\] = \[)([\s\S]*?)(\n\]\n?)$/)
  if (!match) return 0

  const [, head, body, tail] = match
  const chunks = body.split(/\n  \},\n/).map((chunk, i, arr) =>
    i < arr.length - 1 ? chunk + "\n  }," : chunk,
  )

  let updated = 0
  const next = chunks.map((chunk) => {
    if (!chunk.trim()) return chunk
    const normalized = normalizeBlock(chunk)
    if (normalized !== chunk) updated++
    return normalized
  })

  if (updated) {
    writeFileSync(filePath, head + next.join("\n") + tail)
  }
  return updated
}

let total = 0
for (const file of readdirSync(LIB)) {
  if (!file.startsWith("keyboard") || !file.endsWith(".ts")) continue
  const count = processFile(join(LIB, file))
  if (count) {
    console.log(`${file}: updated ${count}`)
    total += count
  }
}

console.log(`Done. updated ${total} keyboard entries`)
