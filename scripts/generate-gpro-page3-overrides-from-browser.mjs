/**
 * Browser CDP product data → mouse-gpro-page3-spec-overrides.json
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { formatWeight } from "./amazon-mouse-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CDP_PATH =
  process.argv[2] ??
  "C:\\Users\\mnmap\\.cursor\\browser-logs\\cdp-response-gpro-page3-specs.json"
const RAW_PATH = join(__dirname, "mouse-gpro-page3-raw.json")
const OUT_PATH = join(__dirname, "mouse-gpro-page3-spec-overrides.json")

function extractWeight(title, flat) {
  const fromTitle = title.match(/(\d{2,3})\s*g\b/i)?.[1]
  if (fromTitle) return `${fromTitle} g`
  const oz = title.match(/([\d.]+)\s*oz\s*\(([\d.]+)\s*g\)/i)
  if (oz) return `${Math.round(Number(oz[2]))} g`
  const w = flat["Item Weight"] ?? flat["商品の重量"]
  if (w) {
    const fmt = formatWeight(w)
    if (fmt && fmt !== "—") return fmt
  }
  return null
}

function inferReading(title, flat) {
  const hay = `${title} ${flat["センサー"] ?? ""} ${flat["Pattern"] ?? ""} ${flat["Movement Detection"] ?? ""} ${flat["Mouse Maximum Sensitivity"] ?? ""}`
  if (/focus pro 45k|45k optical|45k sensor/i.test(hay)) return "光学式（Focus Pro 45K）"
  if (/focus pro 35k|35000dpi|35k sensor/i.test(hay)) return "光学式（Focus Pro 35K）"
  if (/hero\s*44k|hero44k/i.test(hay)) return "光学式（HERO 44K）"
  if (/hero\s*25k|hero25k|g502/i.test(hay)) return "光学式（HERO 25K）"
  if (/hero\s*2\b|hero2/i.test(hay)) return "光学式（HERO 2）"
  if (/hero\s*16k|hero16k/i.test(hay)) return "光学式（HERO 16K）"
  if (/hero\s*12k|hero12k/i.test(hay)) return "光学式（HERO 12K）"
  if (/paw3950|3950 sensor/i.test(hay)) return "光学式（PAW3950）"
  if (/paw3395|3395/i.test(hay)) return "光学式（PAW3395）"
  if (/paw3311|3311/i.test(hay)) return "光学式（PAW3311）"
  if (/16k dpi|16000 dpi|最大16k/i.test(hay)) return "光学式（16K DPI）"
  if (/5g optical|5g オプティカル|18000dpi|18,000dpi/i.test(hay)) return "光学式（5G / 18K DPI）"
  if (/8000 dpi|8000dpi/i.test(hay)) return "光学式（8K DPI）"
  if (/optical|光学|オプティカル/i.test(hay)) return "光学式"
  return "—"
}

function inferConnection(title, flat) {
  const hay = `${title} ${flat["Connectivity Technology"] ?? ""}`
  const parts = []
  if (/lightspeed|2\.4\s*ghz|2\.4g\b|hyper\s*speed|hyperspeed|wireless receiver|ワイヤレス/i.test(hay)) {
    if (/lightspeed/i.test(hay)) parts.push("2.4GHz (LIGHTSPEED)")
    else if (/hyperspeed|hyper\s*speed/i.test(hay)) parts.push("2.4GHz (HyperSpeed)")
    else parts.push("2.4GHz (USBレシーバー)")
  }
  if (/bluetooth|ブルートゥース/i.test(hay)) parts.push("Bluetooth")
  const wiredOnly =
    (/有線|wired|corded|usb接続/i.test(hay) || flat["Power Source"] === "Corded Electric") &&
    !/wireless|ワイヤレス|lightspeed|hyperspeed/i.test(hay)
  if (wiredOnly) return "有線 USB"
  if (/usb-c|type-c|usb type-c/i.test(hay) && parts.length) parts.push("USB-C")
  if (/有線|wired/i.test(hay) && parts.length) parts.push("有線")
  if (parts.length) return parts.join(" / ")
  return "—"
}

function inferPower(title, flat) {
  const hay = `${title} ${flat["Power Source"] ?? ""} ${flat["Number of Batteries"] ?? ""}`
  if (/単3|aa battery|1 aa|単3形|単4形/i.test(hay)) return "単3形乾電池×1本"
  if (/corded|有線給電|wired/i.test(hay) && !/wireless|ワイヤレス/i.test(title)) {
    return "有線給電"
  }
  if (/usb-c|type-c/i.test(hay)) return "充電式 (USB-C)"
  if (/micro-usb|micro usb/i.test(hay)) return "充電式 (Micro-USB)"
  if (/rechargeable|充電式|battery powered|内蔵バッテリー/i.test(hay) && !/aa/i.test(hay)) {
    return "充電式（内蔵バッテリー）"
  }
  return "—"
}

function inferButtons(title, flat) {
  const qty = flat["Button Quantity"] ?? flat["ボタン数"]
  const n = qty ? Number(String(qty).match(/(\d+)/)?.[1]) : null
  if (n && n >= 2 && n <= 20) return String(n)
  const fromTitle = title.match(/(\d+)\s*(?:programmable\s*)?buttons?|(\d+)ボタン|(\d+)個プログラム/i)
  const btn = fromTitle?.[1] ?? fromTitle?.[2] ?? fromTitle?.[3]
  if (btn) return btn
  return "—"
}

function inferBrand(title) {
  const rules = [
    ["Logicool G", /logicool\s*g|logitech\s*g|ロジクール\s*g/i],
    ["Logicool", /logicool|logitech|ロジクール/i],
    ["Razer", /razer|レイザー/i],
    ["CORSAIR", /corsair/i],
    ["Redragon", /redragon/i],
    ["Philips", /philips|フィリップス|evnia/i],
    ["MSI", /\bmsi\b/i],
    ["Pulsar", /pulsar/i],
    ["LAMZU", /lamzu/i],
    ["LAMZU", /lamzu/i],
    ["STORIA", /storia/i],
    ["AIM1", /aim1/i],
    ["ASUS", /\basus\b|tuf gaming/i],
    ["ASUS", /\basus\b|tuf gaming/i],
    ["BenQ", /benq|zowie/i],
    ["AIM1", /aim1/i],
    ["Elecom", /elecom|エレコム/i],
  ]
  for (const [brand, re] of rules) if (re.test(title)) return brand
  return null
}

function inferName(title, brand) {
  const patterns = [
    /G-PPD-[A-Z0-9-]+/i,
    /GPROXSL-WLDEX[A-Z]*/i,
    /G502XWL-[A-Z]+/i,
    /G502 X LIGHTSPEED/i,
    /Viper V3 Pro/i,
    /DeathAdder V4 Pro/i,
    /Naga V2 Pro/i,
    /SPK9618/i,
    /M719-WL/i,
    /Orochi V2/i,
    /VERSA 300 W/i,
    /CrazyLight/i,
    /Basilisk Mobile/i,
    /ZA13-DW/i,
    /MAYA X REJECT/i,
    /MAYA REJECT/i,
    /X2 v3/i,
    /G903h/i,
    /MX MASTER 4/i,
    /M550MBKs/i,
    /TUF Gaming M3 Gen II/i,
  ]
  for (const re of patterns) {
    const m = title.match(re)
    if (m) return m[0].trim()
  }
  const stripped = title
    .replace(new RegExp(`^${brand ?? ""}\\s*`, "i"), "")
    .replace(/^【[^】]+】\s*/g, "")
    .split(/[|｜]/)[0]
    .trim()
  return stripped.length > 72 ? stripped.slice(0, 69) + "…" : stripped || title.slice(0, 72)
}

const MODEL_DEFAULTS = {
  "G-PPD-002XWL": {
    reading: "光学式（HERO 2）",
    weight: "80 g",
    buttonCount: "6",
    connection: "2.4GHz (LIGHTSPEED) / USB-C",
    power: "充電式 (USB-C)",
  },
  "G-PPD-004WL": {
    reading: "光学式（HERO 2）",
    weight: "60 g",
    buttonCount: "5",
    connection: "2.4GHz (LIGHTSPEED) / USB-C",
    power: "充電式 (USB-C)",
  },
}

function modelDefaults(title) {
  if (/002XWL/i.test(title)) return MODEL_DEFAULTS["G-PPD-002XWL"]
  if (/004WL|GPROXSL-WLDEX/i.test(title)) return MODEL_DEFAULTS["G-PPD-004WL"]
  return {}
}

const cdp = existsSync(CDP_PATH) ? JSON.parse(readFileSync(CDP_PATH, "utf8")) : {}
const data = cdp.result?.value ?? cdp
const raw = existsSync(RAW_PATH) ? JSON.parse(readFileSync(RAW_PATH, "utf8")) : { mice: [] }
const overrides = {}

for (const item of raw.mice) {
  const entry = data[item.asin] ?? {}
  const title = entry.title ?? item.title
  const flat = entry.specs ?? {}
  const brand = inferBrand(title) ?? "—"

  const o = {
    brand,
    name: inferName(title, brand),
    price: entry.price ?? item.price ?? undefined,
    connection: inferConnection(title, flat),
    reading: inferReading(title, flat),
    power: inferPower(title, flat),
    weight: extractWeight(title, flat),
    buttonCount: inferButtons(title, flat),
  }

  const defs = modelDefaults(title)
  for (const [k, v] of Object.entries(defs)) o[k] = v

  if (/lamzu maya/i.test(title) && /8k dongle/i.test(title)) {
    o.connection = "2.4GHz (USBレシーバー) / USB-C"
    o.brand = "LAMZU"
  }
  if (/aim1 shigure/i.test(title)) o.name = "AIM1 Shigure"
  if (/storia.*kikyo/i.test(title)) o.name = "STORIA Kikyo"
  if (/storia.*shion/i.test(title)) o.name = "STORIA Shion"
  if (/004wl-bkd/i.test(title) && !/dex/i.test(title)) o.buttonCount = "5"
  if (/004wl-bkd/i.test(title) && /superlight 2/i.test(title)) o.name = "G PRO X SUPERLIGHT 2 G-PPD-004WL-BKd"
  if (/002xwl-bkd/i.test(title)) o.name = "G PRO 2 LIGHTSPEED G-PPD-002XWL-BKd"
  if (/GPROXSL-WLDEX/i.test(title)) o.name = `G PRO X SUPERLIGHT 2 DEX ${title.match(/GPROXSL-WLDEX[A-Z]*/i)?.[0] ?? ""}`.trim()

  if (entry.image) o.image = entry.image.replace(/\._AC_[^.]+_\./, "._AC_SL1500_.")

  overrides[item.asin] = Object.fromEntries(
    Object.entries(o).filter(([, v]) => v != null && v !== "—" && v !== undefined),
  )
}

writeFileSync(OUT_PATH, JSON.stringify(overrides, null, 2) + "\n")
console.log(`Wrote ${OUT_PATH} (${Object.keys(overrides).length} ASINs)`)
