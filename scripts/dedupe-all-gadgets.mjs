/**
 * Detect and remove duplicate gadgets across all lib/*.ts source files.
 * Usage:
 *   npx tsx scripts/dedupe-all-gadgets.mjs           # dry-run report
 *   npx tsx scripts/dedupe-all-gadgets.mjs --apply   # delete duplicates + re-export CSV
 */
import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { allSourceGadgets } from "../lib/gadgets.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const libDir = path.join(root, "lib")
const apply = process.argv.includes("--apply")

function extractAsin(gadget) {
  const m = gadget.purchaseUrl?.match(/\/dp\/([A-Z0-9]{10})/)
  return m?.[1] ?? null
}

function normalizeName(name) {
  return (name ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[【】「」[\]()（）]/g, " ")
    .replace(/[^a-z0-9\u3040-\u9fff]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const GENERIC_NAME_PATTERNS = [
  /^モニターアーム$/,
  /^モニターアーム シングル$/,
  /^デュアルモニターアーム$/,
  /^4k webカメラ$/,
  /^ゲーミングオーディオミキサー$/,
  /モバイルモニター$/,
  /^usb卓上マイク$/,
  /^ワイヤレスピンマイク$/,
  /^15 6型 モバイルモニター$/,
  /^18 5型 モバイルモニター$/,
  /^ファブリック オフィスチェア/,
  /^オフィスチェア デスクチェア 椅子$/,
]

function isGenericName(norm) {
  if (norm.length < 12) return true
  return GENERIC_NAME_PATTERNS.some((p) => p.test(norm))
}

function groupKeys(gadget) {
  const keys = []
  const asin = extractAsin(gadget)
  if (asin) keys.push(`asin:${asin}`)
  const norm = normalizeName(gadget.name)
  if (norm.length >= 4 && !isGenericName(norm)) {
    const brand = normalizeName(gadget.brand ?? "—")
    keys.push(`name:${gadget.category}:${brand}:${norm}`)
  }
  return keys
}

function completenessScore(gadget) {
  let score = 0
  if (gadget.image) score += 2
  if (gadget.price != null) score += 2
  if (gadget.connection) score += 1
  if (gadget.tagline?.length > 20) score += 1
  score += (gadget.highlights ?? []).filter((h) => h.value && h.value !== "—").length
  for (const group of gadget.specGroups ?? []) {
    score += group.rows.filter((r) => r.value && r.value !== "—").length
  }
  return score
}

function pickWinner(group) {
  return [...group].sort((a, b) => {
    const ar = a.reviews ?? 0
    const br = b.reviews ?? 0
    if (br !== ar) return br - ar
    const arating = a.rating ?? 0
    const brating = b.rating ?? 0
    if (brating !== arating) return brating - arating
    const ac = completenessScore(a)
    const bc = completenessScore(b)
    if (bc !== ac) return bc - ac
    return a.id.localeCompare(b.id)
  })[0]
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function removeGadgetObject(content, id) {
  const idPattern = new RegExp(`\\{\\s*\\n\\s*id:\\s*"${escapeRegExp(id)}"`)
  const match = idPattern.exec(content)
  if (!match) return { content, removed: false }

  let start = match.index
  while (start > 0 && /\s/.test(content[start - 1])) start--
  if (start > 0 && content[start - 1] === ",") start--

  let depth = 0
  let i = match.index
  for (; i < content.length; i++) {
    if (content[i] === "{") depth++
    else if (content[i] === "}") {
      depth--
      if (depth === 0) {
        i++
        while (i < content.length && /[\s,]/.test(content[i])) i++
        break
      }
    }
  }
  return { content: content.slice(0, start) + content.slice(i), removed: true }
}

function findSourceFile(id) {
  const tsFiles = fs
    .readdirSync(libDir)
    .filter((f) => f.endsWith(".ts") && !f.endsWith(".d.ts"))
  for (const file of tsFiles) {
    const text = fs.readFileSync(path.join(libDir, file), "utf8")
    if (new RegExp(`id:\\s*"${escapeRegExp(id)}"`).test(text)) return file
  }
  return null
}

// Union-find style grouping via shared keys
const gadgets = allSourceGadgets
const keyToIds = new Map()
const idToGadget = new Map()

for (const g of gadgets) {
  idToGadget.set(g.id, g)
  for (const key of groupKeys(g)) {
    if (!keyToIds.has(key)) keyToIds.set(key, new Set())
    keyToIds.get(key).add(g.id)
  }
}

const parent = new Map()
function find(id) {
  if (!parent.has(id)) parent.set(id, id)
  if (parent.get(id) !== id) parent.set(id, find(parent.get(id)))
  return parent.get(id)
}
function union(a, b) {
  const ra = find(a)
  const rb = find(b)
  if (ra !== rb) parent.set(rb, ra)
}

for (const ids of keyToIds.values()) {
  const list = [...ids]
  for (let i = 1; i < list.length; i++) union(list[0], list[i])
}

const groups = new Map()
for (const g of gadgets) {
  const root = find(g.id)
  if (!groups.has(root)) groups.set(root, [])
  groups.get(root).push(g)
}

const duplicateGroups = [...groups.values()].filter((g) => g.length > 1)

const toDelete = []
const summaryByCategory = new Map()

for (const group of duplicateGroups) {
  const winner = pickWinner(group)
  const losers = group.filter((g) => g.id !== winner.id)
  if (losers.length === 0) continue
  for (const loser of losers) {
    toDelete.push({ loser, winner, groupSize: group.length })
    const cat = loser.category
    if (!summaryByCategory.has(cat)) summaryByCategory.set(cat, [])
    summaryByCategory.get(cat).push({
      name: loser.name,
      deletedId: loser.id,
      keptId: winner.id,
      reviews: loser.reviews ?? 0,
      keptReviews: winner.reviews ?? 0,
    })
  }
}

console.log(`Total gadgets in allSourceGadgets: ${gadgets.length}`)
console.log(`Duplicate groups: ${duplicateGroups.length}`)
console.log(`Records to delete: ${toDelete.length}\n`)

for (const [cat, items] of [...summaryByCategory.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`## ${cat} (${items.length} deletions)`)
  for (const item of items.slice(0, 20)) {
    console.log(
      `  - ${item.name.slice(0, 60)} | delete ${item.deletedId} (reviews:${item.reviews}) → keep ${item.keptId} (reviews:${item.keptReviews})`,
    )
  }
  if (items.length > 20) console.log(`  ... and ${items.length - 20} more`)
  console.log("")
}

if (!apply) {
  console.log("Dry run only. Re-run with --apply to delete duplicates.")
  process.exit(0)
}

const fileChanges = new Map()
for (const { loser } of toDelete) {
  const file = findSourceFile(loser.id)
  if (!file) {
    console.warn(`WARN: could not locate source file for ${loser.id}`)
    continue
  }
  if (!fileChanges.has(file)) {
    fileChanges.set(file, { ids: new Set(), content: fs.readFileSync(path.join(libDir, file), "utf8") })
  }
  fileChanges.get(file).ids.add(loser.id)
}

let removedCount = 0
for (const [file, state] of fileChanges) {
  let content = state.content
  for (const id of state.ids) {
    const result = removeGadgetObject(content, id)
    if (result.removed) {
      content = result.content
      removedCount++
    } else {
      console.warn(`WARN: failed to remove ${id} from ${file}`)
    }
  }
  fs.writeFileSync(path.join(libDir, file), content, "utf8")
  console.log(`Updated ${file} (-${state.ids.size} ids)`)
}

console.log(`\nRemoved ${removedCount} gadget objects from source files.`)

// Repair array commas broken by object removal
execSync("npx tsx scripts/fix-gadget-commas.mjs", { cwd: root, stdio: "inherit" })

// Re-export CSVs
execSync("npx tsx scripts/export-mic-gadgets-csv.mjs", { cwd: root, stdio: "inherit" })
execSync("npx tsx scripts/export-gadgets-csv.mjs", { cwd: root, stdio: "inherit" })

const { gadgets: deduped, allSourceGadgets: afterSource } = await import("../lib/gadgets.ts")
console.log(`After dedupe: allSourceGadgets=${afterSource.length}, gadgets(list)=${deduped.length}`)
