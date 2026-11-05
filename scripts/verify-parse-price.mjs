import {
  computePriceSliderMax,
  matchesPriceRange,
  parsePrice,
} from "../lib/price-filter.ts"

const cases = [
  [null, null],
  [undefined, null],
  ["", null],
  ["-", null],
  ["—", null],
  [375, 375],
  ["375", 375],
  ["¥3,750", 3750],
  ["3,980", 3980],
  ["１２,３４５", 12345],
  [Number.NaN, null],
  ["abc", null],
]

let failed = 0
for (const [input, expected] of cases) {
  const actual = parsePrice(input)
  if (actual !== expected) {
    console.error("FAIL", { input, expected, actual })
    failed++
  }
}

const gadget = { price: "¥5,980" }
if (!matchesPriceRange(gadget, { min: 5000, max: 6000 })) {
  console.error("FAIL matchesPriceRange string price in range")
  failed++
}
if (matchesPriceRange(gadget, { min: 6000, max: null })) {
  console.error("FAIL matchesPriceRange string price below min")
  failed++
}
if (matchesPriceRange({ price: "-" }, { min: 0, max: 10000 })) {
  console.error("FAIL missing price should be excluded")
  failed++
}

const under100k = computePriceSliderMax([1000, "¥98,000", null, "—"])
if (under100k !== 98_000) {
  console.error("FAIL computePriceSliderMax under 100k", { under100k })
  failed++
}

const cappedCategory = computePriceSliderMax([48_500, "¥12,000"])
if (cappedCategory !== 49_000) {
  console.error("FAIL computePriceSliderMax ceil step", { cappedCategory })
  failed++
}

const over100k = computePriceSliderMax([150_000, 50_000])
if (over100k !== 100_000) {
  console.error("FAIL computePriceSliderMax over 100k", { over100k })
  failed++
}

const noPrices = computePriceSliderMax([null, "—", "-"])
if (noPrices !== 100_000) {
  console.error("FAIL computePriceSliderMax no prices", { noPrices })
  failed++
}

if (failed > 0) {
  console.error(`${failed} verification(s) failed`)
  process.exit(1)
}

console.log("verify-parse-price: ok")
