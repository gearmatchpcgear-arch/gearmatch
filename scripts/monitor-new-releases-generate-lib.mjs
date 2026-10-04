/**
 * Shared helpers for monitor new-releases TS generation.
 */
import { writeFileSync } from "fs"
import { normalizeAmazonImageUrl } from "./amazon-image.mjs"
import { buildMonitorGadget, DASH } from "./amazon-monitor-specs.mjs"
import { inferMonitorVesaStandardFromText } from "./monitor-vesa-standard.mjs"

export { DASH }

export function shortRes(resolution) {
  if (/4K|3840/.test(resolution)) return resolution.includes("4K+") ? "4K+" : "4K UHD"
  if (/UWQHD|3440/.test(resolution)) return "UWQHD"
  if (/QHD|2560 x 1440|WQHD/.test(resolution)) return "QHD"
  if (/WQXGA|2\.5K|2560 x 1600/.test(resolution)) return "WQXGA"
  if (/WUXGA|1920 x 1200/.test(resolution)) return "WUXGA"
  if (/FHD|1920 x 1080/.test(resolution)) return "FHD"
  return resolution.includes("(") ? resolution.match(/\(([^)]+)\)/)?.[1] ?? resolution : resolution
}

export function sizeDisplay(screenSize) {
  const m = String(screenSize).match(/([\d.]+)/)
  return m ? `${m[1]}"` : DASH
}

export function portRows(connection) {
  if (connection === DASH) return [{ label: "接続端子", value: DASH }]
  return connection.split(" / ").map((p) => ({
    label: p.trim(),
    value: /pd|給電|65w|90w|60w|70w|thunderbolt/i.test(p) ? "映像/給電対応" : "対応",
  }))
}

export function gadgetToTs(gadget, rank, rankFieldLabel = "Amazon新着") {
  const disp = gadget.specGroups.find((g) => g.title === "ディスプレイ")
  const screenSize = disp?.rows.find((r) => r.label === "画面サイズ")?.value ?? DASH
  const resolution = disp?.rows.find((r) => r.label === "解像度")?.value ?? DASH
  const panel = disp?.rows.find((r) => r.label === "パネル")?.value ?? DASH
  const refreshRate = disp?.rows.find((r) => r.label === "リフレッシュレート")?.value ?? DASH
  const panelShort = panel.split("/")[0].trim()

  const lines = [
    "  {",
    `    id: ${JSON.stringify(gadget.id)},`,
    `    category: "monitor",`,
    `    name: ${JSON.stringify(gadget.name)},`,
    `    brand: ${JSON.stringify(gadget.brand)},`,
    `    tagline: ${JSON.stringify(gadget.tagline)},`,
    `    price: ${gadget.price ?? "null"},`,
    `    rating: ${gadget.rating},`,
    `    reviews: ${gadget.reviews},`,
    `    image: ${JSON.stringify(gadget.image)},`,
    `    connection: ${JSON.stringify(gadget.connection)},`,
    `    purchaseUrl: ${JSON.stringify(gadget.purchaseUrl)},`,
  ]
  if (gadget.monitorFilterTags?.length) {
    lines.push(`    monitorFilterTags: ${JSON.stringify(gadget.monitorFilterTags)},`)
  }
  const vesaStandard =
    gadget.vesaStandard ??
    inferMonitorVesaStandardFromText(
      `${gadget.name} ${gadget.tagline} ${gadget.connection} ${JSON.stringify(gadget.specGroups)}`,
    )
  lines.push(`    vesaStandard: ${JSON.stringify(vesaStandard)},`)
  lines.push(`    highlights: [`)
  lines.push(`      { label: "画面サイズ", value: ${JSON.stringify(sizeDisplay(screenSize))} },`)
  lines.push(`      { label: "解像度", value: ${JSON.stringify(shortRes(resolution))} },`)
  lines.push(`      { label: "リフレッシュ", value: ${JSON.stringify(refreshRate)} },`)
  lines.push(`      { label: "パネル", value: ${JSON.stringify(panelShort === DASH ? DASH : panelShort)} },`)
  lines.push(`    ],`)
  lines.push(`    compat: [],`)
  lines.push(`    specGroups: [`)
  lines.push(`      { title: "ディスプレイ", rows: [`)
  lines.push(`          { label: "画面サイズ", value: ${JSON.stringify(screenSize)} },`)
  lines.push(`          { label: "解像度", value: ${JSON.stringify(resolution)} },`)
  lines.push(`          { label: "パネル", value: ${JSON.stringify(panel)} },`)
  lines.push(`          { label: "リフレッシュレート", value: ${JSON.stringify(refreshRate)} },`)
  lines.push(`          { label: ${JSON.stringify(rankFieldLabel)}, value: "PCモニター #${rank}" },`)
  lines.push(`        ]},`)
  lines.push(`      { title: "接続端子", rows: [`)
  for (const row of portRows(gadget.connection)) {
    lines.push(
      `          { label: ${JSON.stringify(row.label)}, value: ${JSON.stringify(row.value)} },`,
    )
  }
  lines.push(`        ]},`)
  const other = gadget.specGroups.find((g) => g.title === "その他")
  if (other) {
    lines.push(`      { title: "その他", rows: [`)
    for (const row of other.rows) {
      lines.push(
        `          { label: ${JSON.stringify(row.label)}, value: ${JSON.stringify(row.value)} },`,
      )
    }
    lines.push(`        ]},`)
  }
  lines.push(`    ],`)
  lines.push(`  },`)
  return lines.join("\n")
}

export function buildGadgetsFromRaw(monitors, userOverrides, idPrefix) {
  const byAsin = new Map()
  for (const item of monitors.sort((a, b) => a.amazonRank - b.amazonRank)) {
    byAsin.set(item.asin, item)
  }
  const unique = [...byAsin.values()]

  return unique.map((item, index) => {
    const override = userOverrides[item.asin] ?? {}
    const base = buildMonitorGadget(
      {
        ...item,
        title: item.title,
        image: normalizeAmazonImageUrl(item.image) || "",
      },
      index,
      override,
    )

    base.id = `${idPrefix}-${String(index + 1).padStart(3, "0")}`
    if (override.tagline) base.tagline = override.tagline
    if (item.price != null) base.price = item.price
    base.image = normalizeAmazonImageUrl(item.image) || ""

    return { gadget: base, rank: item.amazonRank }
  })
}

export function writeMonitorTs(outPath, exportName, comment, gadgets, rankFieldLabel = "Amazon新着") {
  const out = [
    'import type { Gadget } from "./gadgets"',
    "",
    comment,
    `export const ${exportName}: Gadget[] = [`,
    ...gadgets.map(({ gadget, rank }) => gadgetToTs(gadget, rank, rankFieldLabel)),
    "]",
    "",
  ].join("\n")
  writeFileSync(outPath, out)
}
