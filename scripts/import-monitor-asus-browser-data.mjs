/**
 * Browser-scraped ASUS monitor search → monitor-asus-search-raw.json
 * Run after scraping via browser CDP when node fetch is blocked.
 */
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { isMonitorAccessory } from "./fetch-monitor-bestsellers.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, "monitor-asus-search-raw.json")
const BASE_URL =
  "https://www.amazon.co.jp/s?i=computers&rh=n%3A2151982051%2Cp_123%3A219979"

/** Paste browser Runtime.evaluate items here when re-importing */
const BROWSER_ITEMS = [
  {
    amazonRank: 1,
    asin: "B08LGHP4C7",
    image: "https://m.media-amazon.com/images/I/71O2ThvdW6L._AC_UL320_.jpg",
    price: 14980,
    rating: 4,
    reviews: 0,
    title:
      "【Amazon.co.jp限定】ASUS VY279HGR Eye Care Monitor / 27-Inch FHD (1920 x 1080) / IPS / 120Hz (OC) / SmoothMotion / 1ms (MPRT) / Adaptive Sync / Blue Light Reduction / Flicker-Free / Antibacterial",
  },
  {
    amazonRank: 2,
    asin: "B0F9WJLW45",
    image: "https://m.media-amazon.com/images/I/71hhyOqLuZL._AC_UL320_.jpg",
    price: 16980,
    rating: 4,
    reviews: 0,
    title:
      "【Amazon.co.jp Exclusive】ASUS Gaming Monitor / TUF Gaming VG259Q5A – 24.5-in. / Full HD (1920x1080) / 200Hz / Fast IPS/ELMB / 0.3ms GTG (Min) / Stereo Speakers/DisplayWidget Center/Domestic Genuine",
  },
  {
    amazonRank: 3,
    asin: "B09TDSC9WS",
    image: "https://m.media-amazon.com/images/I/71WgxfjK38L._AC_UL320_.jpg",
    price: 36800,
    rating: 4,
    reviews: 0,
    title:
      "【Amazon.co.jp限定】ASUS Gaming Monitor ROG Strix XG259CMS 24.5 Inches / HDR / 310Hz / 1ms (GTG) / Fast IPS / Extreme Low Motion Blur Sync / USB Type-C / G-Sync Compatible / Tripod Socket / Authentic",
  },
  {
    amazonRank: 4,
    asin: "B086ZSRRDB",
    image: "https://m.media-amazon.com/images/I/813B6KjWmlL._AC_UL320_.jpg",
    price: 65800,
    rating: 4,
    reviews: 0,
    title:
      "ASUS 4K Monitor ProArt PA279CRV-J / 27 inches / [DGP Imaging Award 2025 Gold Prize] / IPS/HDMI/DisplayPort/USB Type-C (96W Power Delivery) / 99% DCI-P3 / 99% Adobe RGB/Color Accuracy ΔE < 2 / VESA",
  },
  {
    amazonRank: 5,
    asin: "B07MDV2L3S",
    image: "https://m.media-amazon.com/images/I/71LeL2ZyntL._AC_UL320_.jpg",
    price: 24280,
    rating: 4,
    reviews: 0,
    title:
      "ASUS Eye Care VA329HE-J Monitor, 31.5-Inch / Full HD (1920 x 1080) / IPS / HDMI x 2 / 75 Hz / Blue Light Reduction / Flicker-Free / VESA Compatible / 4-Year Warranty / Authentic Japanese Product",
  },
  {
    amazonRank: 6,
    asin: "B0D2948FZD",
    image: "https://m.media-amazon.com/images/I/71QTohvgVhL._AC_UL320_.jpg",
    price: 46000,
    rating: 4,
    reviews: 0,
    title:
      "【Amazon.co.jp Exclusive】ASUS TUF Gaming VG34VQL3A 34-inch/180Hz/WQHD/1ms/FreeSync Premium Pro/Domestic Genuine Product",
  },
  {
    amazonRank: 7,
    asin: "B09BLF98K2",
    image: "https://m.media-amazon.com/images/I/91fgUa-f+rL._AC_UL320_.jpg",
    price: 73535,
    rating: 4,
    reviews: 0,
    title:
      "ASUS ROG Strix OLED XG27AQDMES-J | 27-inch Gaming Monitor 240 hz WQHD (2560 x 1440) OLED 0.03 ms Organic EL",
  },
  {
    amazonRank: 8,
    asin: "B0GZ21C95F",
    image: "https://m.media-amazon.com/images/I/81xjP36DeIL._AC_UL320_.jpg",
    price: 23616,
    rating: 4,
    reviews: 0,
    title:
      "[Amazon.co.jp Exclusive] ASUS ZenScreen MB16FC-J Portable Monitor - 16 inch, 16:10 Screen Ratio, WUXGA (1920 x 1200) Resolution, IPS Panel, Pass-Through Power Supply, Automatic Rotation, USB Type-C",
  },
  {
    amazonRank: 9,
    asin: "B09TKJQHLQ",
    image: "https://m.media-amazon.com/images/I/91JZfPPJquL._AC_UL320_.jpg",
    price: 68000,
    rating: 4,
    reviews: 0,
    title:
      "ASUS OLED Gaming Monitor ROG Strix OLED XG27AQDMG (26.5 inches/2560x1440/WOLED OLED/240Hz/0.03ms(GTG)/99% DCI-P3/DisplayPort 1.4/HDMI/Domestic Genuine Product)",
  },
  {
    amazonRank: 10,
    asin: "B0GY3SM484",
    image: "https://m.media-amazon.com/images/I/916Nitcjf5L._AC_UL320_.jpg",
    price: 217091,
    rating: 4,
    reviews: 0,
    title:
      'ROG Gaming Monitor / ROG Swift OLED PG32UCDM3 / 32" / 4K / QD-OLED Panel / 240 Hz / BlackShield Film / G-SYNC Compatible / 1ms / Neo Proximity Sensor / DisplayHDR 500 True Black / 90W Type-C',
  },
  {
    amazonRank: 11,
    asin: "B0921CPSNX",
    image: "https://m.media-amazon.com/images/I/81LL6ybSGOL._AC_UL320_.jpg",
    price: 49209,
    rating: 4,
    reviews: 0,
    title:
      "ASUS ProArt PA278CV Monitor, 27 Inch, 3 Year Dead Pixel Replacement Warranty/WQHD/IPS/USB Type-C DisplayPort Daisy Chain, HDMI/100% sRGB/100% Rec. 709/ΔE<2/Domestic Genuine Product",
  },
  {
    amazonRank: 12,
    asin: "B09CD5SV4H",
    image: "https://m.media-amazon.com/images/I/91GPT9EJUmL._AC_UL320_.jpg",
    price: 108000,
    rating: 4,
    reviews: 0,
    title:
      'ROG OLED Gaming Monitor / ROG Strix OLED XG27AQWMG / 27" / 1440p TrueBlack Glossy Tandem OLED / 280 Hz / 0.3 ms / Neo Proximity Sensor / VESA DisplayHDR True Black 500 / DCI-P3 99% Coverage Rate',
  },
  {
    amazonRank: 13,
    asin: "B0H3Z2PZNF",
    image: "https://m.media-amazon.com/images/I/71-AxNYa3eL._AC_UL320_.jpg",
    price: 220469,
    rating: 4,
    reviews: 0,
    title:
      "ASUS ROG Swift 27インチ エディション 20 OLED ゲーミングモニター (PG27AQWP-G) | 26.5インチ QHD WOLED デュアルモード (QHD@540Hz、HD@720Hz)、0.02ms 99.5% DCI-P3色域 TrueBlack 光沢",
  },
  {
    amazonRank: 14,
    asin: "B0G4D34W46",
    image: "https://m.media-amazon.com/images/I/71K3gAcUA-L._AC_UL320_.jpg",
    price: 24364,
    rating: 4,
    reviews: 0,
    title:
      "ASUS Gaming Monitor / TUF Gaming Series 5 - VG249QML5A / 23.8 inches / Full HD / Fast - IPS Panel / 240Hz / 0.3ms / G-SYNC Compatible / AMD FreeSync Premium / ELMB SYNC / 99% sRGB / Height Adjustable / DisplayWidget Center / Gaming AI",
  },
  {
    amazonRank: 15,
    asin: "B0DVBFRTJG",
    image: "https://m.media-amazon.com/images/I/91ZHpCIh8vL._AC_UL320_.jpg",
    price: 178000,
    rating: 4,
    reviews: 0,
    title:
      'ASUS OLED 4K Gaming Monitor ROG Swift OLED PG27UCDM 27" / 4K Gen 4 Quantum Dot OLED Panel / 240Hz / 0.03ms / OLED Anti-Flicker / G-SYNC / VESA Display HDR 400 True Black / DisplayPort 2.1a UHBR20',
  },
  {
    amazonRank: 16,
    asin: "B0FQC2YS28",
    image: "https://m.media-amazon.com/images/I/811Vyb2oSQL._AC_UL320_.jpg",
    price: null,
    rating: 4,
    reviews: 0,
    title:
      "ASUS 6K Monitor ProArt PA32QCV / 31.5 inch / [DGP Imaging Award 2025 Gold Award] / IPS/HDMI/DisplayPort/Thunderbolt 4 (96W Power) / Auto KVM / 98% DCI-P3 / Color Accuracy ΔE < 2 / VESA Display HDR 600",
  },
  {
    amazonRank: 17,
    asin: "B0BRY53CZM",
    image: "https://m.media-amazon.com/images/I/81NHkNCnf2L._AC_UL320_.jpg",
    price: 25800,
    rating: 4,
    reviews: 0,
    title:
      "ASUS Portable Monitor ZenScreen MB16AHV 16-Inch (15.6-Inch Display) / Full HD (1920 x 1080) / IPS / HDMI / USB Type C / Blue Light Filter / Non Glare Panel / Antibacterial Treatment / Domestic Genuine Product",
  },
  {
    amazonRank: 18,
    asin: "B0G1YQZZLW",
    image: "https://m.media-amazon.com/images/I/81uNaOT8OLL._AC_UL320_.jpg",
    price: 180000,
    rating: 4,
    reviews: 0,
    title:
      'ROG Swift OLED PG27AQWP-W/Gaming Monitor / 26.5" / 2560x1440 Resolution / Tandem OLED Panel / QHD 540Hz, HD 720Hz Switchable / Fast Response 0.02ms / VESA Display HDR 500 True Black / DisplayPort 2.1a',
  },
  {
    amazonRank: 19,
    asin: "B0D3GZXQ4Q",
    image: "https://m.media-amazon.com/images/I/51oBwol1koL._AC_UL320_.jpg",
    price: 19800,
    rating: 4,
    reviews: 0,
    title:
      "【Amazon.co.jp Exclusive】ASUS Portable Monitor ZenScreen MB166CR-J 16 Inches (15.6 Inches Display)/Full HD/IPS/USB Type-C/Flicker Free/Blue Light Filter/Non-Glare Panel/360° Kickstand/4-Year Warranty",
  },
  {
    amazonRank: 20,
    asin: "B07LH1ZDSL",
    image: "https://m.media-amazon.com/images/I/71EcpHY3zZL._AC_UL320_.jpg",
    price: null,
    rating: 4,
    reviews: 0,
    title: "ASUS Eyer Care VZ249HR Monitor",
  },
  {
    amazonRank: 21,
    asin: "B0F6XTTMNN",
    image: "https://m.media-amazon.com/images/I/81HQF+IHPSL._AC_UL320_.jpg",
    price: 45800,
    rating: 4,
    reviews: 0,
    title:
      "[Amazon.co.jp Exclusive] ASUS Monitor / VA27UCPS - 27 inch / 4K UHD (3840 x 2160) / IPS Panel / 99% sRGB/HDR-10 / USB-C 65W Power Supply / Height Adjustable with Vertical and Horizontal Rotation Function / Stereo Speaker / Flicker Free / Blue Light Filter / Ergonomic Design / Wall Mount Compatible /Environmental Sustina Visibility/Domestic Genuine Product",
  },
  {
    amazonRank: 22,
    asin: "B0FJ19QDXL",
    image: "https://m.media-amazon.com/images/I/41zxC8HRn2L._AC_UL320_.jpg",
    price: null,
    rating: 4,
    reviews: 0,
    title: "ASUS VA279QGZ [27-inch]",
  },
  {
    amazonRank: 23,
    asin: "B0CJ56JD6R",
    image: "https://m.media-amazon.com/images/I/51WrtjKiX7L._AC_UL320_.jpg",
    price: null,
    rating: 4,
    reviews: 0,
    title:
      "【Amazon.co.jp Exclusive】ASUS Gaming Monitor TUF Gaming VG27AQ3A 27 Inch/QHD/Fast IPS/180Hz/1ms/G-SYNC Compatible/Speaker/3-Year Warranty",
  },
  {
    amazonRank: 24,
    asin: "B0813TDWJB",
    image: "https://m.media-amazon.com/images/I/81UjEdt53nL._AC_UL320_.jpg",
    price: null,
    rating: 4,
    reviews: 0,
    title:
      "【Amazon.co.jp限定】ASUS Gaming Monitor VG258QR-J 24.5 Inch FHD 165Hz TN 0.5ms HDMI1.4 DisplayPort1.2 DVI-D Speaker Height Adjustment Swivel",
  },
]

const raw = BROWSER_ITEMS.map((item) => ({
  ...item,
  image: normalizeAmazonImageUrl(item.image),
  reviews: item.reviews ?? 0,
}))

const excluded = raw.filter((item) => isMonitorAccessory(item.title))
const monitors = raw.filter((item) => !isMonitorAccessory(item.title))

writeFileSync(
  OUT_PATH,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      sourceUrl: BASE_URL,
      totalPages: 1,
      scrapeMethod: "browser",
      monitors,
      excluded,
      raw,
    },
    null,
    2,
  ),
)

console.log(`Wrote ${OUT_PATH}: kept=${monitors.length}, excluded=${excluded.length}`)
