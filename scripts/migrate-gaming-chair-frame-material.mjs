/**
 * ゲーミングチェアデータ: 耐荷重 → フレームの種類 へ一括移行
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  DASH,
  inferFrameMaterial,
  formatFrameMaterialForCard,
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
  const brand = block.match(/brand: "([^"]*)"/)?.[1] ?? ""
  return inferFrameMaterial(`${name} ${tagline}`, {}, brand)
}

function migrateGadgetBlock(block) {
  const frameMaterial = inferFromGadgetBlock(block)
  const display = formatFrameMaterialForCard(frameMaterial)

  let updated = block
    .replace(/label: "耐荷重"/g, 'label: "フレームの種類"')
    .replace(/title: "リクライニング \/ 耐荷重"/g, 'title: "リクライニング / フレーム"')
    .replace(/frameMaterial: "[^"]*",\n\s*/g, "")
    .replace(/耐荷重\d+kg/g, "")
    .replace(/・耐荷重\d+kg/g, "")

  updated = updated.replace(
    /\{ label: "フレームの種類", value: "[^"]*" \}/g,
    `{ label: "フレームの種類", value: "${display}" }`,
  )

  if (frameMaterial !== DASH) {
    updated = updated.replace(
      /(category: "gaming-chair",\n)/,
      `$1    frameMaterial: "${frameMaterial}",\n`,
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

  const count = (text.match(/フレームの種類/g) ?? []).length
  console.log(`${relPath}: ${count} label occurrences`)
}

for (const file of files) {
  migrateFile(file)
}

console.log("Done.")
