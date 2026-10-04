/**
 * ゲーミングチェアデータから不要な connection フィールドを削除
 */
import { readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const files = [
  "lib/gaming-chairs.ts",
  "lib/gaming-chair-search.ts",
  "lib/gaming-chair-search-page3.ts",
  "lib/gaming-chair-search-page4.ts",
  "lib/gaming-chair-new-releases.ts",
]

for (const relPath of files) {
  const path = join(root, relPath)
  const before = readFileSync(path, "utf8")
  const after = before.replace(/\n\s*connection: "—",\n/g, "\n")
  writeFileSync(path, after, "utf8")
  const removed = (before.match(/\n\s*connection: "—",\n/g) ?? []).length
  console.log(`${relPath}: removed ${removed} connection fields`)
}

console.log("Done.")
