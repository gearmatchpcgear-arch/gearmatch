/**
 * Extract material from Amazon page markdown/text and normalize to app values.
 */
import { inferUpholsteryMaterial, DASH } from "./amazon-gaming-chair-specs.mjs"

export function extractMaterialFromAmazonText(text) {
  const hay = String(text)

  const overview = hay.match(/材質\s+([^\n|]{1,80})/)?.[1]
  if (overview) {
    const m = inferUpholsteryMaterial(overview.split(/\s+/)[0])
    if (m !== DASH) return m
    const m2 = inferUpholsteryMaterial(overview)
    if (m2 !== DASH) return m2
  }

  const table = hay.match(/\|\s*材質\s*\|\s*([^|\n]+)/)?.[1]
  if (table) {
    const m = inferUpholsteryMaterial(table)
    if (m !== DASH) return m
  }

  const jsonMat = hay.match(/"material_type"\s*:\s*\["([^"]+)"\]/)?.[1]
  if (jsonMat) {
    const m = inferUpholsteryMaterial(jsonMat)
    if (m !== DASH) return m
  }

  for (const m of hay.matchAll(/"dimensionValueDisplayText"\s*:\s*"([^"]+)"/g)) {
    const val = m[1]
    if (/レザー|mesh|メッシュ|ファブリック|fabric|ナイロン|ポリエステル|ベロア/i.test(val)) {
      const mat = inferUpholsteryMaterial(val)
      if (mat !== DASH) return mat
    }
  }

  return DASH
}
