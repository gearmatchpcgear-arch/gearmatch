/**
 * Verified mic frequency / sample-rate allowlists.
 * Only values backed by Amazon scrape cache or explicit known overrides are kept.
 */
import { readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { MIC_CARD_SPECS_KNOWN, DASH } from "./mic-card-specs-known.mjs"
import { MIC_FREQUENCY_KNOWN } from "./mic-frequency-known.mjs"
import { formatFrequencyResponse } from "./amazon-mic-frequency-response.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))

const FREQ_CACHE_PATH = join(__dirname, "mic-frequency-response-cache.json")
const CARD_CACHE_PATH = join(__dirname, "mic-card-specs-cache.json")

const AMAZON_FREQ_SOURCES = new Set([
  "browser-range",
  "browser-minmax",
  "table",
  "table-range",
  "table-minmax",
  "bullets",
  "description",
  "override",
])

const DEFAULT_FREQ = /^20\s*Hz[-–]20\s*kHz$/i
const DEFAULT_SAMPLE_RATES = [
  /^48\s*kHz\s*\/\s*16\s*bit$/i,
  /^48kHz\/16bit$/i,
  /^16\s*bit\s*\/\s*48\s*kHz$/i,
  /^24bit\s*\/\s*48kHz$/i,
  /^24\s*bit\s*\/\s*48\s*kHz$/i,
]

function loadJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {}
}

const freqCache = loadJson(FREQ_CACHE_PATH)
const cardCache = loadJson(CARD_CACHE_PATH)

function normalizeFreq(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[–—−~〜～]/g, "-")
    .replace(/(\d+)kHz/gi, "$1kHz")
    .replace(/(\d+)Hz/gi, "$1Hz")
    .toLowerCase()
}

function normalizeSampleRate(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace(/[／]/g, "/")
    .toLowerCase()
}

function isDefaultFrequency(value) {
  return DEFAULT_FREQ.test(String(value || "").replace(/\s+/g, ""))
}

function isDefaultSampleRate(value) {
  const n = normalizeSampleRate(value)
  return DEFAULT_SAMPLE_RATES.some((re) => re.test(n))
}

function hasAmazonFrequencyEvidence(asin) {
  const entry = freqCache[asin]
  return Boolean(
    entry?.highlight &&
      entry.highlight !== DASH &&
      entry.source &&
      AMAZON_FREQ_SOURCES.has(entry.source),
  )
}

function hasExplicitKnownFrequency(asin) {
  const value = MIC_CARD_SPECS_KNOWN[asin]?.["周波数特性"]
  return Boolean(value && value !== DASH)
}

function hasManufacturerFrequency(asin) {
  const range = MIC_FREQUENCY_KNOWN[asin]
  if (!range) return false
  if (range.lowHz === 20 && range.highHz === 20000) return false
  return true
}

export function isVerifiedMicFrequency(asin, value) {
  if (!value || value === DASH || value === "-") return true

  if (hasAmazonFrequencyEvidence(asin)) {
    const cached = normalizeFreq(freqCache[asin].highlight)
    if (cached === normalizeFreq(value)) return true
  }

  if (hasExplicitKnownFrequency(asin)) {
    return normalizeFreq(MIC_CARD_SPECS_KNOWN[asin]["周波数特性"]) === normalizeFreq(value)
  }

  if (hasManufacturerFrequency(asin)) {
    const formatted = formatFrequencyResponse(MIC_FREQUENCY_KNOWN[asin]).highlight
    return normalizeFreq(formatted) === normalizeFreq(value)
  }

  if (isDefaultFrequency(value)) return false

  const entry = freqCache[asin]
  if (entry?.source === "known" && entry.highlight && entry.highlight !== DASH) {
    return normalizeFreq(entry.highlight) === normalizeFreq(value)
  }

  return false
}

function hasExplicitKnownSampleRate(asin) {
  const value = MIC_CARD_SPECS_KNOWN[asin]?.["サンプルレート"]
  return Boolean(value && value !== DASH)
}

function hasAmazonSampleRateEvidence(asin) {
  const entry = cardCache[asin]
  const spec = entry?.specs?.["サンプルレート"]
  if (!entry?.hasHtml || !spec?.highlight || spec.highlight === DASH) return false
  if (isDefaultSampleRate(spec.highlight)) return false
  return true
}

export function isVerifiedMicSampleRate(asin, value) {
  if (!value || value === DASH || value === "-") return true

  if (hasExplicitKnownSampleRate(asin)) {
    return (
      normalizeSampleRate(MIC_CARD_SPECS_KNOWN[asin]["サンプルレート"]) ===
      normalizeSampleRate(value)
    )
  }

  if (hasAmazonSampleRateEvidence(asin)) {
    return (
      normalizeSampleRate(cardCache[asin].specs["サンプルレート"].highlight) ===
      normalizeSampleRate(value)
    )
  }

  if (isDefaultSampleRate(value)) return false

  return false
}

export { DASH, isDefaultFrequency, isDefaultSampleRate, normalizeFreq, normalizeSampleRate }
