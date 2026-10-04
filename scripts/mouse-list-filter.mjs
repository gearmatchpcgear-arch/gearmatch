/**
 * 一覧カード4項目の充足判定（merge / データ生成用）
 */
import { formatPowerDisplay } from "./amazon-mouse-specs.mjs"

const DASH = "—"

export function isMouseCardSpecFilled(value) {
  return Boolean(value?.trim?.() && value !== DASH)
}

function getMouseReadingMethod(gadget) {
  const fromHighlight = gadget.highlights.find((h) => h.label === "読み取り方式")?.value
  if (fromHighlight && fromHighlight !== DASH) return fromHighlight

  const sensorGroup = gadget.specGroups.find((g) => /センサー|入力/i.test(g.title))
  const row =
    sensorGroup?.rows.find((r) => r.label === "読み取り方式") ??
    sensorGroup?.rows.find((r) => r.label === "センサー")
  if (!row?.value || row.value === DASH) return null
  if (/darkfield/i.test(row.value)) return "Darkfield"
  if (/光学/i.test(row.value)) return "光学式"
  return row.value
}

function getMouseCardPowerDisplay(gadget) {
  const powerGroup = gadget.specGroups.find((g) => /接続|電源/i.test(g.title))
  const powerRow = powerGroup?.rows.find((r) => r.label === "電源")
  const raw = powerRow?.value?.trim()
  if (!raw || raw === DASH) {
    if (/有線\s*usb|usb\s*有線|有線給電/i.test(gadget.connection)) return "有線給電"
    return DASH
  }
  const formatted = formatPowerDisplay(raw, `${gadget.name ?? ""} ${gadget.tagline ?? ""}`)
  if (!formatted || formatted === DASH) return DASH
  if (/^充電式/.test(formatted)) return "充電式"
  if (/^単[1234]形 乾電池/.test(formatted)) {
    return formatted.replace(" 乾電池（付属）", "乾電池")
  }
  if (/^電池式（/.test(formatted)) return "電池式"
  return formatted
}

function getMouseButtonCountDisplay(gadget) {
  const sensorGroup = gadget.specGroups.find((g) => /センサー|入力/i.test(g.title))
  const row = sensorGroup?.rows.find((r) => r.label === "ボタン数")
  const raw = row?.value?.trim()
  if (!raw || raw === DASH) return DASH
  const count = raw.match(/^(\d+)/)?.[1]
  if (count) return `${count}ボタン`
  if (/ボタン/.test(raw)) return raw
  return DASH
}

export function countMouseCardSpecsFilled(gadget) {
  if (gadget.category !== "mouse") return 4
  return [
    gadget.highlights.find((h) => h.label === "重量")?.value,
    getMouseCardPowerDisplay(gadget),
    getMouseReadingMethod(gadget),
    getMouseButtonCountDisplay(gadget),
  ].filter(isMouseCardSpecFilled).length
}

export function passesMouseListFilter(gadget) {
  if (gadget.category !== "mouse") return true
  return countMouseCardSpecsFilled(gadget) >= 2
}
