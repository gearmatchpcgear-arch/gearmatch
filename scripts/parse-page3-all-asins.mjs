import { readFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const html = readFileSync(join(__dirname, "page3.html"), "utf8")

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

const items = []
const re = /data-asin="([A-Z0-9]{10})"/g
let m
while ((m = re.exec(html)) !== null) {
  const asin = m[1]
  if (asin === "0000000000") continue
  const sn = html.slice(m.index, m.index + 12000)
  const title =
    sn.match(/alt="([^"]{15,250})"/)?.[1] ??
    sn.match(/"productTitle"\s*:\s*"([^"]{15,250})"/)?.[1]
  if (!title) continue
  const t = decodeHtml(title)
  if (!/ゲーミングチェア|gaming chair|オフィスチェア|座椅子|M6|G7|AutoFull|GTPLAYER/i.test(t)) continue
  if (/マット|キャスター交換|クッション単|デスク[^チェア]|ガスシリンダー/i.test(t)) continue
  items.push({ asin, title: t })
}

const seen = new Set()
for (const item of items) {
  if (seen.has(item.asin)) continue
  seen.add(item.asin)
  console.log(JSON.stringify({ asin: item.asin, title: item.title.slice(0, 140) }))
}
