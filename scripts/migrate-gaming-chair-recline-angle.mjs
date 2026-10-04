/**
 * ゲーミングチェアデータ: 推奨身長 → 最大リクライニング角度 へ一括移行
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  DASH,
  inferMaxRecliningAngle,
  formatMaxRecliningAngleForCard,
} from "./amazon-gaming-chair-specs.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const files = [
  "lib/gaming-chairs.ts",
  "lib/gaming-chair-search.ts",
  "lib/gaming-chair-search-page3.ts",
  "lib/gaming-chair-search-page4.ts",
  "lib/gaming-chair-new-releases.ts",
]

function inferFromGadgetBlock(block) {
  const name = block.match(/name: "([^"]*)"/)?.[1] ?? ""
  const tagline = block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  return inferMaxRecliningAngle(`${name} ${tagline}`)
}

function migrateGadgetBlock(block) {
  const angle = inferFromGadgetBlock(block)
  const display = formatMaxRecliningAngleForCard(angle)

  let updated = block
    .replace(/label: "推奨身長"/g, 'label: "最大リクライニング角度"')
    .replace(/title: "サイズ \/ 耐荷重"/g, 'title: "リクライニング / 耐荷重"')
    .replace(/maxRecliningAngle: "[^"]*",\n\s*/g, "")
    .replace(/\n\s{4,8}name:/g, "\n    name:")

  updated = updated.replace(
    /\{ label: "最大リクライニング角度", value: "[^"]*" \}/g,
    `{ label: "最大リクライニング角度", value: "${display}" }`,
  )

  if (angle !== DASH) {
    updated = updated.replace(
      /(category: "gaming-chair",\n)/,
      `$1    maxRecliningAngle: "${angle}",\n`,
    )
  }

  return updated
}

function migrateFile(relPath) {
  const path = join(root, relPath)
  let text = readFileSync(path, "utf8")

  text = text.replace(
    /\{\n    id: "(chair-[^"]+)"([\s\S]*?\n  \},(?=\n  \{\n    id: "chair-|\n\]))/g,
    (full, id, rest) => migrateGadgetBlock(`{\n    id: "${id}"${rest}`),
  )

  writeFileSync(path, text, "utf8")

  const count = (text.match(/最大リクライニング角度/g) ?? []).length
  console.log(`${relPath}: ${count} label occurrences`)
}

for (const file of files) {
  migrateFile(file)
}

console.log("Done.")
