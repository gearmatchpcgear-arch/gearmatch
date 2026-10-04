/**
 * Export camera category gadgets to public/camera_list.csv
 * Usage: npx tsx scripts/export-camera-gadgets-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"
import {
  classifyCameraMic,
  getCameraFieldOfView,
  getCameraResolution,
} from "../lib/camera-filter-tags.ts"
import { getCameraSpreadsheetITags } from "../lib/camera-spreadsheet-tags.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "public", "camera_list.csv")
const MISSING = "-"

const HEADERS = [
  "商品名",
  "商品説明",
  "価格",
  "解像度",
  "フレームレート",
  "画角",
  "内蔵マイク",
  "接続方法",
  "特徴（I列）",
]

function normalizeField(value) {
  if (value === null || value === undefined) return MISSING
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—") return MISSING
  return text
}

function csvCell(value) {
  const text = normalizeField(value)
  if (text === MISSING) return MISSING
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function row(values) {
  return values.map(csvCell).join(",")
}

function readLabeledValue(gadget, label) {
  for (const h of gadget.highlights) {
    if (h.label === label) {
      const value = normalizeField(h.value)
      if (value !== MISSING) return value
    }
  }
  for (const group of gadget.specGroups) {
    for (const specRow of group.rows) {
      if (specRow.label === label) {
        const value = normalizeField(specRow.value)
        if (value !== MISSING) return value
      }
    }
  }
  return null
}

function extractFps(text) {
  if (!text) return null
  const match = String(text).match(/(\d+)\s*fps/i)
  return match ? `${match[1]}fps` : null
}

function stripFpsFromResolution(text) {
  if (!text) return null
  let cleaned = text.trim()
  cleaned = cleaned.replace(/\s*[\/／]\s*\d+\s*fps\b.*/gi, "")
  cleaned = cleaned.replace(/\s*@\s*\d+\s*fps\b/gi, "")
  cleaned = cleaned.replace(/\s*\(\s*\d+\s*fps\s*\)/gi, "")
  cleaned = cleaned.replace(/\s+\d+\s*fps\b/gi, "")
  return cleaned.trim() || null
}

function splitCameraResolutionAndFrameRate(gadget) {
  const rawResolution = getCameraResolution(gadget)
  const frameRateRow = readLabeledValue(gadget, "フレームレート")

  if (rawResolution === UNSPECIFIED_SPEC) {
    return {
      resolution: MISSING,
      frameRate: frameRateRow ?? MISSING,
    }
  }

  let resolution = rawResolution
  let frameRate = frameRateRow

  if (/\s*[\/／]\s*/.test(rawResolution)) {
    const parts = rawResolution.split(/\s*[\/／]\s*/)
    const resolutionPart = parts.find((part) => !/\bfps\b/i.test(part)) ?? parts[0]
    const fpsPart = parts.find((part) => /\bfps\b/i.test(part))
    resolution = stripFpsFromResolution(resolutionPart) ?? resolutionPart.trim()
    if (!frameRate && fpsPart) {
      frameRate = extractFps(fpsPart) ?? fpsPart.trim()
    }
  } else {
    resolution = stripFpsFromResolution(rawResolution) ?? rawResolution
    if (!frameRate) {
      frameRate = extractFps(rawResolution)
    }
  }

  return {
    resolution: normalizeField(resolution),
    frameRate: normalizeField(frameRate),
  }
}

function formatBuiltInMic(gadget) {
  return classifyCameraMic(gadget) === "mic-built-in" ? "あり" : "なし"
}

function getCameraConnection(gadget) {
  const fromField = normalizeField(gadget.connection)
  if (fromField !== MISSING) return fromField

  return (
    readLabeledValue(gadget, "接続端子") ??
    readLabeledValue(gadget, "接続方式") ??
    readLabeledValue(gadget, "接続") ??
    MISSING
  )
}

function formatPrice(gadget) {
  if (gadget.price == null || Number.isNaN(gadget.price)) return MISSING
  return gadget.price
}

function getCameraDescription(gadget) {
  const text = gadget.tagline?.trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—") return MISSING
  return text.replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim()
}

const cameraGadgets = allSourceGadgets.filter((g) => g.category === "camera")
const lines = [row(HEADERS)]

for (const gadget of cameraGadgets) {
  const { resolution, frameRate } = splitCameraResolutionAndFrameRate(gadget)

  lines.push(
    row([
      gadget.name,
      getCameraDescription(gadget),
      formatPrice(gadget),
      resolution,
      frameRate,
      normalizeField(getCameraFieldOfView(gadget)),
      formatBuiltInMic(gadget),
      getCameraConnection(gadget),
      getCameraSpreadsheetITags(gadget).join(" / ") || MISSING,
    ]),
  )
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${cameraGadgets.length} camera rows to ${outPath}`)
