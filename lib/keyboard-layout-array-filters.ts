import type { Gadget } from "@/lib/gadgets"
import { getKeyboardLayout } from "@/lib/keyboard-filter-tags"
import { getKeyboardLayoutArray } from "@/lib/keyboard-spreadsheet-tags"

function isKeyboard(gadget: Gadget): gadget is Gadget & { category: "keyboard" } {
  return gadget.category === "keyboard"
}

/** 配列フィールド（配列・レイアウト）を優先し、未設定時のみ名称等へフォールバック */
function keyboardLayoutArrayHaystack(gadget: Gadget): string {
  const chunks: string[] = []
  const array = getKeyboardLayoutArray(gadget)
  if (array !== "—") chunks.push(array)
  const layout = getKeyboardLayout(gadget)
  if (layout !== "—") chunks.push(layout)
  if (chunks.length > 0) {
    return chunks.join(" ").normalize("NFKC")
  }
  return [gadget.name, gadget.tagline].join(" ").normalize("NFKC")
}

function hasJisLayoutSignal(text: string): boolean {
  return /jis|日本語|jis配列|jis日本語配列/i.test(text)
}

function hasUsLayoutSignal(text: string): boolean {
  return /\bus\b|us配列|us英語配列|英語(?:配列|us)|英語us配列/i.test(text)
}

function hasKoreanLayoutSignal(text: string): boolean {
  return /韓国語|ハングル|韓国語配列|korean/i.test(text)
}

export function matchesKeyboardLayoutArrayJis(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const hay = keyboardLayoutArrayHaystack(gadget)
  if (!hay.trim()) return false
  if (hasKoreanLayoutSignal(hay)) return false
  if (hasUsLayoutSignal(hay) && !hasJisLayoutSignal(hay)) return false
  return hasJisLayoutSignal(hay)
}

export function matchesKeyboardLayoutArrayUs(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const hay = keyboardLayoutArrayHaystack(gadget)
  if (!hay.trim()) return false
  if (hasKoreanLayoutSignal(hay)) return false
  if (hasJisLayoutSignal(hay) && !hasUsLayoutSignal(hay)) return false
  return hasUsLayoutSignal(hay)
}

export function matchesKeyboardLayoutArrayKorean(gadget: Gadget): boolean {
  if (!isKeyboard(gadget)) return false
  const hay = keyboardLayoutArrayHaystack(gadget)
  if (!hay.trim()) return false
  return hasKoreanLayoutSignal(hay)
}
