/**
 * Export audio-interface category gadgets to audio_interfaces.csv (project root).
 * Usage: npx tsx scripts/export-audio-interfaces-csv.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { allSourceGadgets, UNSPECIFIED_SPEC } from "../lib/gadgets.ts"
import { getAudioInterfaceDetailSpec } from "../lib/audio-interface-filter-tags.ts"
import { formatAudioInterfacePcConnectionDisplay } from "../lib/audio-interface-pc-connection.ts"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const outPath = path.join(root, "audio_interfaces.csv")

const HEADERS = [
  "ID",
  "カード名",
  "商品説明",
  "価格",
  "入力端子",
  "PC接続",
  "ファンタム電源",
  "システム要件",
  "サンプリングレート",
]

function normalizeField(value) {
  if (value === null || value === undefined) return ""
  const text = String(value).trim()
  if (!text || text === UNSPECIFIED_SPEC || text === "—") return ""
  return text
}

function csvCell(value) {
  const text = normalizeField(value)
  if (!text) return ""
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function row(values) {
  return values.map(csvCell).join(",")
}

function pcConnection(gadget) {
  const fromSpec = gadget.specGroups
    .flatMap((group) => group.rows)
    .find((specRow) => specRow.label === "PC接続")?.value
  const raw = fromSpec ?? gadget.connectionType ?? gadget.connection
  return formatAudioInterfacePcConnectionDisplay(gadget, raw)
}

const audioInterfaces = allSourceGadgets
  .filter((gadget) => gadget.category === "audio-interface")
  .sort((a, b) => a.id.localeCompare(b.id))

const lines = [HEADERS.join(",")]

for (const gadget of audioInterfaces) {
  lines.push(
    row([
      gadget.id,
      gadget.name,
      gadget.tagline,
      gadget.price != null ? gadget.price : "",
      getAudioInterfaceDetailSpec(gadget, "入力端子と数"),
      pcConnection(gadget),
      getAudioInterfaceDetailSpec(gadget, "ファンタム電源"),
      getAudioInterfaceDetailSpec(gadget, "システム要件"),
      getAudioInterfaceDetailSpec(gadget, "サンプリングレート"),
    ]),
  )
}

fs.writeFileSync(outPath, `\uFEFF${lines.join("\n")}\n`, "utf8")

console.log(`Wrote ${audioInterfaces.length} audio-interface rows to ${outPath}`)
