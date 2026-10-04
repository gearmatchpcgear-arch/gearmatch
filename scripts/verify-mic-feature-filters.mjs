import { allSourceGadgets } from "../lib/gadgets.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import {
  hasMicFeatureTag,
  hasMicSpreadsheetNoiseCancelFilter,
  inferMicCoreFeatureTags,
  MIC_FEATURE_TAGS,
} from "../lib/mic-feature-tags.ts"
import { hasMicSpreadsheetJTag } from "../lib/mic-spreadsheet-tags.ts"

const mics = allSourceGadgets.filter((g) => g.category === "mic")
const groups = getFilterGroupsForCategory("mic", mics)

const featureGroup = groups.find((g) => g.id === "mic-feature")
const sheetJGroup = groups.find((g) => g.id === "mic-sheet-j")

console.log("Feature group filters:", featureGroup?.filters.map((f) => f.label).join(" | "))
console.log("その他機能 group exists:", sheetJGroup ? "YES (unexpected)" : "NO")

const jNoise = mics.filter((g) => hasMicSpreadsheetJTag(g, "ノイズキャンセリング"))
const filterNoise = mics.filter((g) => hasMicFeatureTag(g, "ノイズキャンセリング"))
const asmr = mics.filter((g) => hasMicFeatureTag(g, "ASMR"))

console.log("J欄 ノイズキャンセリング:", jNoise.length)
console.log("フィルター ノイズキャンセリング:", filterNoise.length)
console.log("ASMR:", asmr.length, asmr.map((g) => g.id).join(", "))

const oldLabel = featureGroup?.filters.some((f) => f.label === "ノイズキャンセリング機能")
console.log("旧ラベル「ノイズキャンセリング機能」:", oldLabel ? "残存" : "削除済み")

const legacyExplicit = mics.filter((g) =>
  (g.micFeatureTags ?? []).includes("ノイズキャンセリング機能"),
)
const legacyInFilter = legacyExplicit.filter((g) => hasMicFeatureTag(g, "ノイズキャンセリング"))
console.log("旧 micFeatureTags「ノイズキャンセリング機能」件数:", legacyExplicit.length)
console.log("うち新フィルターに誤ヒット:", legacyInFilter.length, "(期待: J欄と一致分のみ)")

const noiseFilter = featureGroup?.filters.find((f) => f.id === "mic-feat-noise-cancel")
console.log("mic-feat-noise-cancel UI count:", mics.filter((g) => noiseFilter?.match(g)).length)
