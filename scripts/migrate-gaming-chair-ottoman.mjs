/**
 * ゲーミングチェアデータ: hasOttoman 一括設定
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { inferHasOttoman } from "./amazon-gaming-chair-specs.mjs"

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
  return inferHasOttoman(`${name} ${tagline}`)
}

function migrateGadgetBlock(block) {
  const hasOttoman = inferFromGadgetBlock(block)
  const ottomanRowYes = `{ label: "オットマン", value: "あり" }`
  const ottomanRowNo = `{ label: "オットマン", value: "なし" }`
  const ottomanRow = hasOttoman ? ottomanRowYes : ottomanRowNo

  let updated = block.replace(/hasOttoman: (?:true|false),\n\s*/g, "")

  updated = updated.replace(
    /(category: "gaming-chair",\n)/,
    `$1    hasOttoman: ${hasOttoman},\n`,
  )

  if (updated.includes('{ label: "オットマン", value:')) {
    updated = updated.replace(
      /\{ label: "オットマン", value: "[^"]*" \}/g,
      ottomanRow,
    )
  } else {
    updated = updated.replace(
      /(\{ label: "形状", value: "[^"]*" \},?\n)(\s+\]\},?\n\s+\{ title: "Amazon)/,
      `$1          ${ottomanRow},\n$2`,
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

  const yes = (text.match(/hasOttoman: true/g) ?? []).length
  const no = (text.match(/hasOttoman: false/g) ?? []).length
  console.log(`${relPath}: ottoman yes=${yes}, no=${no}`)
}

for (const file of files) {
  migrateFile(file)
}

console.log("Done.")
