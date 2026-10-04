import type { Gadget } from "@/lib/gadgets"
import { getKeyboardLayout } from "@/lib/keyboard-filter-tags"

export type KeyboardLayoutFilterId =
  | "kb-layout-under-70"
  | "kb-layout-71-80"
  | "kb-layout-81-99"
  | "kb-layout-full-size"
  | "kb-layout-ipad"
  | "kb-layout-surface"
  | "kb-layout-tablet"
  | "kb-layout-foldable"

export const KEYBOARD_LAYOUT_FILTER_IDS: KeyboardLayoutFilterId[] = [
  "kb-layout-under-70",
  "kb-layout-71-80",
  "kb-layout-81-99",
  "kb-layout-full-size",
  "kb-layout-ipad",
  "kb-layout-surface",
  "kb-layout-tablet",
  "kb-layout-foldable",
]

export const KEYBOARD_LAYOUT_FILTER_LABELS: Record<KeyboardLayoutFilterId, string> = {
  "kb-layout-under-70": "70%以下",
  "kb-layout-71-80": "71%〜80%",
  "kb-layout-81-99": "81%〜99%",
  "kb-layout-full-size": "フルサイズ",
  "kb-layout-ipad": "iPad用",
  "kb-layout-surface": "Surface用",
  "kb-layout-tablet": "タブレット用",
  "kb-layout-foldable": "折りたたみ",
}

function keyboardLayoutContext(gadget: Gadget) {
  const layoutRaw = getKeyboardLayout(gadget)
  const layout = layoutRaw === "—" ? "" : layoutRaw.trim()
  const haystack = [layout, gadget.name, gadget.tagline, ...(gadget.keyboardUseTags ?? [])]
    .join(" ")
    .normalize("NFKC")
  return { layout, haystack }
}

function parsePercent(text: string): number | null {
  const m = text.match(/(\d{2,3})\s*[％%]/)
  return m ? Number(m[1]) : null
}

function parseKeyCount(text: string): number | null {
  const m = text.match(/(\d{2,3})\s*キー/i)
  return m ? Number(m[1]) : null
}

function layoutPercent(gadget: Gadget): number | null {
  const { layout } = keyboardLayoutContext(gadget)
  if (!layout) return null
  return parsePercent(layout)
}

function layoutKeyCount(gadget: Gadget): number | null {
  const { layout } = keyboardLayoutContext(gadget)
  if (!layout) return null
  return parseKeyCount(layout)
}

function isKeyboard(gadget: Gadget): gadget is Gadget & { category: "keyboard" } {
  return gadget.category === "keyboard"
}

export function matchesKeyboardLayoutUnder70(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const { layout, haystack } = keyboardLayoutContext(gadget)

  if (/片手|one.?handed|single.?hand|左手キーボード/i.test(haystack)) return true
  if (/片手キーボード/i.test(layout)) return true

  const pct = layoutPercent(gadget)
  if (pct !== null && pct <= 70) return true

  const keys = layoutKeyCount(gadget)
  if (keys !== null && keys <= 68) return true

  return false
}

export function matchesKeyboardLayout71To80(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false

  const pct = layoutPercent(gadget)
  if (pct !== null && pct >= 71 && pct <= 80) return true

  const keys = layoutKeyCount(gadget)
  if (keys !== null && (keys === 79 || keys === 84 || keys === 87)) return true

  return false
}

export function matchesKeyboardLayout81To99(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  if (matchesKeyboardLayoutFullSize(gadget)) return false

  const pct = layoutPercent(gadget)
  if (pct !== null && pct >= 81 && pct <= 99) return true

  const keys = layoutKeyCount(gadget)
  if (keys !== null && keys >= 81 && keys <= 99) return true

  return false
}

export function matchesKeyboardLayoutFullSize(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const { layout } = keyboardLayoutContext(gadget)
  if (!layout) return false

  if (/フルサイズ|full.?size/i.test(layout)) return true

  const pct = layoutPercent(gadget)
  if (pct !== null && pct >= 100) return true

  const keys = layoutKeyCount(gadget)
  if (keys !== null && keys >= 100) return true

  return false
}

export function matchesKeyboardLayoutIpad(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const { layout } = keyboardLayoutContext(gadget)
  if (!layout) return false
  return /iPad用|\biPad\b/i.test(layout)
}

export function matchesKeyboardLayoutSurface(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const { layout } = keyboardLayoutContext(gadget)
  if (!layout) return false
  return /Surface用|Surface Pro|Surface Go|\bSurface\b/i.test(layout)
}

export function matchesKeyboardLayoutTablet(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const { layout } = keyboardLayoutContext(gadget)
  if (/タブレット用/i.test(layout)) return true
  return (gadget.keyboardUseTags ?? []).includes("タブレット用キーボード")
}

export function matchesKeyboardLayoutFoldable(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const { layout } = keyboardLayoutContext(gadget)
  if (!layout) return false
  return /折りたたみ|折畳|折り畳/i.test(layout)
}

export function matchesKeyboardLayoutFilterId(
  gadget: Gadget,
  id: KeyboardLayoutFilterId,
): boolean {
  switch (id) {
    case "kb-layout-under-70":
      return matchesKeyboardLayoutUnder70(gadget)
    case "kb-layout-71-80":
      return matchesKeyboardLayout71To80(gadget)
    case "kb-layout-81-99":
      return matchesKeyboardLayout81To99(gadget)
    case "kb-layout-full-size":
      return matchesKeyboardLayoutFullSize(gadget)
    case "kb-layout-ipad":
      return matchesKeyboardLayoutIpad(gadget)
    case "kb-layout-surface":
      return matchesKeyboardLayoutSurface(gadget)
    case "kb-layout-tablet":
      return matchesKeyboardLayoutTablet(gadget)
    case "kb-layout-foldable":
      return matchesKeyboardLayoutFoldable(gadget)
    default:
      return false
  }
}
