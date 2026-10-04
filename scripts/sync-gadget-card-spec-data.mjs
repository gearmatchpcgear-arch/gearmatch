/**
 * Sync highlights ↔ specGroups within each gadget block so card/detail raw data align.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")
const DASH = "—"

const LABEL_GROUPS = {
  mouse: [
    ["重量"],
    ["読み取り方式"],
    ["ボタン数"],
    ["電源"],
    ["接続方式"],
  ],
  keyboard: [["レイアウト"], ["内部構造"], ["キーキャップ"], ["電源"], ["接続方式"]],
  mic: [
    ["指向性"],
    ["接続方式", "端子"],
    ["周波数特性"],
    ["タイプ", "マイクタイプ"],
  ],
  monitor: [
    ["画面サイズ"],
    ["解像度"],
    ["リフレッシュレート", "リフレッシュ"],
    ["パネル", "パネル種類"],
    ["重量"],
    ["VESA", "VESA規格"],
  ],
  "gaming-chair": [["素材"], ["最大リクライニング角度"]],
  "audio-interface": [
    ["入力端子と数", "入力端子"],
    ["サンプリングレート", "サンプルレート"],
    ["ファンタム電源"],
    ["システム要件"],
  ],
}

function isFilled(v) {
  return v && v !== DASH && v !== "-"
}

function readLabelValues(block, label) {
  const re = new RegExp(`\\{ label: "${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}", value: "([^"]*)" \\}`)
  const m = block.match(re)
  return m?.[1] ?? null
}

function writeLabelValue(block, label, value) {
  const re = new RegExp(
    `(\\{ label: "${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}", value: ")([^"]*)(" \\})`,
  )
  if (!re.test(block)) return block
  return block.replace(re, `$1${value}$3`)
}

function syncBlock(block) {
  const category = block.match(/category: "([^"]+)"/)?.[1]
  const groups = LABEL_GROUPS[category]
  if (!groups) return { block, changed: 0 }

  let next = block
  let changed = 0

  for (const aliases of groups) {
    const values = aliases.map((label) => readLabelValues(next, label)).filter(Boolean)
    const best = values.filter(isFilled).sort((a, b) => b.length - a.length)[0]
    if (!best) continue

    for (const label of aliases) {
      const current = readLabelValues(next, label)
      if (current === null) continue
      if (!isFilled(current) && current !== best) {
        next = writeLabelValue(next, label, best)
        changed++
      }
    }
  }

  return { block: next, changed }
}

let totalPatches = 0
let filesPatched = 0

for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  const path = join(LIB, file)
  let src = readFileSync(path, "utf8")
  if (!src.includes("category:")) continue

  const blockRe = /(\{\s*\n\s*id: "[^"]+"[\s\S]*?\n  \},)/g
  let fileChanged = 0
  src = src.replace(blockRe, (block) => {
    const { block: next, changed } = syncBlock(block)
    if (changed > 0) fileChanged++
    return next
  })

  if (fileChanged > 0) {
    writeFileSync(path, src)
    filesPatched++
    totalPatches += fileChanged
    console.log(`${file}: ${fileChanged} block(s)`)
  }
}

console.log(`\nSynced ${totalPatches} block(s) across ${filesPatched} file(s)`)
