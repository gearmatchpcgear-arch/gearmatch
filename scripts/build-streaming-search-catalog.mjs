/**
 * 「配信 オーディオインターフェース」検索結果（12ページ）からカタログ生成
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isAudioInterfaceAccessoryTitle } from "./audio-interface-accessory-title.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const raw = JSON.parse(readFileSync(join(__dirname, "tmp-streaming-all-unique.json"), "utf8"))

const DUPLICATE_ASINS = new Set([
  "B0GGYXY67H",
  "B084QTLLR2",
  "B00NHLB0IU",
  "B08D93XF5F",
  "B00U891AUM",
  "B0DBPKL3G5",
])

const EXCLUDED_SET_ASINS = new Set([
  "B0CJ4N5X5H",
  "B0FMJLP783",
  "B0H45KFYB3",
  "B0GF21X1RY",
  "B0FFGJ61T9",
  "B09WL54TTJ",
  "B0FWK4KDVV",
  "B0D8KBPVJR",
  "B0FP4G37KY",
  "B0FC2SGNC1",
  "B0DXF47V9K",
  "B0DX1JQR2W",
  "B09WL44BK1",
  "B09WL53VGC",
  "B0GY4D9KK7",
  "B0GJBHWDZJ",
  "B0GJCJJL8M",
  "B0FKRPB9PY",
  "B0FMDH3YYF",
  "B0GHY3BXQG",
  "B0GGGMCH2M",
  "B08R2XS2JL",
  "B0H6JM1H97",
  "B072ZMMMWG",
  "B07Z4WCWV6",
  "B07Z4XD12L",
  "B0B5TRJWXR",
  "B09Y326T4W",
  "B09Y2ZKBB3",
  "B09Y3ZXVQX",
  "B0GX9VDPZC",
  "B098DNBC1L",
  "B0DBKV5MN6",
  "B0F3VDBCJS",
])

const catalog = []
for (const item of raw) {
  if (DUPLICATE_ASINS.has(item.asin) || EXCLUDED_SET_ASINS.has(item.asin)) continue
  if (isAudioInterfaceAccessoryTitle(item.title)) continue
  catalog.push({
    searchRank: catalog.length + 1,
    asin: item.asin,
    title: item.title,
    rating: item.rating,
    reviews: item.reviews,
    price: item.price,
    image: item.image?.replace(/_AC_UY218_/, "_AC_SL1500_") ?? item.image,
  })
}

const out = join(__dirname, "audio-interface-streaming-search-catalog.mjs")
const body = `/**
 * Amazon.co.jp 「配信 オーディオインターフェース」検索（12ページ）
 * ブラウザ抽出: 2026-08-15 / 269 ASIN → フィルタ後 ${catalog.length} 件
 */
export const AUDIO_INTERFACE_STREAMING_SEARCH_CATALOG = ${JSON.stringify(catalog, null, 2)}
`
writeFileSync(out, body)
console.log(`Wrote ${catalog.length} items to ${out}`)
