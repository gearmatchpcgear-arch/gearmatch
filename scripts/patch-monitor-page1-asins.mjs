/**
 * Apply verified ASINs to monitor-bestsellers-page1-catalog.json
 */
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CATALOG_PATH = join(__dirname, "monitor-bestsellers-page1-catalog.json")

/** Verified / best-match Amazon.co.jp ASINs for user-specified rank #1–#50 */
const ASIN_BY_RANK = {
  1: "B07ZNTHZHZ",
  2: "B0D1K8H4F5",
  3: "B0D9K624F9",
  4: "B0FPF1HGT8",
  5: "B0DNDXMLR7",
  6: "B0CDBS93QZ",
  7: "B0CPXQQLL2",
  8: "B0DD6GJVV5",
  9: "B0F6CVWFYB", // LG 27U731SA-W Smart Monitor 4K (27SQ750S-W 相当)
  10: "B0CFXKB7T2",
  11: "B0DZ6LG8PZ",
  12: "B0GNRS88NQ",
  13: "B0D9K8WK2Q",
  14: "B09SV4VKXR",
  15: "B0FCQPC9FQ",
  16: "B0BQF3JKQF",
  17: "B0CKYNFG4B",
  18: "B0F9WJLW45",
  19: "B0F18KF4HH",
  20: "B0CTM6T5C2",
  21: "B0FH58W9NF",
  22: "B0CLNTRCXV",
  23: "B0CXXR9HRQ",
  24: "B011OBZ5Y4",
  25: "B0BLRZ5HJM",
  26: "B0C9PVL4FM",
  27: "B0B3DS23NB",
  28: "B08KGPL974",
  29: "B0BNTNRBHK",
  30: "B0CDVYWRXZ",
  31: "B0CZWZLJVQ",
  32: "B07Y2Z7CQ2",
  33: "B07Y5VJ8XG",
  34: "B0BC28DHZ6",
  35: "B0F2DY8BF7",
  36: "B094D5J7T8",
  37: "B0C7B8YQ8K",
  38: "B077SBB5SH",
  39: "B0F6N5GXNX",
  40: "B0GVYKG7CW",
  41: "B0DFXYMGVR",
  42: "B07LH1ZDSL",
  43: "B0CLNT2VWZ",
  44: "B0G42QB93M",
  45: "B08R9GYRQG",
  46: "B0FX4V8L8N",
  47: "B0F23DY221",
  48: "B0DPKL9R3Q",
  49: "B0DQKY19KV",
  50: "B0DZ5BRBZ7",
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"))

for (const item of catalog) {
  const asin = ASIN_BY_RANK[item.rank]
  if (asin) item.asin = asin
}

writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2))

const asins = catalog.map((x) => x.asin)
const missing = catalog.filter((x) => !x.asin).map((x) => x.rank)
const dupes = Object.entries(
  asins.reduce((acc, a, i) => {
    if (!a) return acc
    if (!acc[a]) acc[a] = []
    acc[a].push(catalog[i].rank)
    return acc
  }, {}),
).filter(([, ranks]) => ranks.length > 1)

console.log(`Patched ${catalog.length} items, missing: ${missing.length}`, missing)
console.log("Duplicates:", dupes)
