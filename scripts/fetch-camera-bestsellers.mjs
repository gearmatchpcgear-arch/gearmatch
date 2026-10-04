/**
 * Amazon.co.jp ウェブカメラ売れ筋ランキング（10500630051）
 */
import { writeFileSync } from "fs"
import { join, dirname, resolve } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "camera-bestsellers-raw.json")
const URL = "https://www.amazon.co.jp/gp/bestsellers/computers/10500630051"

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.8",
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

/** ウェブカメラ本体以外（アーム・フィルター・ケーブル等）を除外 */
export function isCameraAccessory(title) {
  const t = String(title)
  if (/webcam cover|レンズカバー|プライバシーカバー|カメラカバー/i.test(t) && !/webcam|webカメラ|ウェブカメラ/i.test(t)) {
    return true
  }
  if (/カメラアーム|webcam arm|アーム単|スタンド単|三脚単/i.test(t) && !/webcam|webカメラ|ウェブカメラ|内蔵/i.test(t)) {
    return true
  }
  if (/ポップフィルター|privacy filter|プライバシーフィルター/i.test(t) && !/内蔵|付属|webcam|webカメラ/i.test(t)) {
    return true
  }
  if (/延長ケーブル|usb cable|ケーブル単/i.test(t) && !/webcam|webカメラ|ウェブカメラ|マイク/i.test(t)) {
    return true
  }
  if (/マウントアダプタ|clip mount/i.test(t) && !/webcam|webカメラ|ウェブカメラ/i.test(t)) {
    return true
  }
  // 開発基板向けカメラモジュール・電子工作パーツ（USBウェブカメラ本体ではない）
  if (
    /産業用カメラ(?:モジュール)?|カメラ\s*モジュール|カメラモジュール|ラズベリーパイ|for Raspberry|IMX230搭載|電子工作.*電子部品/i.test(
      t,
    )
  ) {
    return true
  }
  return false
}

async function fetchText(url, retries = 5) {
  for (let i = 0; i < retries; i++) {
    const html = await fetch(url, { headers: HEADERS }).then((r) => r.text())
    if (html.includes("data-asin=") && html.includes("zg-bdg-text") && html.length > 10000) {
      return html
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)))
  }
  throw new Error(`Blocked or empty response for ${url}`)
}

async function main() {
  const html = await fetchText(URL)
  const raw = parsePage(html).sort((a, b) => a.amazonRank - b.amazonRank)
  const excluded = raw.filter((item) => isCameraAccessory(item.title))
  const seenAsin = new Set()
  const cameras = []
  for (const item of raw.filter((item) => !isCameraAccessory(item.title))) {
    if (seenAsin.has(item.asin)) continue
    seenAsin.add(item.asin)
    cameras.push({ ...item, rank: item.amazonRank })
  }

  console.log(`Raw: ${raw.length}, cameras: ${cameras.length}, excluded: ${excluded.length}`)
  for (const x of cameras) {
    console.log(`  #${x.amazonRank} ${x.asin} ¥${x.price} ${x.title.slice(0, 75)}`)
  }
  for (const x of excluded) {
    console.log(`  EXCLUDED #${x.amazonRank} ${x.asin} ${x.title.slice(0, 60)}`)
  }

  writeFileSync(
    OUT_PATH,
    JSON.stringify({ fetchedAt: new Date().toISOString(), cameras, excluded, raw }, null, 2),
  )
  console.log(`Wrote ${OUT_PATH}`)
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isMain) {
  main().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}
