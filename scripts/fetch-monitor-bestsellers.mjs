/**
 * Amazon.co.jp ディスプレイ売れ筋ランキング（2151982051）→ monitor-bestsellers-raw.json
 */
import { writeFileSync } from "fs"
import { join, dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-bestsellers-raw.json")

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
    const html = await res.text()
    if (html.includes("data-asin=") && html.includes("zg-bdg-text")) return html
    await new Promise((r) => setTimeout(r, 1500 * (i + 1)))
  }
  throw new Error(`Empty or blocked response for ${url}`)
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

function parseItemBlock(block, asin, rank) {
  const titleRaw =
    block.match(/p13n-sc-css-line-clamp-2[^>]*>([\s\S]*?)<\/div>/)?.[1] ??
    block.match(/<img[^>]+alt="([^"]{15,})"/)?.[1]
  const title = titleRaw
    ? decodeHtml(titleRaw.replace(/<[^>]+>/g, "").trim())
    : asin

  const ratingMatch =
    block.match(/5つ星のうち([\d.]+)/) ||
    block.match(/([\d.]+)\s*out of 5 stars/i)
  const rating = ratingMatch ? Number(ratingMatch[1]) : 4.0
  const reviews = Number(
    block.match(/a-size-small">([\d,]+)</)?.[1]?.replace(/,/g, "") ?? "0",
  )
  const price = Number(
    block
      .match(/_cDEzb_p13n-sc-price_3mJ9Z">￥([\d,]+)/)?.[1]
      ?.replace(/,/g, "") ?? "0",
  )
  const imgRaw = block.match(/src="(https:\/\/[^"]+images\/I\/[^"]+)"/)?.[1]

  return {
    amazonRank: rank,
    asin,
    title,
    rating,
    reviews,
    price: price || null,
    image: imgRaw ? normalizeAmazonImageUrl(imgRaw) : "",
  }
}

function parsePage(html) {
  const items = []
  const seen = new Set()
  const rankRe = /data-asin="([A-Z0-9]{10})"[\s\S]*?zg-bdg-text">#(\d+)</g
  let match
  while ((match = rankRe.exec(html)) !== null) {
    const asin = match[1].toUpperCase()
    const rank = Number(match[2])
    const key = `${rank}:${asin}`
    if (seen.has(key)) continue
    seen.add(key)
    const start = Math.max(0, match.index - 200)
    const end = Math.min(html.length, match.index + 8000)
    items.push(parseItemBlock(html.slice(start, end), asin, rank))
  }
  return items
}

/** モニター以外（ケーブル・スタンド・保護フィルム等）を除外 */
export function isMonitorAccessory(title) {
  const t = title.toLowerCase()
  const isMonitorProduct =
    /モニター|monitor|ディスプレイ|display|液晶|thinkvision|thinkcentre|legion|tiny-in-one|acer|nitro|alphaline|sigmaline/i.test(t) ||
    /\b[lgprstxyekqvg][0-9]{2}[a-z0-9-]{2,}\b/i.test(t)
  if (/usbマイク|usb microphone|コンデンサーマイク|ダイナミックマイク|ポッドキャスト/i.test(t) && !isMonitorProduct) {
    return true
  }
  if (/\bマイク\b|microphone/i.test(t) && !/モニター|monitor|ディスプレイ|display|webcam|webカメラ|\bcam\b|camera/i.test(t)) {
    return true
  }
  if (/\bマウス\b|\bmouse\b|padholds|バッファロー.*マウス|gaming mouse/i.test(t) && !isMonitorProduct) return true
  if (/キーボード|keyboard/i.test(t) && !isMonitorProduct) return true
  if (/ヘッドセット|headset/i.test(t) && !/モニター|monitor|ディスプレイ|display/i.test(t)) return true
  if (/hdmi\s*(ケーブル|cable)|displayport\s*(ケーブル|cable)|dp\s*ケーブル/i.test(t) && !isMonitorProduct) {
    return true
  }
  if (
    /hdmi\s*ケーブル|displayport\s*ケーブル|dp\s*ケーブル|ケーブル付|ケーブル同梱/i.test(t) &&
    isMonitorProduct
  ) {
    return false
  }
  if (
    /モニターアーム|monitor arm|monitor\s*mount|VESAマウント|壁掛け金具|壁掛け/i.test(t) &&
    !/モニター|monitor|ディスプレイ|display/i.test(t)
  ) {
    return true
  }
  if (/スタンド単体|スタンドのみ|\bstand only\b/i.test(t)) return true
  if (/保護フィルム|スクリーンフィルター|プライバシー|privacy filter|フィルム|screen protector|フード|遮光フード|sun hood/i.test(t)) {
    return true
  }
  if (/hdmi\s*分配|hdmi\s*切替|分配器|切替器|splitter|switcher/i.test(t) && !isMonitorProduct) {
    return true
  }
  if (/モニターライト|monitor light|デスクライト|desk light|バーライト/i.test(t) && !isMonitorProduct) {
    return true
  }
  if (/電源アダプター|power adapter|acアダプター/i.test(t) && !isMonitorProduct) return true
  if (/ドッキングステーション|docking station|hub/i.test(t) && !isMonitorProduct) {
    return true
  }
  if (/変換アダプタ|変換アダプター|displayport.*hdmi.*(adapter|変換)|dvi.*(adapter|変換)/i.test(t) && !isMonitorProduct) {
    return true
  }
  return false
}

/** モニター本体のみ（周辺機器・非ディスプレイ商品を除外） */
export function isMonitorBody(title) {
  if (isMonitorAccessory(title)) return false
  const t = title.toLowerCase()
  return (
    /モニター|monitor|ディスプレイ|display|液晶|thinkvision|thinkcentre|legion|tiny-in-one|gaming monitor|led monitor|lcd monitor|pc monitor|computer monitor|oled gaming monitor|portable monitor|acer|nitro|alphaline|sigmaline/i.test(
      t,
    ) || /\b[lgprstxyekqvg][0-9]{2}[a-z0-9-]{2,}\b/i.test(t)
  )
}

function filterAndRerank(items) {
  const filtered = items.filter((item) => !isMonitorAccessory(item.title))
  const seenAsin = new Set()
  const unique = []
  for (const item of filtered.sort((a, b) => a.amazonRank - b.amazonRank)) {
    if (seenAsin.has(item.asin)) continue
    seenAsin.add(item.asin)
    unique.push(item)
  }
  return unique.map((item, i) => ({ ...item, rank: i + 1 }))
}

async function main() {
  const urls = [
    "https://www.amazon.co.jp/gp/bestsellers/computers/2151982051",
    "https://www.amazon.co.jp/gp/bestsellers/computers/2151982051/ref=zg_bs_pg_2?pg=2",
  ]
  const all = []
  for (const url of urls) {
    const html = await fetchText(url)
    const items = parsePage(html)
    console.log(`${url.includes("pg=2") ? "p2" : "p1"}: ${items.length} items`)
    all.push(...items)
    await new Promise((r) => setTimeout(r, 2000))
  }

  const byAmazonRank = new Map()
  for (const item of all) {
    if (!byAmazonRank.has(item.amazonRank)) byAmazonRank.set(item.amazonRank, item)
  }
  const raw = [...byAmazonRank.values()].sort((a, b) => a.amazonRank - b.amazonRank)
  const monitors = filterAndRerank(raw)
  const excluded = raw.filter((item) => isMonitorAccessory(item.title))

  console.log(`Raw ranks: ${raw.length}, monitors: ${monitors.length}, excluded: ${excluded.length}`)
  for (const x of monitors.slice(0, 15)) {
    console.log(`  #${x.rank} ${x.asin} ¥${x.price} ${x.title.slice(0, 60)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), monitors, excluded }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isMain) main().catch((e) => {
  console.error(e)
  process.exit(1)
})
