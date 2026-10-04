/**
 * Apply verified ASINs to monitor-bestsellers-page2-catalog.json
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOG_PATH = join(__dirname, "monitor-bestsellers-page2-catalog.json")
const PAGE1_PATH = join(__dirname, "..", "lib", "monitor-bestsellers.ts")

/** Verified Amazon.co.jp ASINs for user-specified rank #51–#100 */
const ASIN_BY_RANK = {
  51: "B0DC46F5HK", // Minifire MFG27C1
  52: "B0C6DSXXJV", // KOORUI E2212H
  53: "B0FSR8RKDF", // EIZO EV2740S-AMZBK
  54: "B0FLC2Y42B", // IODATA EX-GD251UH
  55: "B0DNQ7BDT7", // IRIS DP-FF164S-B
  56: "B0G5WLZPTL", // UPERFECT 18.5" 120Hz
  57: "B0DZNM8V94", // LivElect 15.6"
  58: "B0GYHL3RQ5", // cocopar C-16QH
  59: "B0GYPVGG2D", // LG 27U711B-B
  60: "B0F32NVN1T", // IODATA EX-D242SA-F
  61: "B0CPF8B7V7", // AOC 24G4
  62: "B0DK1F8RGD", // UPERFECT デュアル 15.6"
  63: "B0GRGRV5JS", // KOORUI G2711P
  64: "B0CTMC2ZQH", // BenQ GW2490
  65: "B0FRS96GV9", // IODATA EX-GDQ271UA
  66: "B0F6D19M1C", // LG 29U511A-B
  67: "B0B2RCT6CR", // ARZOPA 15.6" 144Hz
  68: "B0FNCVVM8B", // KTC H27F7
  69: "B0CV7M63LH", // MSI PRO MP273AW
  70: "B0C32SVFDQ", // ASUS ROG PG27AQDM
  71: "B07V5BHZLW", // Philips 271E1D/11
  72: "B0B2P49LJX", // Innocn 27M2U
  73: "B08HLL1FN7", // AOC 27G2E5/11
  74: "B0BK7Q3J8N", // Pixio PX277 PRO
  75: "B0FX42YJQC", // IODATA EX-GD254U (24.5" 320Hz)
  76: "B09MHQNH18", // kksmart NK-133
  77: "B0GR4Q6FL4", // Dell S3425DW
  78: "B0DFLQG2S3", // Upperizon G-133Q
  79: "B09TGZCV4N", // VisionOwl 14"
  80: "B0DPFYHXR9", // Dopesplay 10.5"
  81: "B09M3GLDY2", // BenQ EW2880U
  82: "B0CH7ZWQD5", // IODATA EX-GDQ271JA
  83: "B08KGM1SJ8", // BenQ XL2546K
  84: "B093MTSTKD", // LG 27GP850-B
  85: "B08WLS4VQ5", // Acer EK270Bbix (best match: KB272bmix 75Hz IPS HDMI/VGA)
  86: "B08WK8Y8L5", // JAPANNEXT JN-IPS2800UHDR
  87: "B0CNXTWVN5", // ViewSonic VX2428
  88: "B0CHM9KR2L", // Dell AW2524HF
  89: "B0BBMLMCQT", // EVICIV 17.3" 2K 144Hz
  90: "B0C15K7C5S", // MSI Modern MD271UL
  91: "B088BH4X5W", // ASUS ProArt PA278QV
  92: "B08GKCD2NW", // IODATA EX-LDC151DBM
  93: "B087612T9B", // AOC CU34G2X/11
  94: "B0CKVJDGSV", // KOORUI 24E4
  95: "B08DNQXFPG", // LG 32UN880-B
  96: "B099545PH8", // BenQ EX2710S
  97: "B08CMRR74S", // EIZO EV2795-BK
  98: "B097SLKH5G", // HP M24f
  99: "B0CP928BL3", // Amazon Basics 27" 100Hz
  100: "B0DY15G5W8", // Minifire MFG25X1 24.5" 240Hz
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"))
const page1Src = readFileSync(PAGE1_PATH, "utf8")
const page1Asins = new Set([...page1Src.matchAll(/dp\/([A-Z0-9]{10})/g)].map((m) => m[1]))

for (const item of catalog) {
  const asin = ASIN_BY_RANK[item.rank]
  if (asin) item.asin = asin
}

writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2))

const missing = catalog.filter((x) => !x.asin).map((x) => x.rank)
const dupes = Object.entries(
  catalog.reduce((acc, x) => {
    if (!x.asin) return acc
    if (!acc[x.asin]) acc[x.asin] = []
    acc[x.asin].push(x.rank)
    return acc
  }, {}),
).filter(([, ranks]) => ranks.length > 1)

const page1Dupes = catalog.filter((x) => x.asin && page1Asins.has(x.asin)).map((x) => ({
  rank: x.rank,
  asin: x.asin,
  name: x.name,
}))

console.log(`Patched ${catalog.length} items, missing: ${missing.length}`, missing)
console.log("Page2 duplicate ASINs:", dupes)
console.log("Overlaps with page1:", page1Dupes)
