/**
 * keyboard-tablet-bestsellers-raw.json + spec cache → lib/keyboard-tablet-bestsellers.ts
 */
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { isTabletKeyboardExcluded } from "./keyboard-tablet-accessory.mjs"
import {
  buildTabletKeyboardGadget,
  dedupeTabletEntries,
} from "./amazon-keyboard-tablet-specs.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

const specCachePath = join(__dirname, "keyboard-tablet-specs-cache.json")
const specCache = existsSync(specCachePath)
  ? JSON.parse(readFileSync(specCachePath, "utf8"))
  : {}
const overridesPath = join(__dirname, "keyboard-tablet-spec-overrides.json")
const overrides = existsSync(overridesPath)
  ? JSON.parse(readFileSync(overridesPath, "utf8"))
  : {}
const imageCachePath = join(__dirname, "keyboard-image-cache.json")
const imageCache = existsSync(imageCachePath)
  ? JSON.parse(readFileSync(imageCachePath, "utf8"))
  : {}

function toTs(gadgets) {
  const lines = [
    `import type { Gadget } from "./gadgets"`,
    ``,
    `/** Amazon.co.jp タブレット用キーボード売れ筋（2360299051）。 */`,
    `export const keyboardTabletBestsellers: Gadget[] = [`,
  ]
  for (const g of gadgets) {
    lines.push("  {")
    for (const [k, v] of Object.entries({
      id: g.id,
      category: "keyboard",
      name: g.name,
      brand: g.brand,
      tagline: g.tagline,
      price: g.price,
      rating: g.rating,
      reviews: g.reviews,
      image: g.image,
      connection: g.connection,
      purchaseUrl: g.purchaseUrl,
    })) {
      lines.push(
        typeof v === "string"
          ? `    ${k}: ${JSON.stringify(v)},`
          : `    ${k}: ${v},`,
      )
    }
    if (g.keyboardFilterTags?.length) {
      lines.push(`    keyboardFilterTags: ${JSON.stringify(g.keyboardFilterTags)},`)
    }
    if (g.keyboardUsage) {
      lines.push(`    keyboardUsage: ${JSON.stringify(g.keyboardUsage)},`)
    }
    if (g.keyboardUseTags?.length) {
      lines.push(`    keyboardUseTags: ${JSON.stringify(g.keyboardUseTags)},`)
    }
    if (g.isUsed) lines.push(`    isUsed: true,`)
    lines.push(`    highlights: [`)
    for (const h of g.highlights) {
      lines.push(
        `      { label: ${JSON.stringify(h.label)}, value: ${JSON.stringify(h.value)} },`,
      )
    }
    lines.push(`    ],`)
    lines.push(`    compat: [],`)
    lines.push(`    specGroups: [`)
    for (const sg of g.specGroups) {
      lines.push(`      { title: ${JSON.stringify(sg.title)}, rows: [`)
      for (const r of sg.rows) {
        lines.push(
          `          { label: ${JSON.stringify(r.label)}, value: ${JSON.stringify(r.value)} },`,
        )
      }
      lines.push(`        ]},`)
    }
    lines.push(`    ],`)
    lines.push(`  },`)
  }
  lines.push("]", "")
  return lines.join("\n")
}

const rawPath = join(__dirname, "keyboard-tablet-bestsellers-raw.json")
if (!existsSync(rawPath)) {
  console.error("Run fetch-keyboard-tablet-bestsellers.mjs first")
  process.exit(1)
}

const { keyboards } = JSON.parse(readFileSync(rawPath, "utf8"))
const filtered = keyboards.filter((item) => !isTabletKeyboardExcluded(item.title ?? ""))
const deduped = dedupeTabletEntries(filtered)
const built = deduped
  .map((entry) =>
    buildTabletKeyboardGadget(entry, specCache[entry.asin], overrides, imageCache),
  )
  .filter(Boolean)

writeFileSync(join(ROOT, "lib", "keyboard-tablet-bestsellers.ts"), toTs(built))
console.log(`Wrote ${built.length} tablet keyboards (filtered ${keyboards.length - filtered.length}, deduped ${filtered.length - deduped.length})`)
