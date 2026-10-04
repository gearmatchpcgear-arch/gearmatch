import type { Gadget } from "@/lib/gadgets"
import { isFilterSpecFilled } from "@/lib/filter-match-utils"

/** モニターアーム絞り込み用タグ（フィルターIDと1:1対応） */
export type MonitorArmFilterTag =
  | "size-up-to-27"
  | "size-28-35"
  | "size-36-plus"
  | "load-up-to-9"
  | "load-10-14"
  | "load-15-plus"
  | "vesa-50"
  | "vesa-75"
  | "vesa-100"
  | "vesa-200"
  | "mount-clamp"
  | "mount-grommet"
  | "mount-both"
  | "mount-standalone"
  | "mount-pole"
  | "mount-wall"

export const MONITOR_ARM_MOUNT_FILTER_TAGS = [
  "mount-both",
  "mount-clamp",
  "mount-grommet",
  "mount-standalone",
  "mount-pole",
  "mount-wall",
] as const satisfies readonly MonitorArmFilterTag[]

export type MonitorArmMountFilterTag = (typeof MONITOR_ARM_MOUNT_FILTER_TAGS)[number]

export const MONITOR_ARM_FILTER_TAG_LABELS: Record<MonitorArmFilterTag, string> = {
  "size-up-to-27": "〜27インチ対応",
  "size-28-35": "28〜35インチ対応",
  "size-36-plus": "36インチ以上対応",
  "load-up-to-9": "9kg以下",
  "load-10-14": "10〜14kg",
  "load-15-plus": "15kg以上",
  "vesa-50": "50×50mm",
  "vesa-75": "75×75",
  "vesa-100": "100×100",
  "vesa-200": "200×200mm",
  "mount-clamp": "クランプ式",
  "mount-grommet": "グロメット式",
  "mount-both": "クランプ & グロメット両対応",
  "mount-standalone": "自立型（スタンド）",
  "mount-pole": "ポールマウント（支柱取付）",
  "mount-wall": "壁掛け",
}

function armHaystack(gadget: Gadget) {
  return [
    gadget.name,
    gadget.tagline,
    gadget.connection,
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
    .join(" ")
    .toLowerCase()
}

function parseInchRange(gadget: Gadget): { min: number; max: number } | null {
  const hay = armHaystack(gadget)
  const rangeMatch = hay.match(
    /(\d+(?:\.\d+)?)\s*[–\-〜~]\s*(\d+(?:\.\d+)?)\s*(?:インチ|inch|")/i,
  )
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) }
  }

  const upToMatch = hay.match(/(?:〜|~|up to|最大)?\s*(\d+(?:\.\d+)?)\s*(?:インチ|inch|")/i)
  if (upToMatch) {
    const max = Number(upToMatch[1])
    return { min: 0, max }
  }

  const sizeHighlight = gadget.highlights.find((h) => /対応サイズ|画面サイズ/i.test(h.label))
  if (sizeHighlight) {
    const m = sizeHighlight.value.match(
      /(\d+(?:\.\d+)?)\s*[–\-〜~]\s*(\d+(?:\.\d+)?)/,
    )
    if (m) return { min: Number(m[1]), max: Number(m[2]) }
  }

  return null
}

const MONITOR_ARM_LOAD_FILTER_TAGS = [
  "load-up-to-9",
  "load-10-14",
  "load-15-plus",
] as const satisfies readonly MonitorArmFilterTag[]

const MONITOR_ARM_VESA_FILTER_TAGS = [
  "vesa-50",
  "vesa-75",
  "vesa-100",
  "vesa-200",
] as const satisfies readonly MonitorArmFilterTag[]

type MonitorArmVesaFilterTag = (typeof MONITOR_ARM_VESA_FILTER_TAGS)[number]

function isMonitorArmVesaFilterTag(tag: MonitorArmFilterTag): tag is MonitorArmVesaFilterTag {
  return (MONITOR_ARM_VESA_FILTER_TAGS as readonly string[]).includes(tag)
}

type MonitorArmLoadFilterTag = (typeof MONITOR_ARM_LOAD_FILTER_TAGS)[number]

function isMonitorArmLoadFilterTag(tag: MonitorArmFilterTag): tag is MonitorArmLoadFilterTag {
  return (MONITOR_ARM_LOAD_FILTER_TAGS as readonly string[]).includes(tag)
}

/** 耐荷重フィルター用の非重複レンジ判定（最大荷重 kg で判定） */
export function matchesMonitorArmLoadFilterWeight(
  maxLoadKg: number,
  tag: MonitorArmLoadFilterTag,
): boolean {
  switch (tag) {
    case "load-up-to-9":
      return maxLoadKg <= 9.9
    case "load-10-14":
      return maxLoadKg >= 10.0 && maxLoadKg <= 14.9
    case "load-15-plus":
      return maxLoadKg >= 15.0
  }
}

function inferLoadTags(maxLoad: number): MonitorArmLoadFilterTag[] {
  return MONITOR_ARM_LOAD_FILTER_TAGS.filter((tag) =>
    matchesMonitorArmLoadFilterWeight(maxLoad, tag),
  )
}

function parseMaxLoadKg(gadget: Gadget): number | null {
  const hay = armHaystack(gadget)
  const rangeMatch = hay.match(/(\d+(?:\.\d+)?)\s*[–\-〜~]\s*(\d+(?:\.\d+)?)\s*kg/i)
  if (rangeMatch) return Number(rangeMatch[2])

  const loadHighlight = gadget.highlights.find((h) => /耐荷重|荷重/i.test(h.label))
  if (loadHighlight) {
    const values = [...loadHighlight.value.matchAll(/(\d+(?:\.\d+)?)\s*kg/gi)].map((m) =>
      Number(m[1]),
    )
    if (values.length > 0) return Math.max(...values)
  }

  const values = [...hay.matchAll(/(\d+(?:\.\d+)?)\s*kg/gi)].map((m) => Number(m[1]))
  return values.length > 0 ? Math.max(...values) : null
}

/** カード・フィルター照合用の取付方式テキスト（取付方式 → specGroups → connection の順） */
export function getMonitorArmMountText(gadget: Gadget): string {
  if (gadget.category !== "monitor-arm") return "—"

  const fromHighlight = gadget.highlights.find((h) => h.label === "取付方式")?.value
  if (fromHighlight && fromHighlight !== "—" && fromHighlight !== "-") return fromHighlight

  const mountRow = gadget.specGroups
    .flatMap((g) => g.rows)
    .find((r) => /取付方式/i.test(r.label))
  if (mountRow?.value && mountRow.value !== "—" && mountRow.value !== "-") return mountRow.value

  if (gadget.connection && gadget.connection !== "—" && gadget.connection !== "-") {
    return gadget.connection
  }

  return "—"
}

function isMonitorArmMountFilterTag(tag: MonitorArmFilterTag): tag is MonitorArmMountFilterTag {
  return (MONITOR_ARM_MOUNT_FILTER_TAGS as readonly string[]).includes(tag)
}

/** G列（取付方式）の表記から「クランプ & グロメット両対応」か */
export function matchesMonitorArmMountBoth(text: string): boolean {
  if (/両対応/.test(text)) return true
  if (
    /クランプ\s*[&＆/／・]\s*グロメット|グロメット\s*[&＆/／・]\s*クランプ/i.test(text)
  ) {
    return true
  }
  return /クランプ/i.test(text) && /グロメット/i.test(text)
}

/** G列（取付方式）の表記から壁掛けか（壁寄せは除外） */
export function matchesMonitorArmWallMount(text: string): boolean {
  if (/壁寄せ|壁際寄せ|壁際/i.test(text) && !/壁掛|壁面取付|壁取付|ウォール/i.test(text)) {
    return false
  }
  return /壁掛け|壁掛|壁面取付|壁面|壁取付|ウォールマウント|wall\s*mount|wallmount/i.test(text)
}

/** G列（取付方式）の表記から自立型・置き型か */
export function matchesMonitorArmFreestandingMount(text: string): boolean {
  return /据え置き|スタンド設置|自立型|freestanding|desk\s*stand|置き型|ベース置/i.test(text)
}

/** G列（取付方式）の表記からポールマウント・支柱取付か */
export function matchesMonitorArmPoleMount(text: string): boolean {
  return /ポールマウント|ポール取付|ポール取り付け|ポール方式|支柱取付|支柱取付け|支柱式|パイプ取付|pole\s*mount|pole\s*clamp|柱取付/i.test(
    text,
  )
}

/** G列（取付方式）の表記からクランプ式のみか */
export function matchesMonitorArmClampOnly(text: string): boolean {
  if (matchesMonitorArmMountBoth(text)) return false
  if (
    matchesMonitorArmWallMount(text) ||
    matchesMonitorArmFreestandingMount(text) ||
    matchesMonitorArmPoleMount(text)
  ) {
    return false
  }
  return /クランプ|clamp|クランプ固定|クランプ式/i.test(text)
}

/** G列（取付方式）の表記からグロメット式のみか */
export function matchesMonitorArmGrommetOnly(text: string): boolean {
  if (matchesMonitorArmMountBoth(text)) return false
  if (
    matchesMonitorArmWallMount(text) ||
    matchesMonitorArmFreestandingMount(text) ||
    matchesMonitorArmPoleMount(text)
  ) {
    return false
  }
  return /グロメット|grommet|グロメット取付|配線穴|天板穴/i.test(text)
}

export function matchesMonitorArmMountFilterTag(
  mountText: string,
  tag: MonitorArmMountFilterTag,
): boolean {
  const text = mountText.trim()
  if (!text || text === "—" || text === "-") return false

  switch (tag) {
    case "mount-both":
      return matchesMonitorArmMountBoth(text)
    case "mount-clamp":
      return matchesMonitorArmClampOnly(text) || matchesMonitorArmMountBoth(text)
    case "mount-grommet":
      return matchesMonitorArmGrommetOnly(text) || matchesMonitorArmMountBoth(text)
    case "mount-standalone":
      return matchesMonitorArmFreestandingMount(text)
    case "mount-pole":
      return matchesMonitorArmPoleMount(text)
    case "mount-wall":
      return matchesMonitorArmWallMount(text)
  }
}

function inferMountTags(mountText: string): MonitorArmFilterTag[] {
  const text = mountText.trim()
  if (!text || text === "—" || text === "-") return []

  const tags = new Set<MonitorArmFilterTag>()

  for (const tag of MONITOR_ARM_MOUNT_FILTER_TAGS) {
    if (matchesMonitorArmMountFilterTag(text, tag)) {
      tags.add(tag)
    }
  }

  return [...tags]
}

function getMonitorArmVesaStructuredTexts(gadget: Gadget): string[] {
  const texts: string[] = []

  const vesaHighlight = gadget.highlights.find((h) => h.label === "VESA")?.value
  if (isFilterSpecFilled(vesaHighlight)) texts.push(vesaHighlight!.trim())

  for (const group of gadget.specGroups) {
    for (const row of group.rows) {
      if (/^vesa$/i.test(row.label) && isFilterSpecFilled(row.value)) {
        texts.push(row.value.trim())
      }
    }
  }

  return texts
}

function inferVesaTagsFromStructuredTexts(texts: string[]): MonitorArmVesaFilterTag[] {
  if (texts.length === 0) return []

  const combined = texts.join(" ").toLowerCase()
  const tags: MonitorArmVesaFilterTag[] = []

  if (/50\s*[x×]\s*50/.test(combined)) tags.push("vesa-50")
  if (/75\s*[x×]\s*75|75\s*\/\s*100|75\/100|vesa\s*75/.test(combined)) tags.push("vesa-75")
  if (/100\s*[x×]\s*100|vesa\s*100|75\s*\/\s*100|75\/100/.test(combined)) {
    tags.push("vesa-100")
  }
  if (/200\s*[x×]\s*200|vesa\s*200/.test(combined)) tags.push("vesa-200")

  return [...new Set(tags)]
}

function inferMonitorArmFilterTags(gadget: Gadget): MonitorArmFilterTag[] {
  if (gadget.category !== "monitor-arm") return []

  const tags = new Set<MonitorArmFilterTag>()
  const inchRange = parseInchRange(gadget)
  const maxLoad = parseMaxLoadKg(gadget)

  if (inchRange) {
    if (inchRange.max <= 27) tags.add("size-up-to-27")
    if (inchRange.max >= 28 && inchRange.min <= 35) tags.add("size-28-35")
    if (inchRange.max >= 36) tags.add("size-36-plus")
  }

  if (maxLoad !== null) {
    for (const tag of inferLoadTags(maxLoad)) {
      tags.add(tag)
    }
  }

  for (const tag of inferVesaTagsFromStructuredTexts(getMonitorArmVesaStructuredTexts(gadget))) {
    tags.add(tag)
  }

  for (const tag of inferMountTags(getMonitorArmMountText(gadget))) {
    tags.add(tag)
  }

  return [...tags]
}

export function getMonitorArmFilterTags(gadget: Gadget): MonitorArmFilterTag[] {
  if (gadget.category !== "monitor-arm") return []
  const inferred = inferMonitorArmFilterTags(gadget)
  const explicit = (gadget.monitorArmFilterTags ?? []).filter((t) => {
    const id = String(t)
    return !id.startsWith("vesa-")
  })
  return [...new Set([...explicit, ...inferred])]
}

export function hasMonitorArmFilterTag(gadget: Gadget, tag: MonitorArmFilterTag): boolean {
  if (isMonitorArmLoadFilterTag(tag)) {
    const maxLoad = parseMaxLoadKg(gadget)
    if (maxLoad === null) return false
    return matchesMonitorArmLoadFilterWeight(maxLoad, tag)
  }

  if (isMonitorArmVesaFilterTag(tag)) {
    return inferVesaTagsFromStructuredTexts(getMonitorArmVesaStructuredTexts(gadget)).includes(tag)
  }

  if (isMonitorArmMountFilterTag(tag)) {
    return matchesMonitorArmMountFilterTag(getMonitorArmMountText(gadget), tag)
  }

  return getMonitorArmFilterTags(gadget).includes(tag)
}
