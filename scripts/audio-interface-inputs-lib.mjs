import { AI_SPECS_KNOWN, DASH } from "./audio-interface-specs-known.mjs"

export { DASH, AI_SPECS_KNOWN }

export function extractAsinFromUrl(url) {
  return url?.match(/\/dp\/([A-Z0-9]{10})/)?.[1] ?? null
}

/** Output-side terminals that must not appear in the inputs field */
const OUTPUT_TERMINAL_RE =
  /(?:^|[,\s/])(?:RCA\s*OUT|LINE\s*OUT|MAIN\s*OUT|MONITOR\s*OUT|SPK\s*OUT|スピーカー出力|アンプ出力|ヘッドホン|PHONES|Headphone|headphone\s*out|出力×|OUT×|\bout\b(?!\s*OTG)|3\.5\s*mm\s*(?:AUX|OUT|ヘッドホン|HEADSET|HEADPHONE|LINE\s*OUT|モニター))/i

/** 3.5mm segments (AUX/ヘッドホン等は出力側として入力欄から除外) */
const INPUT_35MM_SEGMENT_RE = /3\.5\s*mm[^,]*/gi

/** Channel I/O suffixes like (2in/2out) or （4in / 4out） */
const CHANNEL_IO_RE =
  /\s*[\(（]\s*\d+\s*in\s*[/／]\s*\d+\s*out\s*[\)）]|\s*\(\d+in\/\d+out\)|\s*\/\s*RCA\s*OUT[^,]*/gi

/** Slash-separated IN/OUT pairs e.g. "RCA IN×2 / RCA OUT×2" */
const IN_OUT_PAIR_RE = /\s*\/\s*(?:RCA\s*)?OUT[^,]*/gi

export function containsOutputTerminal(text) {
  if (!text || text === DASH) return false
  return OUTPUT_TERMINAL_RE.test(text) || /\d+\s*out/i.test(text) || /OUT×/i.test(text)
}

export function containsChannelIoNotation(text) {
  if (!text || text === DASH) return false
  return CHANNEL_IO_RE.test(text) || /\(\d+in\/\d+out\)/i.test(text)
}

export function strip35mmFromInputs(text) {
  if (!text || text === DASH) return text
  // 3.5mm TRRS/TRS、または 3.5mm×N の入力端子表記は保持
  if (/3\.5\s*mm\s*trrs|trrs/i.test(text)) return text
  if (/3\.5\s*mm[^,]*×\s*\d+/i.test(text)) return text

  let result = text
    .replace(/,\s*3\.5\s*mm[^,]*/gi, "")
    .replace(/^3\.5\s*mm[^,]*,\s*/gi, "")
    .replace(/\s*\/\s*3\.5\s*mm[^,]*/gi, "")
    .replace(/^3\.5\s*mm[^,]*$/gi, "")
    .trim()
  result = result.replace(/,\s*,/g, ",").replace(/^,\s*/, "").replace(/,\s*$/, "").trim()
  return result || DASH
}

export function stripOutputFromInputs(text) {
  if (!text || text === DASH) return text
  let result = text
    .replace(IN_OUT_PAIR_RE, "")
    .replace(CHANNEL_IO_RE, "")
    .replace(/\s*,\s*ヘッドホン[^,]*/gi, "")
    .replace(/\s*,\s*[^,]*出力[^,]*/gi, "")
    .replace(/\s*,\s*[^,]*OUT[^,]*/gi, "")
    .trim()
  result = result.replace(/,\s*,/g, ",").replace(/,\s*$/, "").trim()
  return strip35mmFromInputs(result)
}

/** 入力端子表記の正規化（出力端子・3.5mm・チャンネル表記を除去） */
export function normalizeAudioInterfaceInputs(text) {
  return stripOutputFromInputs(text)
}

export function contains35mmInput(text) {
  if (!text || text === DASH) return false
  INPUT_35MM_SEGMENT_RE.lastIndex = 0
  return INPUT_35MM_SEGMENT_RE.test(text)
}

export function shortCardInputs(value) {
  if (!value || value === DASH) return DASH
  return value.length > 28 ? `${value.slice(0, 25)}…` : value
}

/** @returns {string | null} canonical inputs from known specs */
export function resolveKnownInputs(asin) {
  const known = asin ? AI_SPECS_KNOWN[asin] : null
  const value = known?.inputs
  if (!value || value === DASH) return null
  return value
}

export function getInputsFromBlock(block) {
  const needle = 'inputs: "'
  const start = block.indexOf(needle)
  if (start < 0) return DASH

  let i = start + needle.length
  let escaped = false
  let value = ""
  while (i < block.length) {
    const ch = block[i]
    if (escaped) {
      value += ch
      escaped = false
      i++
      continue
    }
    if (ch === "\\") {
      escaped = true
      i++
      continue
    }
    if (ch === '"') break
    value += ch
    i++
  }
  return value || DASH
}

export function getHighlightInputs(block) {
  return block.match(/\{ label: "入力端子と数", value: "([^"]*)" \}/)?.[1] ?? DASH
}

export function getSpecInputs(block) {
  return block.match(/label: "入力端子", value: "([^"]*)"/)?.[1] ?? DASH
}

export function classifyInputIssue(block) {
  const asin = extractAsinFromUrl(block.match(/purchaseUrl: "([^"]+)"/)?.[1] ?? "")
  const field = getInputsFromBlock(block)
  const highlight = getHighlightInputs(block)
  const spec = getSpecInputs(block)
  const known = resolveKnownInputs(asin)

  const issues = []

  if (containsOutputTerminal(field)) issues.push("field_has_output")
  if (containsOutputTerminal(highlight)) issues.push("highlight_has_output")
  if (containsOutputTerminal(spec)) issues.push("spec_has_output")
  if (containsChannelIoNotation(field)) issues.push("field_has_channel_io")
  if (containsChannelIoNotation(highlight)) issues.push("highlight_has_channel_io")
  if (containsChannelIoNotation(spec)) issues.push("spec_has_channel_io")

  if (field === DASH) issues.push("field_missing")
  if (known && field !== known) issues.push("field_mismatch_known")
  if (known && highlight !== shortCardInputs(known) && highlight !== known) {
    issues.push("highlight_mismatch_known")
  }
  if (known && spec !== known) issues.push("spec_mismatch_known")

  return { asin, field, highlight, spec, known, issues }
}
