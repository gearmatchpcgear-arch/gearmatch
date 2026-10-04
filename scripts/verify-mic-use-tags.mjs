import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { inferMicUseTags } from "./mic-use-tags-infer.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function parseGadgetBlock(block) {
  const id = block.match(/id: "([^"]+)"/)?.[1]
  const category = block.match(/category: "([^"]+)"/)?.[1]
  const name = block.match(/name: "([^"]*)"/)?.[1]
  const brand = block.match(/brand: "([^"]*)"/)?.[1]
  const tagline = block.match(/tagline:\s*\n?\s*"([^"]*)"/)?.[1] ?? block.match(/tagline: "([^"]*)"/)?.[1] ?? ""
  const connection = block.match(/connection: "([^"]*)"/)?.[1] ?? ""
  const purchaseUrl = block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? ""
  const micFilterTagsRaw = block.match(/micFilterTags: \[([^\]]*)\]/)?.[1] ?? ""
  const micFilterTags = [...micFilterTagsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1])
  const micUseTagsRaw = block.match(/micUseTags: \[([^\]]*)\]/)?.[1] ?? ""
  const micUseTags = [...micUseTagsRaw.matchAll(/"([^"]+)"/g)].map((m) => m[1])

  const highlights = []
  const hlBlock = block.match(/highlights: \[([\s\S]*?)\]/)?.[1] ?? ""
  for (const m of hlBlock.matchAll(/label: "([^"]+)", value: "([^"]*)"/g)) {
    highlights.push({ label: m[1], value: m[2] })
  }

  const specGroups = []
  for (const group of block.matchAll(/title: "([^"]+)"[\s\S]*?rows: \[([\s\S]*?)\]/g)) {
    const rows = []
    for (const m of group[2].matchAll(/label: "([^"]+)", value: "([^"]*)"/g)) {
      rows.push({ label: m[1], value: m[2] })
    }
    specGroups.push({ title: group[1], rows })
  }

  return {
    id,
    category,
    name,
    brand,
    tagline,
    connection,
    purchaseUrl,
    micFilterTags,
    micUseTags,
    highlights,
    specGroups,
    compat: [],
  }
}

const blockRe =
  /\{[\s\S]*?category: "mic"[\s\S]*?purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/[A-Z0-9]{10}"[\s\S]*?\n  \}(?:,|\n)/g

const counts = {
  total: 0,
  empty: 0,
  web: 0,
  stream: 0,
  dtm: 0,
  vlog: 0,
}

for (const file of ["lib/gadgets.ts", ...["mic-bestsellers.ts", "mic-condenser-bestsellers.ts", "mic-condenser-bestsellers-page2.ts", "mic-dynamic-bestsellers.ts", "mic-dynamic-bestsellers-page2.ts", "mic-headset-new-releases.ts"].map((f) => `lib/${f}`)]) {
  const src = readFileSync(join(ROOT, file), "utf8")
  let m
  while ((m = blockRe.exec(src))) {
    const g = parseGadgetBlock(m[0])
    counts.total++
    const tags = g.micUseTags?.length ? g.micUseTags : inferMicUseTags(g)
    if (tags.length === 0) counts.empty++
    if (tags.includes("Web会議・オンライン授業・通話")) counts.web++
    if (tags.includes("ゲーム実況・配信・ラジオ録音")) counts.stream++
    if (tags.includes("歌・楽器の録音（DTM）")) counts.dtm++
    if (tags.includes("Vlog・動画撮影（屋外）")) counts.vlog++
  }
}

console.log(counts)
