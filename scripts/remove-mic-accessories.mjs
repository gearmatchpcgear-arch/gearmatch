/**
 * Remove non-mic-body products from mic data files by gadget id.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

const REMOVE_IDS = new Set([
  // マイク + 周辺機器バンドル（アーム/スタンド/ショックマウント主体）
  "mic-dyn-043",
  "mic-dyn-044",
  "mic-dyn-045",
  "mic-dyn-046",
  "mic-dyn-047",
  "mic-cnd2-009",
  // スピーカーフォン / 拡声器（マイク本体ではない）
  "mic-bs-010",
  "mic-dyn-027",
  "mic-dyn-028",
  // ゲーム機向けカラオケアクセサリー
  "mic-dyn-006",
  "mic-dyn-007",
  // ヘッドセット / マイク付きイヤホン（全件）
  ...Array.from({ length: 28 }, (_, i) => `mic-hs-${String(i + 1).padStart(3, "0")}`),
])

const blockRe =
  /\{\n    id: "([^"]+)"[\s\S]*?\n  \},?\n/g

function removeFromSource(src) {
  let removed = 0
  const out = src.replace(blockRe, (block, id) => {
    if (!REMOVE_IDS.has(id)) return block
    removed++
    return ""
  })
  return { src: out, removed }
}

let total = 0
for (const file of readdirSync(join(ROOT, "lib"))) {
  if (!file.endsWith(".ts")) continue
  const path = join(ROOT, "lib", file)
  const src = readFileSync(path, "utf8")
  if (!src.includes('category: "mic"')) continue
  const { src: next, removed } = removeFromSource(src)
  if (removed > 0) {
    writeFileSync(path, next)
    console.log(`${file}: removed ${removed}`)
    total += removed
  }
}

console.log(`Total removed: ${total}`)
