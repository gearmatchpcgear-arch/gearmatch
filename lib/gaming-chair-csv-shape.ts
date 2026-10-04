/** G列（形状）から表示用の形状名と背もたれ幅を分離 */

export type ParsedGamingChairShape = {
  shape: string
  backrestWidth: string | null
}

function normalizeWidthDisplay(cm: string): string {
  const n = parseFloat(cm)
  if (Number.isNaN(n)) return `${cm} cm`
  return Number.isInteger(n) ? `${Math.round(n)} cm` : `${n} cm`
}

export function parseGamingChairShapeCell(raw: string): ParsedGamingChairShape {
  const trimmed = raw.trim()
  if (!trimmed || trimmed === "—" || trimmed === "-") {
    return { shape: "—", backrestWidth: null }
  }

  let backrestWidth: string | null = null

  const backrestMatch = trimmed.match(/背もたれ幅\s*([\d.]+)\s*cm/i)
  if (backrestMatch) {
    backrestWidth = normalizeWidthDisplay(backrestMatch[1])
  }

  const widthPatterns = [
    /、?\s*幅\s*([\d.]+)\s*cm/gi,
    /幅\s*([\d.]+)\s*cm/gi,
    /ハイバック幅\s*([\d.]+)\s*cm/gi,
    /座椅子タイプ幅\s*([\d.]+)\s*cm/gi,
  ]

  if (!backrestWidth) {
    for (const pattern of widthPatterns) {
      const m = pattern.exec(trimmed)
      if (m) {
        backrestWidth = normalizeWidthDisplay(m[1])
        break
      }
    }
  }

  let shape = trimmed
  shape = shape.replace(/背もたれ幅\s*[\d.]+\s*cm/gi, "")
  shape = shape.replace(/、?\s*幅\s*[\d.]+\s*cm/gi, "")
  shape = shape.replace(/ハイバック幅\s*[\d.]+\s*cm/gi, "")
  shape = shape.replace(/座椅子タイプ幅\s*[\d.]+\s*cm/gi, "")
  shape = shape.replace(/[（(][^）)]*$/g, "")
  shape = shape.replace(/[、,]\s*$/g, "")
  shape = shape.replace(/\s+/g, " ").trim()

  if (!shape) shape = trimmed.split(/[、,]/)[0]?.trim() || trimmed

  return { shape, backrestWidth }
}
