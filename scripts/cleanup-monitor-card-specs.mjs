/**
 * Backfill monitor card specs (画面サイズ / 解像度 / リフレッシュレート / VESA)
 * from Amazon + local text, then delete cards still missing 2+ fields.
 *
 * Usage:
 *   node scripts/cleanup-monitor-card-specs.mjs --dry-run
 *   node scripts/cleanup-monitor-card-specs.mjs
 *   node scripts/cleanup-monitor-card-specs.mjs --no-fetch
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"
import { chromium } from "playwright"
import {
  inferScreenInches,
  inferResolution,
  inferRefreshRate,
} from "./amazon-monitor-specs.mjs"
import {
  parseAmazonMonitorBodySpecs,
  parseDetailTable,
  DASH,
} from "./amazon-monitor-body-specs.mjs"
import { inferMonitorVesaStandardFromText } from "./monitor-vesa-standard.mjs"
import { resolveMonitorVesaKnown } from "./monitor-vesa-known.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const LIB = join(ROOT, "lib")
const CACHE_PATH = join(__dirname, "monitor-body-specs-cache.json")
const CARD_CACHE_PATH = join(__dirname, "monitor-card-spec-fetch-cache.json")
const DRY = process.argv.includes("--dry-run")
const NO_FETCH = process.argv.includes("--no-fetch")

const MONITOR_FILES = readdirSync(LIB)
  .filter(
    (f) =>
      f.startsWith("monitor-") &&
      f.endsWith(".ts") &&
      !f.includes("arm") &&
      !f.includes("filter") &&
      !f.includes("detail") &&
      !f.includes("vesa"),
  )
  .map((f) => join(LIB, f))

const REFRESH_TAGS = ["refresh-60", "refresh-75", "refresh-100", "refresh-144-plus", "refresh-240-plus"]
const RES_TAGS = ["res-fhd", "res-wqhd", "res-uwqhd", "res-4k", "res-dqhd", "res-5k2k", "res-6k"]

function inferResolutionJp(hay) {
  const text = String(hay)
  if (/フル\s*hd|フルHD/i.test(text) && !/2560|1440|4k|3840/i.test(text)) {
    return "1920 x 1080 (FHD)"
  }
  if (/\bqhd\b/i.test(text) && !/uwqhd|3440/i.test(text)) return "2560 x 1440 (QHD)"
  if (/ワイド\s*qhd|WQHD/i.test(text)) return "2560 x 1440 (QHD)"
  if (/4K|４Ｋ|3840\s*[x×]\s*2160/i.test(text)) return "3840 x 2160 (4K UHD)"
  const base = inferResolution(text)
  return base === DASH ? null : base
}

function resolutionCardDisplay(raw) {
  if (!raw || raw === DASH) return null
  const hay = raw.toLowerCase()
  if (/1920|fhd|1080|フル/i.test(hay)) return "FHD (1920×1080)"
  if (/2560|qhd|1440|wqhd/i.test(hay)) return "QHD (2560 x 1440)"
  if (/3840|4k|2160/i.test(hay)) return "4K (3840×2160)"
  if (/3440|uwqhd/i.test(hay)) return "UWQHD (3440×1440)"
  if (/5120.*2160|5k2k/i.test(hay)) return "5K2K (5120×2160)"
  if (/5120.*1440|dqhd/i.test(hay)) return "5K DQHD (5120×1440)"
  return raw.includes("(") ? raw : raw
}

function formatScreenCard(inches) {
  if (!inches) return null
  const s = String(inches)
  return s.includes('"') ? s : `${inches}"`
}

function formatScreenSpec(inches) {
  if (!inches) return null
  return `${inches} インチ`
}

function formatRefresh(hzText) {
  if (!hzText || hzText === DASH) return null
  const m = String(hzText).match(/(\d{2,3})/)
  if (!m) return null
  return `${m[1]}Hz`
}

function inferRefreshTags(hz) {
  const tags = []
  if (hz <= 60) tags.push("refresh-60")
  else if (hz === 75) tags.push("refresh-75")
  else if (hz < 144) tags.push("refresh-100")
  if (hz >= 144) tags.push("refresh-144-plus")
  if (hz >= 240) tags.push("refresh-240-plus")
  return tags
}

function inferResolutionTags(resRaw) {
  const hay = String(resRaw).toLowerCase()
  const tags = []
  if (/1920|fhd|1080|フル/i.test(hay)) tags.push("res-fhd")
  else if (/2560|qhd|1440|wqhd/i.test(hay)) tags.push("res-wqhd")
  else if (/3440|uwqhd/i.test(hay)) tags.push("res-uwqhd")
  else if (/3840|4k|2160/i.test(hay)) tags.push("res-4k")
  else if (/5120.*2160|5k2k/i.test(hay)) tags.push("res-5k2k")
  else if (/5120.*1440|dqhd/i.test(hay)) tags.push("res-dqhd")
  return tags
}

function inferSizeTags(inches) {
  const tags = []
  if (inches == null) return tags
  if (inches <= 23.8) tags.push("size-238")
  else if (inches >= 24 && inches < 26.5) tags.push("size-24")
  else if (inches >= 26.5 && inches < 30) tags.push("size-27")
  if (inches >= 31.5) tags.push("size-315-plus")
  return tags
}

function extractAmazonDisplaySpecs(html) {
  const map = parseDetailTable(html)
  const title =
    html.match(/id="productTitle"[^>]*>\s*([\s\S]*?)<\/span>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ??
    ""
  const hay = `${title} ${Object.entries(map).map(([k, v]) => `${k} ${v}`).join(" ")}`

  let screenInches = null
  for (const [key, val] of Object.entries(map)) {
    if (/画面サイズ|ディスプレイサイズ|スクリーンサイズ|screen size/i.test(key)) {
      screenInches = inferScreenInches(val) ?? screenInches
    }
  }
  if (!screenInches) screenInches = inferScreenInches(hay)

  let resolution = null
  for (const [key, val] of Object.entries(map)) {
    if (/解像度|ネイティブ解像度|最大解像度|resolution/i.test(key)) {
      resolution = inferResolutionJp(val) ?? resolution
    }
  }
  if (!resolution) resolution = inferResolutionJp(hay)

  let refresh = null
  for (const [key, val] of Object.entries(map)) {
    if (/リフレッシュ|垂直周波数|refresh|hz/i.test(key)) {
      refresh = formatRefresh(inferRefreshRate(val))
    }
  }
  if (!refresh) refresh = formatRefresh(inferRefreshRate(hay))

  const body = parseAmazonMonitorBodySpecs(html)
  let vesa = body.vesaStandard !== DASH ? body.vesaStandard : null
  if (!vesa) {
    const explicit = inferMonitorVesaStandardFromText(hay)
    if (explicit !== DASH) vesa = explicit
  }

  return { hay, screenInches, resolution, refresh, vesa, map }
}

function parseBlocks(source) {
  const blocks = []
  const re = /(\{\s*\n\s*id: "(mon-[^"]+)"[\s\S]*?\n  \},)/g
  let m
  while ((m = re.exec(source))) {
    const block = m[1]
    if (!block.includes('category: "monitor"')) continue
    blocks.push({
      id: m[2],
      block,
      name: block.match(/name: "([^"]*)"/)?.[1] ?? "",
      tagline: block.match(/tagline: "([^"]*)"/)?.[1] ?? "",
      brand: block.match(/brand: "([^"]*)"/)?.[1] ?? "",
      asin: block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1] ?? null,
      file: null,
    })
  }
  return blocks
}

function getField(block, label) {
  const patterns = [
    new RegExp(`\\{\\s*label: "${label}",\\s*value: "([^"]*)"\\s*\\}`),
    label === "リフレッシュレート"
      ? /\{\s*label: "リフレッシュ",\s*value: "([^"]*)"\s*\}/
      : null,
  ].filter(Boolean)
  for (const re of patterns) {
    const m = block.match(re)
    if (m) return m[1]
  }
  return DASH
}

function isFilled(v) {
  return v && v !== DASH && v !== "-"
}

function countMissing(block) {
  const size = getField(block, "画面サイズ")
  const res = getField(block, "解像度")
  const refresh = getField(block, "リフレッシュレート")
  const vesaProp = block.match(/vesaStandard: "([^"]*)"/)?.[1] ?? DASH
  const vesaRow =
    block.match(/\{\s*label: "VESA",\s*value: "([^"]*)"\s*\}/)?.[1] ??
    block.match(/\{\s*label: "壁掛け対応（VESA規格）",\s*value: "([^"]*)"\s*\}/)?.[1] ??
    DASH
  const vesaInfer = inferMonitorVesaStandardFromText(block)
  const vesaKnown = resolveMonitorVesaKnown(
    block.match(/purchaseUrl: "https:\/\/www\.amazon\.co\.jp\/dp\/([A-Z0-9]{10})/)?.[1],
    `${block.match(/name: "([^"]*)"/)?.[1] ?? ""} ${block.match(/tagline: "([^"]*)"/)?.[1] ?? ""} ${block}`,
  )
  const vesa = isFilled(vesaProp)
    ? vesaProp
    : isFilled(vesaRow)
      ? vesaRow
      : vesaInfer !== DASH
        ? vesaInfer
        : vesaKnown ?? DASH

  const resInfer = inferResolutionJp(
    `${block.match(/name: "([^"]*)"/)?.[1] ?? ""} ${block.match(/tagline: "([^"]*)"/)?.[1] ?? ""}`,
  )
  const resEffective = isFilled(res) ? res : resInfer ?? DASH

  let missing = 0
  if (!isFilled(size) && !inferScreenInches(`${block.match(/name: "([^"]*)"/)?.[1] ?? ""} ${block}`)) missing++
  if (!isFilled(resEffective)) missing++
  if (!isFilled(refresh) && !isFilled(formatRefresh(inferRefreshRate(block)))) missing++
  if (!isFilled(vesa)) missing++
  return missing
}

function replaceField(block, label, value) {
  const esc = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  let next = block
  const hlLabel = label === "リフレッシュレート" ? "リフレッシュ" : label
  const hlRe = new RegExp(`(\\{\\s*label: "${hlLabel}",\\s*value: ")[^"]*("\\s*\\})`)
  if (hlRe.test(next)) {
    next = next.replace(hlRe, `$1${esc}$2`)
  } else if (label === "リフレッシュレート") {
    next = next.replace(
      /(highlights: \[\s*\n(?:[^\]]*\n)*?)(\s*\],)/,
      `$1      { label: "リフレッシュ", value: "${esc}" },\n$2`,
    )
  }

  const specRe = new RegExp(`(\\{\\s*label: "${label}",\\s*value: ")[^"]*("\\s*\\})`)
  if (specRe.test(next)) {
    next = next.replace(specRe, `$1${esc}$2`)
  }

  if (label === "解像度") {
    const cardVal = resolutionCardDisplay(value) ?? value
    const cardEsc = cardVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    next = next.replace(
      /\{\s*label: "解像度",\s*value: "[^"]*"\s*\}/g,
      `{ label: "解像度", value: "${cardEsc}" }`,
    )
  }

  if (label === "画面サイズ") {
    const cardVal = formatScreenCard(inferScreenInches(value) ?? inferScreenInches(String(value)))
    if (cardVal) {
      const cardEsc = cardVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      next = next.replace(
        /\{\s*label: "画面サイズ",\s*value: "[^"]*"\s*\}/,
        `{ label: "画面サイズ", value: "${cardEsc}" }`,
      )
    }
  }

  return next
}

function setVesa(block, vesa) {
  const esc = vesa.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  let next = block
  if (/vesaStandard:/.test(next)) {
    next = next.replace(/vesaStandard: "[^"]*"/, `vesaStandard: "${esc}"`)
  } else {
    next = next.replace(/(monitorFilterTags:[^\n]*\n)/, `$1    vesaStandard: "${esc}",\n`)
  }

  const vesaTags = []
  if (vesa === "非対応") vesaTags.push("vesa-none")
  else {
    if (/75\s*[x×]\s*75/.test(vesa)) vesaTags.push("vesa-75")
    if (/100\s*[x×]\s*100/.test(vesa)) vesaTags.push("vesa-100")
    if (/200|以上/.test(vesa)) vesaTags.push("vesa-200-plus")
  }
  const tagRe = /monitorFilterTags: \[([^\]]*)\]/
  const m = next.match(tagRe)
  if (m) {
    const existing = m[1]
      .split(",")
      .map((s) => s.trim().replace(/"/g, ""))
      .filter(Boolean)
      .filter((t) => !/^vesa-/.test(t))
    const merged = [...existing, ...vesaTags]
    next = next.replace(tagRe, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
  }

  const specPatterns = [
    /\{\s*label: "VESA",\s*value: "[^"]*"\s*\}/,
    /\{\s*label: "壁掛け対応（VESA規格）",\s*value: "[^"]*"\s*\}/,
  ]
  let replaced = false
  for (const re of specPatterns) {
    if (re.test(next)) {
      next = next.replace(re, `{ label: "VESA", value: "${esc}" }`)
      replaced = true
    }
  }
  if (!replaced) {
    next = next.replace(
      /(\{ title: "ディスプレイ", rows: \[\s*\n)/,
      `$1          { label: "VESA", value: "${esc}" },\n`,
    )
  }
  return next
}

function mergeFilterTags(block, newTags) {
  const tagRe = /monitorFilterTags: \[([^\]]*)\]/
  const m = block.match(tagRe)
  if (!m) return block
  const existing = m[1]
    .split(",")
    .map((s) => s.trim().replace(/"/g, ""))
    .filter(Boolean)
    .filter((t) => ![...REFRESH_TAGS, ...RES_TAGS, "size-238", "size-24", "size-27", "size-315-plus"].includes(t))
  const merged = [...new Set([...existing, ...newTags])]
  return block.replace(tagRe, `monitorFilterTags: [${merged.map((t) => `"${t}"`).join(",")}]`)
}

function deriveLocalSpecs(meta) {
  const hay = `${meta.name} ${meta.tagline} ${meta.block}`
  const screenInches = inferScreenInches(hay)
  const resolution = inferResolutionJp(hay)
  const refresh = formatRefresh(inferRefreshRate(hay))
  const vesaExplicit = inferMonitorVesaStandardFromText(hay)
  const vesaKnown = resolveMonitorVesaKnown(meta.asin, hay)
  const vesa = vesaExplicit !== DASH ? vesaExplicit : vesaKnown
  return { screenInches, resolution, refresh, vesa, hay }
}

function applySpecPatch(block, patch) {
  let next = block
  if (patch.screenInches && !isFilled(getField(block, "画面サイズ"))) {
    next = replaceField(next, "画面サイズ", formatScreenSpec(patch.screenInches))
    next = mergeFilterTags(next, inferSizeTags(patch.screenInches))
  }
  if (patch.resolution && !isFilled(getField(block, "解像度"))) {
    next = replaceField(next, "解像度", patch.resolution)
    next = mergeFilterTags(next, inferResolutionTags(patch.resolution))
  }
  if (patch.refresh && !isFilled(getField(block, "リフレッシュレート"))) {
    next = replaceField(next, "リフレッシュレート", patch.refresh)
    const hz = Number(patch.refresh.match(/(\d+)/)?.[1] ?? 0)
    if (hz > 0) next = mergeFilterTags(next, inferRefreshTags(hz))
  }
  if (patch.vesa && !isFilled(block.match(/vesaStandard: "([^"]*)"/)?.[1] ?? DASH)) {
    next = setVesa(next, patch.vesa)
  }
  return next
}

function runFullAudit() {
  const runner = join(__dirname, "audit-monitor-card-specs.ts")
  spawnSync("npx", ["--yes", "tsx", runner], { cwd: ROOT, encoding: "utf8", shell: true })
  return JSON.parse(readFileSync(join(__dirname, "_monitor-card-audit-live.json"), "utf8"))
}

function findBlockLocation(id) {
  for (const file of MONITOR_FILES) {
    const source = readFileSync(file, "utf8")
    const re = new RegExp(`\\{\\s*\\n\\s*id: "${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?\\n  \\},`)
    const m = source.match(re)
    if (m) return { file, source, block: m[0] }
  }
  return null
}

function removeBlock(source, block) {
  return source.replace(block + "\n", "").replace(block, "")
}

const bodyCache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {}
let cardFetchCache = existsSync(CARD_CACHE_PATH)
  ? JSON.parse(readFileSync(CARD_CACHE_PATH, "utf8"))
  : {}

const initialAudit = runFullAudit().source
console.log(`Initial source monitors with 2+ missing card specs: ${initialAudit.badCount}`)

const targetIds = new Set(initialAudit.bad.map((b) => b.id))
const patches = []
const fetchQueue = []

for (const file of MONITOR_FILES) {
  let source = readFileSync(file, "utf8")
  let changed = false
  for (const meta of parseBlocks(source)) {
    if (!targetIds.has(meta.id)) continue
    meta.file = file

    let block = meta.block
    const local = deriveLocalSpecs(meta)
    let patch = {
      screenInches: !isFilled(getField(block, "画面サイズ")) ? local.screenInches : null,
      resolution: !isFilled(getField(block, "解像度")) ? local.resolution : null,
      refresh: !isFilled(getField(block, "リフレッシュレート")) ? local.refresh : null,
      vesa: !isFilled(block.match(/vesaStandard: "([^"]*)"/)?.[1] ?? DASH) ? local.vesa : null,
    }

    if (meta.asin && bodyCache[meta.asin]?.vesaStandard && bodyCache[meta.asin].vesaStandard !== DASH && !patch.vesa) {
      patch.vesa = bodyCache[meta.asin].vesaStandard
    }

    const next = applySpecPatch(block, patch)
    if (next !== block) {
      source = source.replace(block, next)
      block = next
      changed = true
      patches.push({ id: meta.id, stage: "local", patch })
    }

    if (countMissing(block) >= 2 && meta.asin) fetchQueue.push({ id: meta.id, asin: meta.asin, file })
  }
  if (changed && !DRY) writeFileSync(file, source)
}

if (!NO_FETCH && fetchQueue.length > 0) {
  console.log(`Fetching Amazon for ${fetchQueue.length} ASINs via Playwright...`)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    locale: "ja-JP",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  })

  for (const item of fetchQueue) {
    if (cardFetchCache[item.asin]?.html) continue
    process.stdout.write(`fetch ${item.asin} (${item.id})... `)
    await page.waitForTimeout(1200)
    try {
      const res = await page.goto(`https://www.amazon.co.jp/dp/${item.asin}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      })
      if (!res?.ok()) {
        console.log("FAILED http")
        continue
      }
      const html = await page.content()
      if (!html.includes("productTitle")) {
        console.log("FAILED blocked")
        continue
      }
      cardFetchCache[item.asin] = { html: html.slice(0, 500000), fetchedAt: new Date().toISOString() }
      const body = parseAmazonMonitorBodySpecs(html)
      bodyCache[item.asin] = { ...(bodyCache[item.asin] ?? {}), asin: item.asin, ...body, fetchedAt: new Date().toISOString(), source: "playwright-card" }
      console.log("ok")
    } catch (e) {
      console.log(`FAILED ${e.message?.slice(0, 40)}`)
    }
    if (!DRY) {
      writeFileSync(CARD_CACHE_PATH, JSON.stringify(cardFetchCache, null, 2) + "\n")
      writeFileSync(CACHE_PATH, JSON.stringify(bodyCache, null, 2) + "\n")
    }
  }
  await browser.close()
}

for (const item of fetchQueue) {
  const loc = findBlockLocation(item.id)
  if (!loc) continue
  const html = cardFetchCache[item.asin]?.html
  if (!html) continue
  const amazon = extractAmazonDisplaySpecs(html)
  const patch = {
    screenInches: !isFilled(getField(loc.block, "画面サイズ")) ? amazon.screenInches : null,
    resolution: !isFilled(getField(loc.block, "解像度")) ? amazon.resolution : null,
    refresh: !isFilled(getField(loc.block, "リフレッシュレート")) ? amazon.refresh : null,
    vesa: !isFilled(loc.block.match(/vesaStandard: "([^"]*)"/)?.[1] ?? DASH) ? amazon.vesa : null,
  }
  const next = applySpecPatch(loc.block, patch)
  if (next === loc.block) continue
  let source = readFileSync(loc.file, "utf8").replace(loc.block, next)
  if (!DRY) writeFileSync(loc.file, source)
  patches.push({ id: item.id, stage: "amazon", patch })
}

const postAudit = runFullAudit().source
console.log(`After backfill, listed monitors with 2+ missing: ${postAudit.badCount}`)

const deleted = []
for (const bad of postAudit.bad) {
  const loc = findBlockLocation(bad.id)
  if (!loc) continue
  const source = removeBlock(readFileSync(loc.file, "utf8"), loc.block)
  if (!DRY) writeFileSync(loc.file, source)
  deleted.push(bad.id)
  console.log(`DELETED ${bad.id} (${bad.missing.join(", ")})`)
}

const finalResult = runFullAudit()
const finalAudit = finalResult.source
console.log(`\n${DRY ? "[dry-run] " : ""}Summary:`)
console.log(`  Patches applied: ${patches.length}`)
console.log(`  Deleted: ${deleted.length}`)
console.log(`  Final source bad count: ${finalAudit.badCount}`)
console.log(`  Final listed bad count: ${finalResult.listed.badCount}`)
