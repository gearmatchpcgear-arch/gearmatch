import type { Gadget } from "./gadgets"

/** キーボード用途別タグ（絞り込み UI 表示ラベルと同一） */
export type KeyboardUseTag = "タブレット用キーボード"

export const KEYBOARD_USE_TAGS: KeyboardUseTag[] = ["タブレット用キーボード"]

export function inferKeyboardUseTags(gadget: Gadget): KeyboardUseTag[] {
  if (gadget.category !== "keyboard") return []
  const explicit = gadget.keyboardUseTags ?? []
  return KEYBOARD_USE_TAGS.filter((t) => explicit.includes(t))
}

export function inferKeyboardUseTagsMerged(gadget: Gadget): KeyboardUseTag[] {
  if (gadget.category !== "keyboard") return []
  const explicit = gadget.keyboardUseTags ?? []
  const inferred = inferKeyboardUseTags(gadget)
  return KEYBOARD_USE_TAGS.filter((t) => explicit.includes(t) || inferred.includes(t))
}

export function hasKeyboardUseTag(gadget: Gadget, tag: KeyboardUseTag): boolean {
  return inferKeyboardUseTagsMerged(gadget).includes(tag)
}

export function isTabletKeyboard(gadget: Gadget): boolean {
  return hasKeyboardUseTag(gadget, "タブレット用キーボード")
}
