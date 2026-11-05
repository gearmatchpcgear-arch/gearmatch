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

const mouseRange = computePriceSliderMax([12_000, 49_800], "mouse")
if (mouseRange !== 25_000) {
  console.error("FAIL computePriceSliderMax mouse fixed 25k", { mouseRange })
  failed++
}

const keyboardRange = computePriceSliderMax([18_000, 44_000], "keyboard")
if (keyboardRange !== 30_000) {
  console.error("FAIL computePriceSliderMax keyboard fixed 30k", { keyboardRange })
  failed++
}

const micRange = computePriceSliderMax([15_000, 40_000], "mic")
if (micRange !== 35_000) {
  console.error("FAIL computePriceSliderMax mic fixed 35k", { micRange })
  failed++
}

const cameraRange = computePriceSliderMax([8_000, 25_000], "camera")
if (cameraRange !== 35_000) {
  console.error("FAIL computePriceSliderMax camera fixed 35k", { cameraRange })
  failed++
}

const chairRange = computePriceSliderMax([45_000, 80_000], "gaming-chair")
if (chairRange !== 70_000) {
  console.error("FAIL computePriceSliderMax gaming-chair fixed 70k", { chairRange })
  failed++
}

const armRange = computePriceSliderMax([6_000, 22_000], "monitor-arm")
if (armRange !== 15_000) {
  console.error("FAIL computePriceSliderMax monitor-arm fixed 15k", { armRange })
  failed++
}

if (failed > 0) {
  console.error(`${failed} verification(s) failed`)
  process.exit(1)
}

console.log("verify-parse-price: ok")
