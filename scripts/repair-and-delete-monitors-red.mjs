/**
 * Repair corrupted monitor TS files and delete red-row monitors safely.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createRequire } from "node:module"
import { spawnSync } from "node:child_process"

const require = createRequire(import.meta.url)
const ExcelJS = require("exceljs")

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")
const LIB = path.join(ROOT, "lib")
const XLSX_PATH = "D:/ダウンロード/monitors.xlsx"

const FILE_META = {
  "monitor-acer-search.ts": {
    exportName: "monitorAcerSearch",
    comment: "Amazon.co.jp Acer モニター検索・人気ランキング（2151982051 / Acer）。",
  },
  "monitor-asus-search.ts": {
    exportName: "monitorAsusSearch",
    comment: "Amazon.co.jp ASUS モニター検索・人気ランキング（2151982051 / ASUS）。",
    regenerate: "generate-monitor-asus-search.mjs",
  },
  "monitor-bestsellers.ts": {
    exportName: "monitorBestsellers",
    comment: "Amazon.co.jp PCモニター売れ筋ランキング（2151982051）1ページ目 #1–#50。",
  },
  "monitor-bestsellers-page2.ts": {
    exportName: "monitorBestsellersPage2",
    comment: "Amazon.co.jp PCモニター売れ筋ランキング（2151982051）2ページ目 #51–#100。",
  },
  "monitor-dell-search.ts": {
    exportName: "monitorDellSearch",
    comment: "Amazon.co.jp Dell モニター検索・人気ランキング（2151982051 / Dell）。",
    regenerate: "generate-monitor-dell-search.mjs",
  },
  "monitor-lenovo-search.ts": {
    exportName: "monitorLenovoSearch",
    comment: "Amazon.co.jp Lenovo ディスプレイ検索（26.5インチ以上 / Lenovo）。",
    regenerate: "generate-monitor-lenovo-search.mjs",
  },
  "monitor-lenovo-search-page2.ts": {
    exportName: "monitorLenovoSearchPage2",
    comment: "Amazon.co.jp Lenovo ディスプレイ検索 2ページ目（26.5インチ以上 / Lenovo）。",
    regenerate: "generate-monitor-lenovo-search-page2.mjs",
  },
  "monitor-lenovo-search-26plus.ts": {
    exportName: "monitorLenovoSearch26Plus",
    comment: "Amazon.co.jp Lenovo ディスプレイ検索（26.5インチ以上 / Lenovo）。",
    regenerate: "generate-monitor-lenovo-search-26plus.mjs",
  },
  "monitor-lenovo-search-26plus-page2.ts": {
    exportName: "monitorLenovoSearch26PlusPage2",
    comment: "Amazon.co.jp Lenovo ディスプレイ検索 2ページ目（26.5インチ以上 / Lenovo）。",
    regenerate: "generate-monitor-lenovo-search-26plus-page2.mjs",
  },
  "monitor-lenovo-search-1822.ts": {
    exportName: "monitorLenovoSearch1822",
    comment: "Amazon.co.jp Lenovo ディスプレイ検索（18.0～22.0インチ / Lenovo）。",
    regenerate: "generate-monitor-lenovo-search-1822.mjs",
  },
  "monitor-refresh144-search.ts": {
    exportName: "monitorRefresh144Search",
    comment: "Amazon.co.jp 144Hz以上 モニター検索（2151982051 / 144Hz）。",
  },
  "monitor-search-22-120.ts": {
    exportName: "monitorSearch22120",
    comment: "Amazon.co.jp 22～120Hz モニター検索（2151982051）。",
  },
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function extractRedIds() {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(XLSX_PATH)
  const ws = wb.worksheets[0]
  const ids = []
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return
    const cell = row.getCell(1)
    const id = String(cell.value ?? "").trim()
    if (!id) return
    const fill = cell.fill
    const argb = fill?.type === "pattern" ? fill.fgColor?.argb : undefined
    if (argb && /FF0000$/i.test(argb)) ids.push(id)
  })
  return [...new Set(ids)]
}

function repairPartial(fileName, meta) {
  const filePath = path.join(LIB, fileName)
  let src = fs.readFileSync(filePath, "utf8")

  if (src.includes(`export const ${meta.exportName}`)) {
    console.log(`  ok (already valid): ${fileName}`)
    return
  }

  if (/^import type\s+\]\s*$/m.test(src.trim()) || src.trim() === "import type ]") {
    if (!meta.regenerate) throw new Error(`Need regenerate script for ${fileName}`)
    console.log(`  regenerate: ${fileName}`)
    const result = spawnSync("node", [path.join(__dirname, meta.regenerate)], {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
    })
    if (result.status !== 0) throw new Error(`Regenerate failed: ${meta.regenerate}`)
    return
  }

  src = src.replace(/^import type\s+\{\n/, "")
  const header = `import type { Gadget } from "./gadgets"\n\n/** ${meta.comment} */\nexport const ${meta.exportName}: Gadget[] = [\n  {`
  src = header + src
  if (!src.endsWith("\n")) src += "\n"
  fs.writeFileSync(filePath, src)
  console.log(`  repaired header: ${fileName}`)
}

function removeMonitorBlockSafe(src, id) {
  const middleRe = new RegExp(
    `\n  \\{\n    id: "${escapeRegExp(id)}"[\\s\\S]*?category: "monitor"[\\s\\S]*?\n  \\},`,
    "m",
  )
  if (middleRe.test(src)) {
    return { src: src.replace(middleRe, ""), removed: true }
  }

  const lastRe = new RegExp(
    `\n  \\{\n    id: "${escapeRegExp(id)}"[\\s\\S]*?category: "monitor"[\\s\\S]*?\n  \\}\\n?\\]`,
    "m",
  )
  if (lastRe.test(src)) {
    return { src: src.replace(lastRe, "\n]"), removed: true }
  }

  return { src, removed: false }
}

function deleteRedIds(ids) {
  const deleteSet = new Set(ids)
  let total = 0

  for (const file of fs.readdirSync(LIB)) {
    if (!file.endsWith(".ts")) continue
    const filePath = path.join(LIB, file)
    let src = fs.readFileSync(filePath, "utf8")
    if (!src.includes('category: "monitor"')) continue

    let fileRemoved = 0
    for (const id of deleteSet) {
      const { src: next, removed } = removeMonitorBlockSafe(src, id)
      if (removed) {
        src = next
        fileRemoved++
        total++
      }
    }

    if (fileRemoved > 0) {
      fs.writeFileSync(filePath, src)
      console.log(`  deleted ${fileRemoved} from ${file}`)
    }
  }

  return total
}

console.log("Step 1: repair corrupted monitor files")
for (const [fileName, meta] of Object.entries(FILE_META)) {
  if (fs.existsSync(path.join(LIB, fileName))) {
    repairPartial(fileName, meta)
  }
}

console.log("\nStep 2: extract red IDs")
const redIds = await extractRedIds()
console.log(`Red IDs: ${redIds.length}`)

console.log("\nStep 3: delete red monitor blocks")
const removed = deleteRedIds(redIds)
console.log(`Total blocks removed: ${removed}`)

fs.writeFileSync(
  path.join(__dirname, "monitor-red-delete-ids.json"),
  JSON.stringify({ deletedAt: new Date().toISOString(), ids: redIds, removedBlocks: removed }, null, 2),
)
