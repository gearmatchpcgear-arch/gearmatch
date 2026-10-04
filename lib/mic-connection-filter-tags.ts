import type { Gadget } from "@/lib/gadgets"
import { UNSPECIFIED_SPEC } from "@/lib/gadgets"
import { getMicConnectionDisplay } from "@/lib/mic-connection-display"

export type MicConnectionFilterTag = "conn-usb" | "conn-xlr" | "conn-other"

export const MIC_CONNECTION_FILTER_LABELS: Record<MicConnectionFilterTag, string> = {
  "conn-usb": "USB接続",
  "conn-xlr": "XLR端子",
  "conn-other": "その他",
}

const USB_DISPLAY_TOKENS = new Set(["USB Type-A", "USB Type-C", "Lightning"])
const OTHER_DISPLAY_TOKENS = new Set([
  "3.5mm",
  "6.3mm",
  "Bluetooth",
  "2.4GHz ワイヤレス",
  "AUX",
])

function parseConnectionTokens(display: string): string[] {
  if (!display || display === UNSPECIFIED_SPEC) return []
  return display
    .split(" / ")
    .map((token) => token.trim())
    .filter(Boolean)
}

function getMicConnectionTokens(gadget: Gadget): string[] {
  return parseConnectionTokens(getMicConnectionDisplay(gadget))
}

export function isMicConnectionUnset(gadget: Gadget): boolean {
  if (gadget.category !== "mic") return true
  return getMicConnectionDisplay(gadget) === UNSPECIFIED_SPEC
}

function tokenMatchesUsb(token: string): boolean {
  if (USB_DISPLAY_TOKENS.has(token)) return true
  return /^usb$/i.test(token) || /usb.?type.?[ac]|^type.?[ac]$/i.test(token)
}

function displayMatchesUsb(display: string): boolean {
  return parseConnectionTokens(display).some(tokenMatchesUsb)
}

function tokenMatchesXlr(token: string): boolean {
  return token === "XLR" || /xlr|3ピンxlr|xlr端子/i.test(token)
}

function displayMatchesXlr(display: string, tokens: string[]): boolean {
  if (tokens.some(tokenMatchesXlr)) return true
  return /xlr|3ピンxlr|xlr端子/i.test(display)
}

function tokenMatchesOther(token: string): boolean {
  return OTHER_DISPLAY_TOKENS.has(token)
}

/** マイク「USB接続」フィルター（USB Type-A/C・Lightning 等。未設定は不一致） */
export function matchesMicUsbConnectionFilter(gadget: Gadget): boolean {
  if (gadget.category !== "mic" || isMicConnectionUnset(gadget)) return false

  const display = getMicConnectionDisplay(gadget)
  const tokens = getMicConnectionTokens(gadget)
  if (tokens.some(tokenMatchesUsb)) return true
  return displayMatchesUsb(display)
}

/** マイク「XLR端子」フィルター（XLR・3ピンXLR 等。未設定は不一致） */
export function matchesMicXlrConnectionFilter(gadget: Gadget): boolean {
  if (gadget.category !== "mic" || isMicConnectionUnset(gadget)) return false

  const display = getMicConnectionDisplay(gadget)
  const tokens = getMicConnectionTokens(gadget)
  return displayMatchesXlr(display, tokens)
}

/** マイク「その他」接続フィルター（USB/XLR 以外の主要接続。未設定は不一致） */
export function matchesMicOtherConnectionFilter(gadget: Gadget): boolean {
  if (gadget.category !== "mic" || isMicConnectionUnset(gadget)) return false
  if (matchesMicUsbConnectionFilter(gadget) || matchesMicXlrConnectionFilter(gadget)) {
    return false
  }

  const tokens = getMicConnectionTokens(gadget)
  if (tokens.some(tokenMatchesOther)) return true
  return tokens.length > 0
}
