/**
 * Quick audit: card title/brand vs ASIN metadata title.
 */
import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { buildAsinMetaIndex } from "./build-asin-meta-index.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const LIB = join(__dirname, "..", "lib")

const BRAND_ALIASES = {
  visionowl: ["visionowl"],
  "i-o data": ["i-o data", "iodata", "アイ・オー", "io data", "i-o データ"],
  "io data": ["i-o data", "iodata", "アイ・オー", "io data"],
  asus: ["asus", "エイスース"],
  acer: ["acer", "エイサー"],
  "iris ohayama": ["iris", "ohyama", "アイリスオーヤマ", "アイリス"],
  koorui: ["koorui"],
  benq: ["benq"],
  dell: ["dell", "デル"],
  lenovo: ["lenovo", "レノボ"],
  lg: ["lg"],
  eizo: ["eizo", "エイゾー"],
  pixio: ["pixio", "ピクシオ"],
  logicool: ["logicool", "logitech", "ロジクール"],
  "logicool g": ["logicool", "logitech", "ロジクール", "blue"],
}

function tokens(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
}

function modelTokens(name) {
  return tokens(name).filter(
    (t) =>
      /[a-z0-9]{2,}/i.test(t) &&
      !/keyboard|mouse|ワイヤレス|bluetooth|キーボード|マウス|モニター|モバイル|インチ|型|ゲーミング|monitor|portable|pc/i.test(
        t,
      ),
  )
}

function likelyMatch(g, title) {
  if (!title) return null
  const hay = title.normalize("NFKC").toLowerCase()
  const card = `${g.name} ${g.tagline ?? ""}`.normalize("NFKC").toLowerCase()
  const cardToks = tokens(card).filter((t) => t.length >= 3)
  const hits = cardToks.filter((t) => hay.includes(t))
  if (hits.length >= Math.min(4, Math.ceil(cardToks.length * 0.4))) return true

  if (!g.brand || g.brand === "—") {
    const models = modelTokens(g.name)
    if (models.some((t) => hay.includes(t.toLowerCase()))) return true
    const nw = tokens(`${g.name} ${g.tagline ?? ""}`).filter((t) => t.length >= 3)
    return nw.filter((w) => hay.includes(w)).length >= Math.min(2, nw.length)
  }
  const brand = g.brand.toLowerCase().replace(/[?？]/g, "")
  const aliases = BRAND_ALIASES[brand] ?? [brand]
  if (aliases.some((a) => hay.includes(a) || title.toLowerCase().includes(a))) return true
  return modelTokens(`${g.name} ${g.tagline ?? ""}`).some((t) => hay.includes(t.toLowerCase()))
}

const index = buildAsinMetaIndex()
const mismatches = []
const blockRe =
  /\{\s*\n\s*id: "([^"]+)"[\s\S]*?category: "([^"]+)"[\s\S]*?name: "([^"]*)"[\s\S]*?brand: "([^"]*)"[\s\S]*?tagline: "([^"]*)"[\s\S]*?image: "([^"]*)"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})"/g

for (const file of readdirSync(LIB).filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join(LIB, file), "utf8")
  let m
  while ((m = blockRe.exec(src)) !== null) {
    const g = {
      id: m[1],
      category: m[2],
      name: m[3],
      brand: m[4],
      tagline: m[5],
      image: m[6],
      asin: m[7],
      file,
    }
    const meta = index.get(g.asin)
    if (!meta?.title) continue
    if (!likelyMatch(g, meta.title)) {
      mismatches.push({ ...g, amazonTitle: meta.title, amazonImage: meta.image })
    }
  }
}

writeFileSync(
  join(__dirname, "gadget-title-asin-mismatches.json"),
  JSON.stringify({ count: mismatches.length, mismatches }, null, 2) + "\n",
)

console.log(`Mismatches: ${mismatches.length}`)
for (const x of mismatches.filter((m) => /visionowl|i-o data|iodata/i.test(m.brand + m.name + m.amazonTitle))) {
  console.log(`\n${x.asin} ${x.id} [${x.brand}] ${x.name}`)
  console.log(`  Amazon: ${x.amazonTitle.slice(0, 100)}`)
}
console.log("\n--- monitors (first 40) ---")
for (const x of mismatches.filter((m) => m.category === "monitor").slice(0, 40)) {
  console.log(`${x.asin} ${x.id} [${x.brand}] ${x.name.slice(0, 55)}`)
  console.log(`  -> ${x.amazonTitle.slice(0, 90)}`)
}
