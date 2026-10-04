import type { CategoryId, CompatTag, Gadget } from "@/lib/gadgets"
import {
  hasKeyboardFilterTag,
  isGamingKeyboard,
  hasRapidTrigger,
  KEYBOARD_FILTER_TAG_LABELS,
  matchesKeyboardUsbTypeCConnectionFilter,
  matchesKeyboardWiredConnectionFilter,
} from "@/lib/keyboard-filter-tags"
import { hasKeyboardUseTag } from "@/lib/keyboard-use-tags"
import { hasMouseFilterTag } from "@/lib/mouse-filter-tags"
import {
  hasMouseSpreadsheetUsageTag,
  isMouseUsageSpecFilterId,
  matchesMouseUsageSpecFilterId,
  MOUSE_USAGE_SPEC_FILTER_LABELS,
  MOUSE_USAGE_SPEC_PRIMARY_TAGS,
  mouseUsageSpecFilterId,
  type MouseUsageSpecFilterId,
} from "@/lib/mouse-spreadsheet-tags"
import {
  hasMonitorFilterTag,
  MONITOR_FILTER_TAG_LABELS,
  MONITOR_RESOLUTION_FILTER_ORDER,
  type MonitorFilterTag,
} from "@/lib/monitor-filter-tags"
import {
  hasMonitorVesaFilterTag,
  MONITOR_VESA_FILTER_TAG_LABELS,
  type MonitorVesaFilterTag,
} from "@/lib/monitor-vesa-standard"
import { hasMonitorArmFilterTag, MONITOR_ARM_FILTER_TAG_LABELS } from "@/lib/monitor-arm-filter-tags"
import {
  MONITOR_ARM_ARM_TYPE_FILTER_LABELS,
  monitorArmArmTypeFilterMatch,
  type MonitorArmArmTypeFilterId,
} from "@/lib/monitor-arm-spreadsheet-tags"
import { hasMicFilterTag, MIC_FILTER_TAG_LABELS, type MicFilterTag } from "@/lib/mic-filter-tags"
import { hasMicFeatureTag, MIC_FEATURE_TAGS } from "@/lib/mic-feature-tags"
import { hasMicUseTag, MIC_USE_TAGS } from "@/lib/mic-use-tags"
import {
  MIC_SPREADSHEET_J_TAG_LABELS,
  MIC_SPREADSHEET_K_TAG_LABELS,
  micSpreadsheetFilterMatch,
} from "@/lib/mic-spreadsheet-tags"
import {
  CAMERA_FOV_LABELS,
  CAMERA_FOCUS_LABELS,
  CAMERA_MIC_LABELS,
  CAMERA_RESOLUTION_LABELS,
  hasCameraFocusTag,
  hasCameraFovTag,
  hasCameraMicTag,
  hasCameraNonUsbConnectionFilter,
  hasCameraResolutionTag,
} from "@/lib/camera-filter-tags"
import {
  CAMERA_SPREADSHEET_I_TAG_LABELS,
  cameraSpreadsheetFilterMatch,
  isCameraSpreadsheetFilterId,
  type CameraSpreadsheetIFilterId,
} from "@/lib/camera-spreadsheet-tags"
import {
  MONITOR_SPREADSHEET_L_TAG_LABELS,
  monitorSpreadsheetFilterMatch,
} from "@/lib/monitor-spreadsheet-tags"
import {
  MIC_DIRECTION_LABELS,
  hasMicDirectionFilterTag,
} from "@/lib/mic-card-filter-tags"
import {
  MIC_CONNECTION_FILTER_LABELS,
  matchesMicOtherConnectionFilter,
  matchesMicUsbConnectionFilter,
  matchesMicXlrConnectionFilter,
} from "@/lib/mic-connection-filter-tags"
import {
  MOUSE_BUTTON_LABELS,
  MOUSE_POWER_LABELS,
  MOUSE_WEIGHT_LABELS,
  hasMouseButtonFilterTag,
  hasMousePowerFilterTag,
  hasMouseWeightFilterTag,
} from "@/lib/mouse-card-filter-tags"
import {
  GAMING_CHAIR_ADJUSTMENT_LABELS,
  GAMING_CHAIR_MATERIAL_LABELS,
  GAMING_CHAIR_OTTOMAN_LABELS,
  GAMING_CHAIR_RECLINE_LABELS,
  GAMING_CHAIR_STYLE_LABELS,
  hasGamingChairFilterTag,
} from "@/lib/gaming-chair-filter-tags"
import {
  GAMING_CHAIR_MAJOR_BRAND_MIN_COUNT,
  buildMajorGamingChairBrandFilters,
  brandKeyFromGamingChairBrandFilterId,
  isGamingChairBrandFilterId,
  matchesGamingChairBrandFilterId,
  type GamingChairBrandFilterId,
} from "@/lib/gaming-chair-brand-filters"
import {
  AI_FILTER_TAG_LABELS,
  hasAudioInterfaceFilterTag,
  isPhantomPowerSupported,
  type AudioInterfaceFilterTag,
} from "@/lib/audio-interface-filter-tags"
import {
  AUDIO_INTERFACE_INPUT_FILTER_MIN_COUNT,
  buildMajorAudioInterfaceInputFilters,
  isAudioInterfaceInputFilterId,
  matchesAudioInterfaceInputFilterId,
  type AudioInterfaceInputFilterId,
} from "@/lib/audio-interface-input-filters"
import {
  buildMajorKeyboardFilterGroups,
  keyboardFilterMeetsMinCount,
  KEYBOARD_MAJOR_FILTER_MIN_COUNT,
} from "@/lib/keyboard-major-filters"
import {
  buildKeyboardFeatureFilters,
  buildKeyboardInternalStructureFilters,
  buildKeyboardPollingRateFilters,
  isKeyboardSpreadsheetFilterId,
  matchesKeyboardSpreadsheetFilterId,
  type KeyboardSpreadsheetFilterId,
} from "@/lib/keyboard-spreadsheet-tags"
import {
  KEYBOARD_LAYOUT_FILTER_LABELS,
  matchesKeyboardLayoutFilterId,
  type KeyboardLayoutFilterId,
} from "@/lib/keyboard-layout-filters"
import {
  matchesKeyboardLayoutArrayJis,
  matchesKeyboardLayoutArrayKorean,
  matchesKeyboardLayoutArrayUs,
} from "@/lib/keyboard-layout-array-filters"

export type FilterId =
  | "bluetooth"
  | "wireless-24ghz"
  | "wired"
  | "usb-c"
  | "usb"
  | "xlr"
  | "silent"
  | "high-dpi"
  | "lightweight"
  | "hot-swap"
  | "backlight"
  | "layout-jis"
  | "layout-us"
  | "layout-korean"
  | KeyboardLayoutFilterId
  | "kb-structure-scissor"
  | "kb-structure-double-gasket"
  | "kb-structure-gasket"
  | "kb-structure-tray"
  | "kb-keycap-spherical"
  | "kb-keycap-pbt-double"
  | "kb-keycap-abs"
  | "kb-keycap-pc"
  | "kb-keycap-low-profile"
  | "cardioid"
  | "condenser"
  | "4k"
  | "fhd-1080"
  | "cam-res-4k"
  | "cam-res-2k"
  | "cam-res-1080p"
  | "cam-res-720-below"
  | "cam-fov-wide"
  | "cam-fov-standard"
  | "cam-fov-narrow"
  | "cam-fov-unknown"
  | "cam-mic-built-in"
  | "cam-focus-auto"
  | "cam-non-usb-connection"
  | "privacy-shutter"
  | "resolution-4k"
  | "resolution-fhd"
  | "refresh-144"
  | "usb-c-pd"
  | "vesa"
  | "arm-size-up-to-27"
  | "arm-size-28-35"
  | "arm-size-36-plus"
  | "arm-load-up-to-9"
  | "arm-load-10-14"
  | "arm-load-15-plus"
  | "arm-mount-clamp"
  | "arm-mount-grommet"
  | "arm-mount-both"
  | "arm-mount-standalone"
  | "arm-mount-pole"
  | "arm-mount-wall"
  | "multi-pairing"
  | "mouse-gaming"
  | "mouse-productivity"
  | "mouse-reading-optical"
  | "mouse-reading-laser"
  | "mouse-reading-trackball"
  | "mouse-reading-blueled"
  | "mouse-reading-ir-other"
  | "mouse-side-buttons"
  | "mouse-side-wheel"
  | MouseUsageSpecFilterId
  | "keyboard-gaming"
  | "keyboard-rapid-trigger"
  | "keyboard-tablet"
  | "monitor-size-238"
  | "monitor-size-24"
  | "monitor-size-27"
  | "monitor-size-315-plus"
  | "monitor-res-fhd"
  | "monitor-res-wqhd"
  | "monitor-res-uwqhd"
  | "monitor-res-4k"
  | "monitor-res-6k"
  | "monitor-res-5k2k"
  | "monitor-res-dqhd"
  | "monitor-refresh-60"
  | "monitor-refresh-75"
  | "monitor-refresh-100"
  | "monitor-refresh-144-plus"
  | "monitor-refresh-240-plus"
  | "monitor-port-hdmi"
  | "monitor-port-dp"
  | "monitor-port-usb-c"
  | "monitor-port-usb-c-pd"
  | "monitor-panel-ips"
  | "monitor-panel-ips-matte"
  | "monitor-panel-fast-ips"
  | "monitor-panel-fast-ips-matte"
  | "monitor-panel-va"
  | "monitor-panel-va-matte"
  | "monitor-panel-tn"
  | "monitor-panel-oled"
  | "monitor-panel-ads"
  | "monitor-panel-miniled"
  | "chair-mat-pu"
  | "chair-mat-mesh"
  | "chair-mat-fabric"
  | "chair-mat-leather"
  | "chair-adj-height"
  | "chair-adj-tilt"
  | "chair-adj-recline"
  | "chair-adj-headrest"
  | "chair-adj-lumbar"
  | "chair-adj-armrest"
  | "chair-recline-180"
  | "chair-recline-150-175"
  | "chair-recline-130-145"
  | "chair-recline-under-129"
  | "chair-ottoman-yes"
  | "chair-ottoman-no"
  | GamingChairBrandFilterId
  | "chair-style-bucket"
  | "chair-style-queen"
  | "chair-style-floor"
  | "chair-style-other"
  | "ai-use-streaming"
  | "ai-use-vocal"
  | "ai-use-instrument"
  | "ai-use-dtm"
  | "ai-feat-direct-monitoring"
  | "ai-feat-loopback"
  | "ai-feat-phantom"
  | "ai-conn-usb-c"
  | "ai-conn-usb-b"
  | "ai-conn-bluetooth"
  | "ai-conn-thunderbolt"
  | "ai-conn-35mm"
  | "ai-sr-48-95"
  | "ai-sr-96-191"
  | "ai-sr-192-plus"
  | "ai-bit-16"
  | "ai-bit-24"
  | "ai-bit-32"
  | "ai-bit-32-float"
  | "ai-sys-win"
  | "ai-sys-mac"
  | "ai-sys-ios"
  | "ai-sys-android"
  | "ai-sys-linux"
  | AudioInterfaceInputFilterId
  | "mouse-power-wired"
  | "mouse-power-rechargeable"
  | "mouse-power-battery"
  | "mouse-buttons-3-under"
  | "mouse-buttons-4-6"
  | "mouse-buttons-6-over"
  | "mouse-weight-under-70"
  | "mouse-weight-70-90"
  | "mouse-weight-over-91"
  | "kb-power-wired"
  | "kb-power-rechargeable"
  | "kb-power-battery"
  | "mic-dir-cardioid"
  | "mic-dir-omni"
  | "mic-dir-switchable"
  | "mic-dir-super"
  | "mic-dir-other"
  | "mic-conn-other"
  | "monitor-vesa-100"
  | "monitor-vesa-75"
  | "monitor-vesa-200-plus"
  | "monitor-vesa-none"
  | "arm-vesa-50"
  | "arm-vesa-75"
  | "arm-vesa-100"
  | "arm-vesa-200"
  | MonitorArmArmTypeFilterId
  | "mic-type-pin"
  | "mic-type-conference"
  | "mic-type-stand"
  | "mic-type-condenser"
  | "mic-type-dynamic"
  | "mic-type-wireless"
  | "mic-type-headset"
  | "mic-use-web-meeting"
  | "mic-use-streaming"
  | "mic-use-dtm"
  | "mic-use-vlog"
  | "mic-feat-mute"
  | "mic-feat-headphone-jack"
  | "mic-feat-gain-knob"
  | "mic-feat-noise-cancel"
  | "mic-feat-asmr"
  | "mic-sheet-j-noise-cancel"
  | "mic-sheet-j-asmr"
  | "mic-sheet-k-mute"
  | "mon-sheet-l-curved"
  | CameraSpreadsheetIFilterId
  | KeyboardSpreadsheetFilterId

export type FilterGroup = {
  id: string
  label: string
  filters: FilterOption[]
  /** 同一グループ内の複数選択: any=OR / all=AND（省略時 any） */
  matchMode?: "any" | "all"
}

export type FilterOption = {
  id: FilterId
  label: string
  match: (gadget: Gadget) => boolean
}

/** 絞り込み UI の状態（filterIds にメーカー chair-brand-* を含む） */
export type FilterState = {
  filterIds: FilterId[]
  /** chair-brand-* から抽出したブランドキー */
  brands: string[]
}

export function filterStateFromFilterIds(filterIds: FilterId[]): FilterState {
  const brands = filterIds
    .filter(isGamingChairBrandFilterId)
    .map(brandKeyFromGamingChairBrandFilterId)
  return { filterIds, brands }
}

export function getBrandFilterIds(brands: string[]): GamingChairBrandFilterId[] {
  return brands.map((key) => `chair-brand-${key}`)
}

export function mergeFilterStateBrands(filterIds: FilterId[], brands: string[]): FilterId[] {
  const withoutBrands = filterIds.filter((id) => !isGamingChairBrandFilterId(id))
  return [...withoutBrands, ...getBrandFilterIds(brands)]
}

function matchFilterId(gadget: Gadget, id: FilterId): boolean {
  if (isGamingChairBrandFilterId(id)) {
    return matchesGamingChairBrandFilterId(gadget, id)
  }
  if (isAudioInterfaceInputFilterId(id)) {
    return matchesAudioInterfaceInputFilterId(gadget, id)
  }
  if (isKeyboardSpreadsheetFilterId(id)) {
    return matchesKeyboardSpreadsheetFilterId(gadget, id)
  }
  if (isMouseUsageSpecFilterId(id)) {
    return matchesMouseUsageSpecFilterId(gadget, id)
  }
  if (isCameraSpreadsheetFilterId(id)) {
    return cameraSpreadsheetFilterMatch(gadget, id)
  }
  return FILTER_REGISTRY[id]?.match(gadget) ?? false
}

function gadgetsForFilterContext(
  category: CategoryId | "all",
  gadgets: Gadget[],
): Gadget[] {
  if (category === "all") return gadgets
  return gadgets.filter((g) => g.category === category)
}

function filterHasMatches(gadgets: Gadget[], filterId: FilterId): boolean {
  for (const gadget of gadgets) {
    if (matchFilterId(gadget, filterId)) return true
  }
  return false
}

/** 該当商品が1件以上あるフィルター／グループのみ残す */
function pruneEmptyFilterGroups(
  groups: FilterGroup[],
  gadgets: Gadget[],
  options?: { preserveAllFiltersInGroups?: string[] },
): FilterGroup[] {
  if (gadgets.length === 0) return []
  const preserve = new Set(options?.preserveAllFiltersInGroups ?? [])
  return groups
    .map((group) => ({
      ...group,
      filters: preserve.has(group.id)
        ? group.filters
        : group.filters.filter((filter) => filterHasMatches(gadgets, filter.id)),
    }))
    .filter((group) => group.filters.length > 0)
}

function buildAudioInterfaceFilterGroups(gadgets: Gadget[]): FilterGroup[] {
  const inputFilters = buildMajorAudioInterfaceInputFilters(
    gadgets,
    AUDIO_INTERFACE_INPUT_FILTER_MIN_COUNT,
  )
    .filter(({ count, id }) => count > 0 || id.endsWith("-4plus"))
    .map(({ id, label, match }) => ({ id, label, match }))

  return CATEGORY_FILTER_GROUPS["audio-interface"].map((group) => {
    if (group.id !== "ai-input") return group
    return { ...group, filters: inputFilters }
  })
}

function buildGamingChairFilterGroups(gadgets: Gadget[]): FilterGroup[] {
  const brandFilters = buildMajorGamingChairBrandFilters(
    gadgets,
    GAMING_CHAIR_MAJOR_BRAND_MIN_COUNT,
  ).map(({ id, label, match }) => ({ id, label, match }))

  return CATEGORY_FILTER_GROUPS["gaming-chair"].map((group) => {
    if (group.id !== "chair-other") return group
    return {
      ...group,
      filters: [...pickFilters(["chair-ottoman-yes"]), ...brandFilters],
    }
  })
}

function dedupeFiltersById(filters: FilterOption[]): FilterOption[] {
  const seen = new Set<string>()
  return filters.filter((filter) => {
    if (seen.has(filter.id)) return false
    seen.add(filter.id)
    return true
  })
}

function buildKeyboardFilterGroups(gadgets: Gadget[]): FilterGroup[] {
  // getFilterGroupsForCategory("keyboard") 経由では pool はキーボードのみ
  const keyboards = gadgets
  const layoutGroupTemplate = CATEGORY_FILTER_GROUPS.keyboard.find((g) => g.id === "layout")
  const keyboardLayoutSizeFilters = dedupeFiltersById(
    layoutGroupTemplate?.filters.filter((filter) =>
      keyboardFilterMeetsMinCount(keyboards, filter, 1),
    ) ?? [],
  )
  const keyboardFeaturesTemplate = CATEGORY_FILTER_GROUPS.keyboard.find((g) => g.id === "features")
  const staticKeyboardFeatureFilters =
    keyboardFeaturesTemplate?.filters.filter((filter) =>
      keyboardFilterMeetsMinCount(keyboards, filter, KEYBOARD_MAJOR_FILTER_MIN_COUNT),
    ) ?? []
  const keyboardPowerLayoutArrayFilters = dedupeFiltersById(
    pickFilters(["layout-jis", "layout-us", "layout-korean"]).filter((filter) =>
      keyboardFilterMeetsMinCount(keyboards, filter, 1),
    ),
  )

  const base = buildMajorKeyboardFilterGroups(
    CATEGORY_FILTER_GROUPS.keyboard.filter(
      (group) => group.id !== "keyboard-polling-rate" && group.id !== "features",
    ),
    gadgets,
    KEYBOARD_MAJOR_FILTER_MIN_COUNT,
  )

  const structureFilters = dedupeFiltersById(
    buildKeyboardInternalStructureFilters(
      gadgets,
      KEYBOARD_MAJOR_FILTER_MIN_COUNT,
    ).map(({ id, label, match }) => ({ id, label, match })),
  )
  const pollingFilters = dedupeFiltersById(
    buildKeyboardPollingRateFilters(gadgets, 1).map(({ id, label, match }) => ({
      id,
      label,
      match,
    })),
  )
  const featureFilters = dedupeFiltersById(
    buildKeyboardFeatureFilters(gadgets, 1).map(({ id, label, match }) => ({
      id,
      label,
      match,
    })),
  )
  const keyboardFunctionFilters = dedupeFiltersById([
    ...staticKeyboardFeatureFilters,
    ...pollingFilters,
  ])

  const groupsWithFeatures = [...base]
  if (keyboardFunctionFilters.length > 0) {
    const connectionIndex = groupsWithFeatures.findIndex((group) => group.id === "connection")
    const insertAt = connectionIndex >= 0 ? connectionIndex + 1 : groupsWithFeatures.length
    groupsWithFeatures.splice(insertAt, 0, {
      id: "features",
      label: "キーボード機能",
      matchMode: "any",
      filters: keyboardFunctionFilters,
    })
  }

  return groupsWithFeatures
    .map((group) => {
      if (group.id === "layout" && keyboardLayoutSizeFilters.length > 0) {
        return { ...group, filters: keyboardLayoutSizeFilters }
      }
      if (group.id === "internal-structure" && structureFilters.length > 0) {
        return { ...group, filters: structureFilters }
      }
      if (group.id === "keyboard-power") {
        return {
          ...group,
          label: "電源/配列",
          filters: dedupeFiltersById([...group.filters, ...keyboardPowerLayoutArrayFilters]),
        }
      }
      if (group.id === "keyboard-features") {
        return { ...group, filters: featureFilters }
      }
      return group
    })
    .filter((group) => group.filters.length > 0)
}

function hasCompat(gadget: Gadget, pattern: string) {
  const p = pattern.toLowerCase()
  return gadget.compat.some(
    (c) =>
      (c.status === "ok" || c.status === "warn") &&
      c.label.toLowerCase().includes(p),
  )
}

const gadgetHaystackCache = new WeakMap<Gadget, string>()

function gadgetHaystack(gadget: Gadget) {
  const cached = gadgetHaystackCache.get(gadget)
  if (cached !== undefined) return cached

  const chunks = [
    gadget.name,
    gadget.connection,
    gadget.tagline,
    ...gadget.compat.map((c) => c.label),
    ...gadget.highlights.flatMap((h) => [h.label, h.value]),
    ...gadget.specGroups.flatMap((g) => g.rows.flatMap((r) => [r.label, r.value])),
  ]
  const haystack = chunks.join(" ").toLowerCase()
  gadgetHaystackCache.set(gadget, haystack)
  return haystack
}

const REFRESH_RATE_HZ_RE = /(\d{2,3})\s*hz/g
const DPI_VALUE_RE = /([\d,]+)\s*dpi/gi
const WEIGHT_GRAMS_RE = /(\d+)\s*g(?:\b|\s)/i

function maxRefreshRateHz(gadget: Gadget) {
  const hay = gadgetHaystack(gadget)
  REFRESH_RATE_HZ_RE.lastIndex = 0
  const rates = [...hay.matchAll(REFRESH_RATE_HZ_RE)].map((m) => Number(m[1]))
  return rates.length > 0 ? Math.max(...rates) : 0
}

function maxDpi(gadget: Gadget) {
  const hay = gadgetHaystack(gadget)
  DPI_VALUE_RE.lastIndex = 0
  const values = [...hay.matchAll(DPI_VALUE_RE)].map((m) =>
    Number(m[1].replace(/,/g, "")),
  )
  return values.length > 0 ? Math.max(...values) : 0
}

function weightGrams(gadget: Gadget) {
  for (const h of gadget.highlights) {
    if (/重量|weight/i.test(h.label)) {
      const m = h.value.match(/([\d,]+)\s*g/i)
      if (m) return Number(m[1].replace(/,/g, ""))
    }
  }
  const m = gadgetHaystack(gadget).match(WEIGHT_GRAMS_RE)
  return m ? Number(m[1]) : null
}

function monitorMatch(gadget: Gadget, tag: MonitorFilterTag) {
  return gadget.category === "monitor" && hasMonitorFilterTag(gadget, tag)
}

function monitorArmMatch(
  gadget: Gadget,
  tag: keyof typeof MONITOR_ARM_FILTER_TAG_LABELS,
) {
  return gadget.category === "monitor-arm" && hasMonitorArmFilterTag(gadget, tag)
}

function gamingChairMatch(
  gadget: Gadget,
  tag: Parameters<typeof hasGamingChairFilterTag>[1],
) {
  return gadget.category === "gaming-chair" && hasGamingChairFilterTag(gadget, tag)
}

const AI_FILTER_ID_TO_TAG: Record<
  Extract<
    FilterId,
    | "ai-use-streaming"
    | "ai-use-vocal"
    | "ai-use-instrument"
    | "ai-use-dtm"
    | "ai-feat-direct-monitoring"
    | "ai-feat-loopback"
    | "ai-feat-phantom"
    | "ai-conn-usb-c"
    | "ai-conn-usb-b"
    | "ai-conn-bluetooth"
    | "ai-conn-thunderbolt"
    | "ai-conn-35mm"
    | "ai-sr-48-95"
    | "ai-sr-96-191"
    | "ai-sr-192-plus"
    | "ai-bit-16"
    | "ai-bit-24"
    | "ai-bit-32"
    | "ai-bit-32-float"
    | "ai-sys-win"
    | "ai-sys-mac"
    | "ai-sys-ios"
    | "ai-sys-android"
    | "ai-sys-linux"
  >,
  AudioInterfaceFilterTag
> = {
  "ai-use-streaming": "use-streaming",
  "ai-use-vocal": "use-vocal",
  "ai-use-instrument": "use-instrument",
  "ai-use-dtm": "use-dtm",
  "ai-feat-direct-monitoring": "feat-direct-monitoring",
  "ai-feat-loopback": "feat-loopback",
  "ai-feat-phantom": "feat-phantom",
  "ai-conn-usb-c": "conn-usb-c",
  "ai-conn-usb-b": "conn-usb-b",
  "ai-conn-bluetooth": "conn-bluetooth",
  "ai-conn-thunderbolt": "conn-thunderbolt",
  "ai-conn-35mm": "conn-35mm",
  "ai-sr-48-95": "sr-48-95",
  "ai-sr-96-191": "sr-96-191",
  "ai-sr-192-plus": "sr-192-plus",
  "ai-bit-16": "bit-16",
  "ai-bit-24": "bit-24",
  "ai-bit-32": "bit-32",
  "ai-bit-32-float": "bit-32-float",
  "ai-sys-win": "sys-win",
  "ai-sys-mac": "sys-mac",
  "ai-sys-ios": "sys-ios",
  "ai-sys-android": "sys-android",
  "ai-sys-linux": "sys-linux",
}

function audioInterfaceMatch(gadget: Gadget, filterId: keyof typeof AI_FILTER_ID_TO_TAG) {
  return (
    gadget.category === "audio-interface" &&
    hasAudioInterfaceFilterTag(gadget, AI_FILTER_ID_TO_TAG[filterId])
  )
}

function monitorVesaMatch(gadget: Gadget, tag: MonitorVesaFilterTag) {
  return gadget.category === "monitor" && hasMonitorVesaFilterTag(gadget, tag)
}

const FILTER_REGISTRY: Record<FilterId, FilterOption> = {
  bluetooth: {
    id: "bluetooth",
    label: "Bluetooth",
    match: (g) =>
      /bluetooth/i.test(g.connection) || hasCompat(g, "bluetooth"),
  },
  "wireless-24ghz": {
    id: "wireless-24ghz",
    label: "2.4GHzワイヤレス",
    match: (g) =>
      /2\.4\s*ghz|lightspeed|logi bolt/i.test(g.connection) ||
      hasCompat(g, "2.4ghz") ||
      hasCompat(g, "lightspeed") ||
      hasCompat(g, "logi bolt"),
  },
  wired: {
    id: "wired",
    label: "有線",
    match: (g) => {
      if (g.category === "keyboard") {
        return matchesKeyboardWiredConnectionFilter(g)
      }
      return false
    },
  },
  "usb-c": {
    id: "usb-c",
    label: "USB Type-C",
    match: (g) => {
      if (g.category === "keyboard") {
        return matchesKeyboardUsbTypeCConnectionFilter(g)
      }
      const hay = gadgetHaystack(g)
      return /usb[-\s]?c|type-c/i.test(hay) || hasCompat(g, "usb-c")
    },
  },
  usb: {
    id: "usb",
    label: "USB接続",
    match: (g) => {
      if (g.category === "mic") return matchesMicUsbConnectionFilter(g)
      return (
        /\busb\b|usb-a|プラグ&プレイ/i.test(gadgetHaystack(g)) ||
        hasCompat(g, "usb プラグ")
      )
    },
  },
  xlr: {
    id: "xlr",
    label: "XLR端子",
    match: (g) => {
      if (g.category === "mic") return matchesMicXlrConnectionFilter(g)
      return /xlr/i.test(g.connection) || hasCompat(g, "xlr")
    },
  },
  silent: {
    id: "silent",
    label: "静音仕様",
    match: (g) =>
      g.category === "mouse"
        ? hasMouseSpreadsheetUsageTag(g, "silent")
        : /静音/.test(g.tagline) || /静音/.test(gadgetHaystack(g)),
  },
  "high-dpi": {
    id: "high-dpi",
    label: "DPI切替 (8,000+)",
    match: (g) => maxDpi(g) >= 8000,
  },
  lightweight: {
    id: "lightweight",
    label: "軽量 (~80g以下)",
    match: (g) => {
      const w = weightGrams(g)
      return (w !== null && w <= 80) || /軽量|lightweight|60\s*g|58\s*g/i.test(gadgetHaystack(g))
    },
  },
  "hot-swap": {
    id: "hot-swap",
    label: "ホットスワップ",
    match: (g) =>
      hasCompat(g, "ホットスワップ") || /ホットスワップ|hot.?swap/i.test(gadgetHaystack(g)),
  },
  backlight: {
    id: "backlight",
    label: "バックライト",
    match: (g) =>
      /バックライト|backlight|イルミネ|スマート照明/i.test(gadgetHaystack(g)),
  },
  "layout-jis": {
    id: "layout-jis",
    label: "JIS配列",
    match: (g) => g.category === "keyboard" && matchesKeyboardLayoutArrayJis(g),
  },
  "layout-us": {
    id: "layout-us",
    label: "US配列",
    match: (g) => g.category === "keyboard" && matchesKeyboardLayoutArrayUs(g),
  },
  "layout-korean": {
    id: "layout-korean",
    label: "韓国語配列",
    match: (g) => g.category === "keyboard" && matchesKeyboardLayoutArrayKorean(g),
  },
  "kb-layout-under-70": {
    id: "kb-layout-under-70",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-under-70"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-under-70"),
  },
  "kb-layout-71-80": {
    id: "kb-layout-71-80",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-71-80"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-71-80"),
  },
  "kb-layout-81-99": {
    id: "kb-layout-81-99",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-81-99"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-81-99"),
  },
  "kb-layout-full-size": {
    id: "kb-layout-full-size",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-full-size"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-full-size"),
  },
  "kb-layout-ipad": {
    id: "kb-layout-ipad",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-ipad"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-ipad"),
  },
  "kb-layout-surface": {
    id: "kb-layout-surface",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-surface"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-surface"),
  },
  "kb-layout-tablet": {
    id: "kb-layout-tablet",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-tablet"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-tablet"),
  },
  "kb-layout-foldable": {
    id: "kb-layout-foldable",
    label: KEYBOARD_LAYOUT_FILTER_LABELS["kb-layout-foldable"],
    match: (g) => matchesKeyboardLayoutFilterId(g, "kb-layout-foldable"),
  },
  "kb-structure-scissor": {
    id: "kb-structure-scissor",
    label: "Perfect Stroke シザー",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-structure-scissor"),
  },
  "kb-structure-double-gasket": {
    id: "kb-structure-double-gasket",
    label: "ダブルガスケット",
    match: (g) =>
      g.category === "keyboard" &&
      hasKeyboardFilterTag(g, "kb-structure-double-gasket"),
  },
  "kb-structure-gasket": {
    id: "kb-structure-gasket",
    label: "ガスケットマウント",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-structure-gasket"),
  },
  "kb-structure-tray": {
    id: "kb-structure-tray",
    label: "トレーマウント",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-structure-tray"),
  },
  "kb-keycap-spherical": {
    id: "kb-keycap-spherical",
    label: "球面ディッシュ",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-keycap-spherical"),
  },
  "kb-keycap-pbt-double": {
    id: "kb-keycap-pbt-double",
    label: "PBT",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-keycap-pbt-double"),
  },
  "kb-keycap-abs": {
    id: "kb-keycap-abs",
    label: "ABS",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-keycap-abs"),
  },
  "kb-keycap-pc": {
    id: "kb-keycap-pc",
    label: "PC（ポリカーボネート）",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-keycap-pc"),
  },
  "kb-keycap-low-profile": {
    id: "kb-keycap-low-profile",
    label: "ロープロファイル",
    match: (g) =>
      g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-keycap-low-profile"),
  },
  cardioid: {
    id: "cardioid",
    label: "単一指向性",
    match: (g) =>
      /単一指向|カーディオイド|cardioid/i.test(gadgetHaystack(g)),
  },
  condenser: {
    id: "condenser",
    label: "コンデンサー",
    match: (g) => /コンデンサ|condenser/i.test(gadgetHaystack(g)),
  },
  "mic-type-pin": {
    id: "mic-type-pin",
    label: MIC_FILTER_TAG_LABELS.pin,
    match: (g) => g.category === "mic" && hasMicFilterTag(g, "pin"),
  },
  "mic-type-conference": {
    id: "mic-type-conference",
    label: MIC_FILTER_TAG_LABELS.conference,
    match: (g) => g.category === "mic" && hasMicFilterTag(g, "conference"),
  },
  "mic-type-stand": {
    id: "mic-type-stand",
    label: MIC_FILTER_TAG_LABELS.stand,
    match: (g) => g.category === "mic" && hasMicFilterTag(g, "stand"),
  },
  "mic-type-condenser": {
    id: "mic-type-condenser",
    label: MIC_FILTER_TAG_LABELS.condenser,
    match: (g) => g.category === "mic" && hasMicFilterTag(g, "condenser"),
  },
  "mic-type-dynamic": {
    id: "mic-type-dynamic",
    label: MIC_FILTER_TAG_LABELS.dynamic,
    match: (g) => g.category === "mic" && hasMicFilterTag(g, "dynamic"),
  },
  "mic-type-wireless": {
    id: "mic-type-wireless",
    label: MIC_FILTER_TAG_LABELS.wireless,
    match: (g) => g.category === "mic" && hasMicFilterTag(g, "wireless"),
  },
  "mic-type-headset": {
    id: "mic-type-headset",
    label: MIC_FILTER_TAG_LABELS.headset,
    match: (g) => g.category === "mic" && hasMicFilterTag(g, "headset"),
  },
  "mic-use-web-meeting": {
    id: "mic-use-web-meeting",
    label: MIC_USE_TAGS[0],
    match: (g) => g.category === "mic" && hasMicUseTag(g, MIC_USE_TAGS[0]),
  },
  "mic-use-streaming": {
    id: "mic-use-streaming",
    label: MIC_USE_TAGS[1],
    match: (g) => g.category === "mic" && hasMicUseTag(g, MIC_USE_TAGS[1]),
  },
  "mic-use-dtm": {
    id: "mic-use-dtm",
    label: MIC_USE_TAGS[2],
    match: (g) => g.category === "mic" && hasMicUseTag(g, MIC_USE_TAGS[2]),
  },
  "mic-use-vlog": {
    id: "mic-use-vlog",
    label: MIC_USE_TAGS[3],
    match: (g) => g.category === "mic" && hasMicUseTag(g, MIC_USE_TAGS[3]),
  },
  "mic-feat-mute": {
    id: "mic-feat-mute",
    label: "ミュートボタン",
    match: (g) => g.category === "mic" && hasMicFeatureTag(g, MIC_FEATURE_TAGS[0]),
  },
  "mic-feat-headphone-jack": {
    id: "mic-feat-headphone-jack",
    label: MIC_FEATURE_TAGS[1],
    match: (g) => g.category === "mic" && hasMicFeatureTag(g, MIC_FEATURE_TAGS[1]),
  },
  "mic-feat-gain-knob": {
    id: "mic-feat-gain-knob",
    label: MIC_FEATURE_TAGS[2],
    match: (g) => g.category === "mic" && hasMicFeatureTag(g, MIC_FEATURE_TAGS[2]),
  },
  "mic-feat-noise-cancel": {
    id: "mic-feat-noise-cancel",
    label: MIC_FEATURE_TAGS[3],
    match: (g) => g.category === "mic" && hasMicFeatureTag(g, "ノイズキャンセリング"),
  },
  "mic-feat-asmr": {
    id: "mic-feat-asmr",
    label: MIC_FEATURE_TAGS[4],
    match: (g) => g.category === "mic" && hasMicFeatureTag(g, "ASMR"),
  },
  "mic-sheet-j-noise-cancel": {
    id: "mic-sheet-j-noise-cancel",
    label: MIC_SPREADSHEET_J_TAG_LABELS["ノイズキャンセリング"],
    match: (g) => g.category === "mic" && hasMicFeatureTag(g, "ノイズキャンセリング"),
  },
  "mic-sheet-j-asmr": {
    id: "mic-sheet-j-asmr",
    label: MIC_SPREADSHEET_J_TAG_LABELS.ASMR,
    match: (g) => g.category === "mic" && hasMicFeatureTag(g, "ASMR"),
  },
  "mic-sheet-k-mute": {
    id: "mic-sheet-k-mute",
    label: MIC_SPREADSHEET_K_TAG_LABELS["ミュート機能"],
    match: (g) => micSpreadsheetFilterMatch(g, "mic-sheet-k-mute"),
  },
  "mon-sheet-l-curved": {
    id: "mon-sheet-l-curved",
    label: MONITOR_SPREADSHEET_L_TAG_LABELS["曲面"],
    match: (g) => monitorSpreadsheetFilterMatch(g, "mon-sheet-l-curved"),
  },
  "4k": {
    id: "4k",
    label: "4K対応",
    match: (g) => /4k|3840\s*[x×]\s*2160|uhd/i.test(gadgetHaystack(g)),
  },
  "fhd-1080": {
    id: "fhd-1080",
    label: "1080p / FHD",
    match: (g) =>
      /1080|fhd|1920\s*[x×]\s*1080/i.test(gadgetHaystack(g)),
  },
  "privacy-shutter": {
    id: "privacy-shutter",
    label: "プライバシーシャッター",
    match: (g) =>
      hasCompat(g, "プライバシー") ||
      hasCompat(g, "シャッター") ||
      /プライバシー.*シャッター/i.test(gadgetHaystack(g)),
  },
  "cam-res-4k": {
    id: "cam-res-4k",
    label: CAMERA_RESOLUTION_LABELS["res-4k"],
    match: (g) => hasCameraResolutionTag(g, "res-4k"),
  },
  "cam-res-2k": {
    id: "cam-res-2k",
    label: CAMERA_RESOLUTION_LABELS["res-2k"],
    match: (g) => hasCameraResolutionTag(g, "res-2k"),
  },
  "cam-res-1080p": {
    id: "cam-res-1080p",
    label: CAMERA_RESOLUTION_LABELS["res-1080p"],
    match: (g) => hasCameraResolutionTag(g, "res-1080p"),
  },
  "cam-res-720-below": {
    id: "cam-res-720-below",
    label: CAMERA_RESOLUTION_LABELS["res-720-below"],
    match: (g) => hasCameraResolutionTag(g, "res-720-below"),
  },
  "cam-fov-wide": {
    id: "cam-fov-wide",
    label: CAMERA_FOV_LABELS["fov-wide"],
    match: (g) => hasCameraFovTag(g, "fov-wide"),
  },
  "cam-fov-standard": {
    id: "cam-fov-standard",
    label: CAMERA_FOV_LABELS["fov-standard"],
    match: (g) => hasCameraFovTag(g, "fov-standard"),
  },
  "cam-fov-narrow": {
    id: "cam-fov-narrow",
    label: CAMERA_FOV_LABELS["fov-narrow"],
    match: (g) => hasCameraFovTag(g, "fov-narrow"),
  },
  "cam-fov-unknown": {
    id: "cam-fov-unknown",
    label: CAMERA_FOV_LABELS["fov-unknown"],
    match: (g) => hasCameraFovTag(g, "fov-unknown"),
  },
  "cam-mic-built-in": {
    id: "cam-mic-built-in",
    label: CAMERA_MIC_LABELS["mic-built-in"],
    match: (g) => hasCameraMicTag(g, "mic-built-in"),
  },
  "resolution-4k": {
    id: "resolution-4k",
    label: "4K解像度",
    match: (g) =>
      g.category === "monitor" &&
      /4k|3840\s*[x×]\s*2160|uhd/i.test(gadgetHaystack(g)),
  },
  "resolution-fhd": {
    id: "resolution-fhd",
    label: "FHD (1080p)",
    match: (g) =>
      g.category === "monitor" &&
      /fhd|1080|1920\s*[x×]\s*1080/i.test(gadgetHaystack(g)),
  },
  "refresh-144": {
    id: "refresh-144",
    label: "144Hz以上",
    match: (g) => maxRefreshRateHz(g) >= 144,
  },
  "usb-c-pd": {
    id: "usb-c-pd",
    label: "USB-C給電",
    match: (g) =>
      (hasCompat(g, "usb-c") || /usb-c/i.test(gadgetHaystack(g))) &&
      /給電|pd|power delivery|65w/i.test(gadgetHaystack(g)),
  },
  vesa: {
    id: "vesa",
    label: "VESAマウント",
    match: (g) =>
      g.category === "monitor" &&
      (/vesa/i.test(gadgetHaystack(g)) || hasCompat(g, "vesa")),
  },
  "arm-size-up-to-27": {
    id: "arm-size-up-to-27",
    label: MONITOR_ARM_FILTER_TAG_LABELS["size-up-to-27"],
    match: (g) => monitorArmMatch(g, "size-up-to-27"),
  },
  "arm-size-28-35": {
    id: "arm-size-28-35",
    label: MONITOR_ARM_FILTER_TAG_LABELS["size-28-35"],
    match: (g) => monitorArmMatch(g, "size-28-35"),
  },
  "arm-size-36-plus": {
    id: "arm-size-36-plus",
    label: MONITOR_ARM_FILTER_TAG_LABELS["size-36-plus"],
    match: (g) => monitorArmMatch(g, "size-36-plus"),
  },
  "arm-load-up-to-9": {
    id: "arm-load-up-to-9",
    label: MONITOR_ARM_FILTER_TAG_LABELS["load-up-to-9"],
    match: (g) => monitorArmMatch(g, "load-up-to-9"),
  },
  "arm-load-10-14": {
    id: "arm-load-10-14",
    label: MONITOR_ARM_FILTER_TAG_LABELS["load-10-14"],
    match: (g) => monitorArmMatch(g, "load-10-14"),
  },
  "arm-load-15-plus": {
    id: "arm-load-15-plus",
    label: MONITOR_ARM_FILTER_TAG_LABELS["load-15-plus"],
    match: (g) => monitorArmMatch(g, "load-15-plus"),
  },
  "arm-mount-clamp": {
    id: "arm-mount-clamp",
    label: MONITOR_ARM_FILTER_TAG_LABELS["mount-clamp"],
    match: (g) => monitorArmMatch(g, "mount-clamp"),
  },
  "arm-mount-grommet": {
    id: "arm-mount-grommet",
    label: MONITOR_ARM_FILTER_TAG_LABELS["mount-grommet"],
    match: (g) => monitorArmMatch(g, "mount-grommet"),
  },
  "arm-mount-both": {
    id: "arm-mount-both",
    label: MONITOR_ARM_FILTER_TAG_LABELS["mount-both"],
    match: (g) => monitorArmMatch(g, "mount-both"),
  },
  "arm-mount-standalone": {
    id: "arm-mount-standalone",
    label: MONITOR_ARM_FILTER_TAG_LABELS["mount-standalone"],
    match: (g) => monitorArmMatch(g, "mount-standalone"),
  },
  "arm-mount-pole": {
    id: "arm-mount-pole",
    label: MONITOR_ARM_FILTER_TAG_LABELS["mount-pole"],
    match: (g) => monitorArmMatch(g, "mount-pole"),
  },
  "arm-mount-wall": {
    id: "arm-mount-wall",
    label: MONITOR_ARM_FILTER_TAG_LABELS["mount-wall"],
    match: (g) => monitorArmMatch(g, "mount-wall"),
  },
  "multi-pairing": {
    id: "multi-pairing",
    label: "マルチペアリング",
    match: (g) =>
      /easy-switch|マルチペア|3台|3モード/i.test(gadgetHaystack(g)) ||
      hasCompat(g, "easy-switch"),
  },
  "mouse-gaming": {
    id: "mouse-gaming",
    label: "ゲーミングマウス",
    match: (g) => g.category === "mouse" && g.mouseUsage === "gaming",
  },
  "mouse-productivity": {
    id: "mouse-productivity",
    label: "ビジネス・作業用",
    match: (g) => g.category === "mouse" && g.mouseUsage === "productivity",
  },
  "mouse-reading-optical": {
    id: "mouse-reading-optical",
    label: "オプティカル / 光学式",
    match: (g) => g.category === "mouse" && hasMouseFilterTag(g, "reading-optical"),
  },
  "mouse-reading-laser": {
    id: "mouse-reading-laser",
    label: "レーザー / Darkfield",
    match: (g) => g.category === "mouse" && hasMouseFilterTag(g, "reading-laser"),
  },
  "mouse-reading-trackball": {
    id: "mouse-reading-trackball",
    label: "トラックボール",
    match: (g) => g.category === "mouse" && hasMouseFilterTag(g, "reading-trackball"),
  },
  "mouse-reading-blueled": {
    id: "mouse-reading-blueled",
    label: "BlueLED",
    match: (g) => g.category === "mouse" && hasMouseFilterTag(g, "reading-blueled"),
  },
  "mouse-reading-ir-other": {
    id: "mouse-reading-ir-other",
    label: "IR LED / その他",
    match: (g) => g.category === "mouse" && hasMouseFilterTag(g, "reading-ir-other"),
  },
  "mouse-side-buttons": {
    id: "mouse-side-buttons",
    label: "サイドボタン",
    match: (g) => g.category === "mouse" && hasMouseFilterTag(g, "side-buttons"),
  },
  "mouse-side-wheel": {
    id: "mouse-side-wheel",
    label: "サイドホイール",
    match: (g) => g.category === "mouse" && hasMouseFilterTag(g, "side-wheel"),
  },
  ...Object.fromEntries(
    MOUSE_USAGE_SPEC_PRIMARY_TAGS.map((tag) => {
      const id = mouseUsageSpecFilterId(tag)
      return [
        id,
        {
          id,
          label: MOUSE_USAGE_SPEC_FILTER_LABELS[tag],
          match: (g: Gadget) => hasMouseSpreadsheetUsageTag(g, tag),
        },
      ] as const
    }),
  ),
  "keyboard-gaming": {
    id: "keyboard-gaming",
    label: "ゲーミングキーボード",
    match: (g) => g.category === "keyboard" && isGamingKeyboard(g),
  },
  "keyboard-rapid-trigger": {
    id: "keyboard-rapid-trigger",
    label: "ラピッドトリガー",
    match: (g) => g.category === "keyboard" && hasRapidTrigger(g),
  },
  "keyboard-tablet": {
    id: "keyboard-tablet",
    label: "タブレット用キーボード",
    match: (g) => g.category === "keyboard" && hasKeyboardUseTag(g, "タブレット用キーボード"),
  },
  "monitor-size-238": {
    id: "monitor-size-238",
    label: MONITOR_FILTER_TAG_LABELS["size-238"],
    match: (g) => monitorMatch(g, "size-238"),
  },
  "monitor-size-24": {
    id: "monitor-size-24",
    label: "24インチ",
    match: (g) => monitorMatch(g, "size-24"),
  },
  "monitor-size-27": {
    id: "monitor-size-27",
    label: "27インチ",
    match: (g) => monitorMatch(g, "size-27"),
  },
  "monitor-size-315-plus": {
    id: "monitor-size-315-plus",
    label: "31.5インチ以上",
    match: (g) => monitorMatch(g, "size-315-plus"),
  },
  "monitor-res-fhd": {
    id: "monitor-res-fhd",
    label: MONITOR_FILTER_TAG_LABELS["res-fhd"],
    match: (g) => monitorMatch(g, "res-fhd"),
  },
  "monitor-res-wqhd": {
    id: "monitor-res-wqhd",
    label: MONITOR_FILTER_TAG_LABELS["res-wqhd"],
    match: (g) => monitorMatch(g, "res-wqhd"),
  },
  "monitor-res-uwqhd": {
    id: "monitor-res-uwqhd",
    label: MONITOR_FILTER_TAG_LABELS["res-uwqhd"],
    match: (g) => monitorMatch(g, "res-uwqhd"),
  },
  "monitor-res-4k": {
    id: "monitor-res-4k",
    label: MONITOR_FILTER_TAG_LABELS["res-4k"],
    match: (g) => monitorMatch(g, "res-4k"),
  },
  "monitor-res-6k": {
    id: "monitor-res-6k",
    label: MONITOR_FILTER_TAG_LABELS["res-6k"],
    match: (g) => monitorMatch(g, "res-6k"),
  },
  "monitor-res-5k2k": {
    id: "monitor-res-5k2k",
    label: MONITOR_FILTER_TAG_LABELS["res-5k2k"],
    match: (g) => monitorMatch(g, "res-5k2k"),
  },
  "monitor-res-dqhd": {
    id: "monitor-res-dqhd",
    label: MONITOR_FILTER_TAG_LABELS["res-dqhd"],
    match: (g) => monitorMatch(g, "res-dqhd"),
  },
  "monitor-refresh-60": {
    id: "monitor-refresh-60",
    label: "60Hz",
    match: (g) => monitorMatch(g, "refresh-60"),
  },
  "monitor-refresh-75": {
    id: "monitor-refresh-75",
    label: "75Hz",
    match: (g) => monitorMatch(g, "refresh-75"),
  },
  "monitor-refresh-100": {
    id: "monitor-refresh-100",
    label: "100Hz",
    match: (g) => monitorMatch(g, "refresh-100"),
  },
  "monitor-refresh-144-plus": {
    id: "monitor-refresh-144-plus",
    label: "144Hz以上",
    match: (g) => monitorMatch(g, "refresh-144-plus"),
  },
  "monitor-refresh-240-plus": {
    id: "monitor-refresh-240-plus",
    label: "240Hz以上",
    match: (g) => monitorMatch(g, "refresh-240-plus"),
  },
  "monitor-port-hdmi": {
    id: "monitor-port-hdmi",
    label: "HDMI",
    match: (g) => monitorMatch(g, "port-hdmi"),
  },
  "monitor-port-dp": {
    id: "monitor-port-dp",
    label: "DisplayPort",
    match: (g) => monitorMatch(g, "port-dp"),
  },
  "monitor-port-usb-c": {
    id: "monitor-port-usb-c",
    label: "USB Type-C",
    match: (g) => monitorMatch(g, "port-usb-c"),
  },
  "monitor-port-usb-c-pd": {
    id: "monitor-port-usb-c-pd",
    label: "USB-C給電対応",
    match: (g) => monitorMatch(g, "port-usb-c-pd"),
  },
  "monitor-panel-ips": {
    id: "monitor-panel-ips",
    label: MONITOR_FILTER_TAG_LABELS["panel-ips"],
    match: (g) => monitorMatch(g, "panel-ips"),
  },
  "monitor-panel-ips-matte": {
    id: "monitor-panel-ips-matte",
    label: MONITOR_FILTER_TAG_LABELS["panel-ips-matte"],
    match: (g) => monitorMatch(g, "panel-ips-matte"),
  },
  "monitor-panel-fast-ips": {
    id: "monitor-panel-fast-ips",
    label: MONITOR_FILTER_TAG_LABELS["panel-fast-ips"],
    match: (g) => monitorMatch(g, "panel-fast-ips"),
  },
  "monitor-panel-fast-ips-matte": {
    id: "monitor-panel-fast-ips-matte",
    label: MONITOR_FILTER_TAG_LABELS["panel-fast-ips-matte"],
    match: (g) => monitorMatch(g, "panel-fast-ips-matte"),
  },
  "monitor-panel-va": {
    id: "monitor-panel-va",
    label: MONITOR_FILTER_TAG_LABELS["panel-va"],
    match: (g) => monitorMatch(g, "panel-va"),
  },
  "monitor-panel-va-matte": {
    id: "monitor-panel-va-matte",
    label: MONITOR_FILTER_TAG_LABELS["panel-va-matte"],
    match: (g) => monitorMatch(g, "panel-va-matte"),
  },
  "monitor-panel-tn": {
    id: "monitor-panel-tn",
    label: MONITOR_FILTER_TAG_LABELS["panel-tn"],
    match: (g) => monitorMatch(g, "panel-tn"),
  },
  "monitor-panel-oled": {
    id: "monitor-panel-oled",
    label: MONITOR_FILTER_TAG_LABELS["panel-oled"],
    match: (g) => monitorMatch(g, "panel-oled"),
  },
  "monitor-panel-ads": {
    id: "monitor-panel-ads",
    label: MONITOR_FILTER_TAG_LABELS["panel-ads"],
    match: (g) => monitorMatch(g, "panel-ads"),
  },
  "monitor-panel-miniled": {
    id: "monitor-panel-miniled",
    label: MONITOR_FILTER_TAG_LABELS["panel-miniled"],
    match: (g) => monitorMatch(g, "panel-miniled"),
  },
  "chair-mat-pu": {
    id: "chair-mat-pu",
    label: GAMING_CHAIR_MATERIAL_LABELS["mat-pu"],
    match: (g) => gamingChairMatch(g, "mat-pu"),
  },
  "chair-mat-mesh": {
    id: "chair-mat-mesh",
    label: GAMING_CHAIR_MATERIAL_LABELS["mat-mesh"],
    match: (g) => gamingChairMatch(g, "mat-mesh"),
  },
  "chair-mat-fabric": {
    id: "chair-mat-fabric",
    label: GAMING_CHAIR_MATERIAL_LABELS["mat-fabric"],
    match: (g) => gamingChairMatch(g, "mat-fabric"),
  },
  "chair-mat-leather": {
    id: "chair-mat-leather",
    label: GAMING_CHAIR_MATERIAL_LABELS["mat-leather"],
    match: (g) => gamingChairMatch(g, "mat-leather"),
  },
  "chair-adj-height": {
    id: "chair-adj-height",
    label: GAMING_CHAIR_ADJUSTMENT_LABELS["adj-height"],
    match: (g) => gamingChairMatch(g, "adj-height"),
  },
  "chair-adj-tilt": {
    id: "chair-adj-tilt",
    label: GAMING_CHAIR_ADJUSTMENT_LABELS["adj-tilt"],
    match: (g) => gamingChairMatch(g, "adj-tilt"),
  },
  "chair-adj-recline": {
    id: "chair-adj-recline",
    label: GAMING_CHAIR_ADJUSTMENT_LABELS["adj-recline"],
    match: (g) => gamingChairMatch(g, "adj-recline"),
  },
  "chair-adj-headrest": {
    id: "chair-adj-headrest",
    label: GAMING_CHAIR_ADJUSTMENT_LABELS["adj-headrest"],
    match: (g) => gamingChairMatch(g, "adj-headrest"),
  },
  "chair-adj-lumbar": {
    id: "chair-adj-lumbar",
    label: GAMING_CHAIR_ADJUSTMENT_LABELS["adj-lumbar"],
    match: (g) => gamingChairMatch(g, "adj-lumbar"),
  },
  "chair-adj-armrest": {
    id: "chair-adj-armrest",
    label: GAMING_CHAIR_ADJUSTMENT_LABELS["adj-armrest"],
    match: (g) => gamingChairMatch(g, "adj-armrest"),
  },
  "chair-recline-180": {
    id: "chair-recline-180",
    label: GAMING_CHAIR_RECLINE_LABELS["recline-180"],
    match: (g) => gamingChairMatch(g, "recline-180"),
  },
  "chair-recline-150-175": {
    id: "chair-recline-150-175",
    label: GAMING_CHAIR_RECLINE_LABELS["recline-150-175"],
    match: (g) => gamingChairMatch(g, "recline-150-175"),
  },
  "chair-recline-130-145": {
    id: "chair-recline-130-145",
    label: GAMING_CHAIR_RECLINE_LABELS["recline-130-145"],
    match: (g) => gamingChairMatch(g, "recline-130-145"),
  },
  "chair-recline-under-129": {
    id: "chair-recline-under-129",
    label: GAMING_CHAIR_RECLINE_LABELS["recline-under-129"],
    match: (g) => gamingChairMatch(g, "recline-under-129"),
  },
  "chair-ottoman-yes": {
    id: "chair-ottoman-yes",
    label: GAMING_CHAIR_OTTOMAN_LABELS["ottoman-yes"],
    match: (g) => gamingChairMatch(g, "ottoman-yes"),
  },
  "chair-ottoman-no": {
    id: "chair-ottoman-no",
    label: GAMING_CHAIR_OTTOMAN_LABELS["ottoman-no"],
    match: (g) => gamingChairMatch(g, "ottoman-no"),
  },
  "chair-style-bucket": {
    id: "chair-style-bucket",
    label: GAMING_CHAIR_STYLE_LABELS["style-bucket"],
    match: (g) => gamingChairMatch(g, "style-bucket"),
  },
  "chair-style-queen": {
    id: "chair-style-queen",
    label: GAMING_CHAIR_STYLE_LABELS["style-queen"],
    match: (g) => gamingChairMatch(g, "style-queen"),
  },
  "chair-style-floor": {
    id: "chair-style-floor",
    label: GAMING_CHAIR_STYLE_LABELS["style-floor"],
    match: (g) => gamingChairMatch(g, "style-floor"),
  },
  "chair-style-other": {
    id: "chair-style-other",
    label: GAMING_CHAIR_STYLE_LABELS["style-other"],
    match: (g) => gamingChairMatch(g, "style-other"),
  },
  "ai-use-streaming": {
    id: "ai-use-streaming",
    label: AI_FILTER_TAG_LABELS["use-streaming"],
    match: (g) => audioInterfaceMatch(g, "ai-use-streaming"),
  },
  "ai-use-vocal": {
    id: "ai-use-vocal",
    label: AI_FILTER_TAG_LABELS["use-vocal"],
    match: (g) => audioInterfaceMatch(g, "ai-use-vocal"),
  },
  "ai-use-instrument": {
    id: "ai-use-instrument",
    label: AI_FILTER_TAG_LABELS["use-instrument"],
    match: (g) => audioInterfaceMatch(g, "ai-use-instrument"),
  },
  "ai-use-dtm": {
    id: "ai-use-dtm",
    label: AI_FILTER_TAG_LABELS["use-dtm"],
    match: (g) => audioInterfaceMatch(g, "ai-use-dtm"),
  },
  "ai-feat-direct-monitoring": {
    id: "ai-feat-direct-monitoring",
    label: AI_FILTER_TAG_LABELS["feat-direct-monitoring"],
    match: (g) => audioInterfaceMatch(g, "ai-feat-direct-monitoring"),
  },
  "ai-feat-loopback": {
    id: "ai-feat-loopback",
    label: AI_FILTER_TAG_LABELS["feat-loopback"],
    match: (g) => audioInterfaceMatch(g, "ai-feat-loopback"),
  },
  "ai-feat-phantom": {
    id: "ai-feat-phantom",
    label: AI_FILTER_TAG_LABELS["feat-phantom"],
    match: (g) =>
      g.category === "audio-interface" &&
      (hasAudioInterfaceFilterTag(g, "feat-phantom") || isPhantomPowerSupported(g)),
  },
  "ai-conn-usb-c": {
    id: "ai-conn-usb-c",
    label: AI_FILTER_TAG_LABELS["conn-usb-c"],
    match: (g) => audioInterfaceMatch(g, "ai-conn-usb-c"),
  },
  "ai-conn-usb-b": {
    id: "ai-conn-usb-b",
    label: AI_FILTER_TAG_LABELS["conn-usb-b"],
    match: (g) => audioInterfaceMatch(g, "ai-conn-usb-b"),
  },
  "ai-conn-bluetooth": {
    id: "ai-conn-bluetooth",
    label: AI_FILTER_TAG_LABELS["conn-bluetooth"],
    match: (g) => audioInterfaceMatch(g, "ai-conn-bluetooth"),
  },
  "ai-conn-thunderbolt": {
    id: "ai-conn-thunderbolt",
    label: AI_FILTER_TAG_LABELS["conn-thunderbolt"],
    match: (g) => audioInterfaceMatch(g, "ai-conn-thunderbolt"),
  },
  "ai-conn-35mm": {
    id: "ai-conn-35mm",
    label: AI_FILTER_TAG_LABELS["conn-35mm"],
    match: (g) => audioInterfaceMatch(g, "ai-conn-35mm"),
  },
  "ai-sr-48-95": {
    id: "ai-sr-48-95",
    label: AI_FILTER_TAG_LABELS["sr-48-95"],
    match: (g) => audioInterfaceMatch(g, "ai-sr-48-95"),
  },
  "ai-sr-96-191": {
    id: "ai-sr-96-191",
    label: AI_FILTER_TAG_LABELS["sr-96-191"],
    match: (g) => audioInterfaceMatch(g, "ai-sr-96-191"),
  },
  "ai-sr-192-plus": {
    id: "ai-sr-192-plus",
    label: AI_FILTER_TAG_LABELS["sr-192-plus"],
    match: (g) => audioInterfaceMatch(g, "ai-sr-192-plus"),
  },
  "ai-bit-16": {
    id: "ai-bit-16",
    label: AI_FILTER_TAG_LABELS["bit-16"],
    match: (g) => audioInterfaceMatch(g, "ai-bit-16"),
  },
  "ai-bit-24": {
    id: "ai-bit-24",
    label: AI_FILTER_TAG_LABELS["bit-24"],
    match: (g) => audioInterfaceMatch(g, "ai-bit-24"),
  },
  "ai-bit-32": {
    id: "ai-bit-32",
    label: AI_FILTER_TAG_LABELS["bit-32"],
    match: (g) => audioInterfaceMatch(g, "ai-bit-32"),
  },
  "ai-bit-32-float": {
    id: "ai-bit-32-float",
    label: AI_FILTER_TAG_LABELS["bit-32-float"],
    match: (g) => audioInterfaceMatch(g, "ai-bit-32-float"),
  },
  "ai-sys-win": {
    id: "ai-sys-win",
    label: AI_FILTER_TAG_LABELS["sys-win"],
    match: (g) => audioInterfaceMatch(g, "ai-sys-win"),
  },
  "ai-sys-mac": {
    id: "ai-sys-mac",
    label: AI_FILTER_TAG_LABELS["sys-mac"],
    match: (g) => audioInterfaceMatch(g, "ai-sys-mac"),
  },
  "ai-sys-ios": {
    id: "ai-sys-ios",
    label: AI_FILTER_TAG_LABELS["sys-ios"],
    match: (g) => audioInterfaceMatch(g, "ai-sys-ios"),
  },
  "ai-sys-android": {
    id: "ai-sys-android",
    label: AI_FILTER_TAG_LABELS["sys-android"],
    match: (g) => audioInterfaceMatch(g, "ai-sys-android"),
  },
  "ai-sys-linux": {
    id: "ai-sys-linux",
    label: AI_FILTER_TAG_LABELS["sys-linux"],
    match: (g) => audioInterfaceMatch(g, "ai-sys-linux"),
  },
  "mouse-power-wired": {
    id: "mouse-power-wired",
    label: MOUSE_POWER_LABELS["power-wired"],
    match: (g) => g.category === "mouse" && hasMousePowerFilterTag(g, "power-wired"),
  },
  "mouse-power-rechargeable": {
    id: "mouse-power-rechargeable",
    label: MOUSE_POWER_LABELS["power-rechargeable"],
    match: (g) => g.category === "mouse" && hasMousePowerFilterTag(g, "power-rechargeable"),
  },
  "mouse-power-battery": {
    id: "mouse-power-battery",
    label: MOUSE_POWER_LABELS["power-battery"],
    match: (g) => g.category === "mouse" && hasMousePowerFilterTag(g, "power-battery"),
  },
  "mouse-buttons-3-under": {
    id: "mouse-buttons-3-under",
    label: MOUSE_BUTTON_LABELS["buttons-3-under"],
    match: (g) => g.category === "mouse" && hasMouseButtonFilterTag(g, "buttons-3-under"),
  },
  "mouse-buttons-4-6": {
    id: "mouse-buttons-4-6",
    label: MOUSE_BUTTON_LABELS["buttons-4-6"],
    match: (g) => g.category === "mouse" && hasMouseButtonFilterTag(g, "buttons-4-6"),
  },
  "mouse-buttons-6-over": {
    id: "mouse-buttons-6-over",
    label: MOUSE_BUTTON_LABELS["buttons-6-over"],
    match: (g) => g.category === "mouse" && hasMouseButtonFilterTag(g, "buttons-6-over"),
  },
  "mouse-weight-under-70": {
    id: "mouse-weight-under-70",
    label: MOUSE_WEIGHT_LABELS["weight-under-70"],
    match: (g) => g.category === "mouse" && hasMouseWeightFilterTag(g, "weight-under-70"),
  },
  "mouse-weight-70-90": {
    id: "mouse-weight-70-90",
    label: MOUSE_WEIGHT_LABELS["weight-70-90"],
    match: (g) => g.category === "mouse" && hasMouseWeightFilterTag(g, "weight-70-90"),
  },
  "mouse-weight-over-91": {
    id: "mouse-weight-over-91",
    label: MOUSE_WEIGHT_LABELS["weight-over-91"],
    match: (g) => g.category === "mouse" && hasMouseWeightFilterTag(g, "weight-over-91"),
  },
  "kb-power-wired": {
    id: "kb-power-wired",
    label: KEYBOARD_FILTER_TAG_LABELS["kb-power-wired"],
    match: (g) => g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-power-wired"),
  },
  "kb-power-rechargeable": {
    id: "kb-power-rechargeable",
    label: KEYBOARD_FILTER_TAG_LABELS["kb-power-rechargeable"],
    match: (g) => g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-power-rechargeable"),
  },
  "kb-power-battery": {
    id: "kb-power-battery",
    label: KEYBOARD_FILTER_TAG_LABELS["kb-power-battery"],
    match: (g) => g.category === "keyboard" && hasKeyboardFilterTag(g, "kb-power-battery"),
  },
  "mic-dir-cardioid": {
    id: "mic-dir-cardioid",
    label: MIC_DIRECTION_LABELS["dir-cardioid"],
    match: (g) => g.category === "mic" && hasMicDirectionFilterTag(g, "dir-cardioid"),
  },
  "mic-dir-omni": {
    id: "mic-dir-omni",
    label: MIC_DIRECTION_LABELS["dir-omni"],
    match: (g) => g.category === "mic" && hasMicDirectionFilterTag(g, "dir-omni"),
  },
  "mic-dir-switchable": {
    id: "mic-dir-switchable",
    label: MIC_DIRECTION_LABELS["dir-switchable"],
    match: (g) => g.category === "mic" && hasMicDirectionFilterTag(g, "dir-switchable"),
  },
  "mic-dir-super": {
    id: "mic-dir-super",
    label: MIC_DIRECTION_LABELS["dir-super"],
    match: (g) => g.category === "mic" && hasMicDirectionFilterTag(g, "dir-super"),
  },
  "mic-dir-other": {
    id: "mic-dir-other",
    label: MIC_DIRECTION_LABELS["dir-other"],
    match: (g) => g.category === "mic" && hasMicDirectionFilterTag(g, "dir-other"),
  },
  "mic-conn-other": {
    id: "mic-conn-other",
    label: MIC_CONNECTION_FILTER_LABELS["conn-other"],
    match: (g) => g.category === "mic" && matchesMicOtherConnectionFilter(g),
  },
  "cam-focus-auto": {
    id: "cam-focus-auto",
    label: CAMERA_FOCUS_LABELS["focus-auto"],
    match: (g) => hasCameraFocusTag(g, "focus-auto"),
  },
  "cam-non-usb-connection": {
    id: "cam-non-usb-connection",
    label: "USB接続以外",
    match: (g) => hasCameraNonUsbConnectionFilter(g),
  },
  "cam-sheet-i-ai-tracking": {
    id: "cam-sheet-i-ai-tracking",
    label: CAMERA_SPREADSHEET_I_TAG_LABELS["AI自動追跡"],
    match: (g) => cameraSpreadsheetFilterMatch(g, "cam-sheet-i-ai-tracking"),
  },
  "cam-sheet-i-ai-framing": {
    id: "cam-sheet-i-ai-framing",
    label: CAMERA_SPREADSHEET_I_TAG_LABELS["AIオートフレーミング"],
    match: (g) => cameraSpreadsheetFilterMatch(g, "cam-sheet-i-ai-framing"),
  },
  "cam-sheet-i-night-vision": {
    id: "cam-sheet-i-night-vision",
    label: CAMERA_SPREADSHEET_I_TAG_LABELS["自動暗視機能"],
    match: (g) => cameraSpreadsheetFilterMatch(g, "cam-sheet-i-night-vision"),
  },
  "cam-sheet-i-document": {
    id: "cam-sheet-i-document",
    label: CAMERA_SPREADSHEET_I_TAG_LABELS["書画カメラ"],
    match: (g) => cameraSpreadsheetFilterMatch(g, "cam-sheet-i-document"),
  },
  "monitor-vesa-100": {
    id: "monitor-vesa-100",
    label: MONITOR_VESA_FILTER_TAG_LABELS["vesa-100"],
    match: (g) => monitorVesaMatch(g, "vesa-100"),
  },
  "monitor-vesa-75": {
    id: "monitor-vesa-75",
    label: MONITOR_VESA_FILTER_TAG_LABELS["vesa-75"],
    match: (g) => monitorVesaMatch(g, "vesa-75"),
  },
  "monitor-vesa-200-plus": {
    id: "monitor-vesa-200-plus",
    label: MONITOR_VESA_FILTER_TAG_LABELS["vesa-200-plus"],
    match: (g) => monitorVesaMatch(g, "vesa-200-plus"),
  },
  "monitor-vesa-none": {
    id: "monitor-vesa-none",
    label: MONITOR_VESA_FILTER_TAG_LABELS["vesa-none"],
    match: (g) => monitorVesaMatch(g, "vesa-none"),
  },
  "arm-vesa-50": {
    id: "arm-vesa-50",
    label: MONITOR_ARM_FILTER_TAG_LABELS["vesa-50"],
    match: (g) => monitorArmMatch(g, "vesa-50"),
  },
  "arm-vesa-75": {
    id: "arm-vesa-75",
    label: MONITOR_ARM_FILTER_TAG_LABELS["vesa-75"],
    match: (g) => monitorArmMatch(g, "vesa-75"),
  },
  "arm-vesa-100": {
    id: "arm-vesa-100",
    label: MONITOR_ARM_FILTER_TAG_LABELS["vesa-100"],
    match: (g) => monitorArmMatch(g, "vesa-100"),
  },
  "arm-vesa-200": {
    id: "arm-vesa-200",
    label: MONITOR_ARM_FILTER_TAG_LABELS["vesa-200"],
    match: (g) => monitorArmMatch(g, "vesa-200"),
  },
  "arm-type-single": {
    id: "arm-type-single",
    label: MONITOR_ARM_ARM_TYPE_FILTER_LABELS["arm-type-single"],
    match: (g) => monitorArmArmTypeFilterMatch(g, "arm-type-single"),
  },
  "arm-type-dual-or-more": {
    id: "arm-type-dual-or-more",
    label: MONITOR_ARM_ARM_TYPE_FILTER_LABELS["arm-type-dual-or-more"],
    match: (g) => monitorArmArmTypeFilterMatch(g, "arm-type-dual-or-more"),
  },
}

function pickFilters(ids: FilterId[]): FilterOption[] {
  return ids.map((id) => FILTER_REGISTRY[id])
}

const CATEGORY_FILTER_GROUPS: Record<CategoryId, FilterGroup[]> = {
  mouse: [
    {
      id: "mouse-weight",
      label: "重量",
      matchMode: "any",
      filters: pickFilters([
        "mouse-weight-under-70",
        "mouse-weight-70-90",
        "mouse-weight-over-91",
      ]),
    },
    {
      id: "mouse-power-connection",
      label: "電源/接続方式",
      matchMode: "any",
      filters: pickFilters([
        "mouse-power-wired",
        "mouse-power-rechargeable",
        "mouse-power-battery",
        "bluetooth",
        "wireless-24ghz",
        "usb",
      ]),
    },
    {
      id: "reading",
      label: "読み取り方式",
      matchMode: "any",
      filters: pickFilters([
        "mouse-reading-optical",
        "mouse-reading-laser",
        "mouse-reading-trackball",
        "mouse-reading-blueled",
        "mouse-reading-ir-other",
      ]),
    },
    {
      id: "mouse-buttons",
      label: "ボタン数",
      matchMode: "any",
      filters: pickFilters([
        "mouse-buttons-3-under",
        "mouse-buttons-4-6",
        "mouse-buttons-6-over",
      ]),
    },
    {
      id: "mouse-specs-usage",
      label: "用途/その他の仕様",
      matchMode: "any",
      filters: pickFilters([
        ...MOUSE_USAGE_SPEC_PRIMARY_TAGS.map((tag) => mouseUsageSpecFilterId(tag)),
      ]),
    },
  ],
  keyboard: [
    {
      id: "layout",
      label: "レイアウト",
      matchMode: "any",
      filters: pickFilters([
        "kb-layout-under-70",
        "kb-layout-71-80",
        "kb-layout-81-99",
        "kb-layout-full-size",
        "kb-layout-ipad",
        "kb-layout-surface",
        "kb-layout-tablet",
        "kb-layout-foldable",
      ]),
    },
    {
      id: "internal-structure",
      label: "内部構造",
      matchMode: "any",
      filters: pickFilters([
        "kb-structure-scissor",
        "kb-structure-double-gasket",
        "kb-structure-gasket",
        "kb-structure-tray",
      ]),
    },
    {
      id: "keycaps",
      label: "キーキャップ",
      matchMode: "any",
      filters: pickFilters([
        "kb-keycap-pbt-double",
        "kb-keycap-abs",
        "kb-keycap-pc",
        "kb-keycap-low-profile",
      ]),
    },
    {
      id: "keyboard-power",
      label: "電源/配列",
      matchMode: "any",
      filters: pickFilters([
        "kb-power-wired",
        "kb-power-rechargeable",
        "kb-power-battery",
      ]),
    },
    {
      id: "connection",
      label: "接続方法",
      matchMode: "any",
      filters: pickFilters(["bluetooth", "wireless-24ghz", "wired", "usb-c"]),
    },
    {
      id: "keyboard-polling-rate",
      label: "ポーリングレート",
      matchMode: "any",
      filters: [],
    },
    {
      id: "features",
      label: "キーボード機能",
      matchMode: "any",
      filters: pickFilters([
        "keyboard-gaming",
        "keyboard-rapid-trigger",
      ]),
    },
    {
      id: "keyboard-features",
      label: "特徴",
      matchMode: "any",
      filters: [],
    },
  ],
  mic: [
    {
      id: "mic-direction",
      label: "指向性",
      matchMode: "any",
      filters: pickFilters([
        "mic-dir-cardioid",
        "mic-dir-omni",
        "mic-dir-switchable",
        "mic-dir-super",
        "mic-dir-other",
      ]),
    },
    {
      id: "connection",
      label: "接続方式",
      matchMode: "any",
      filters: pickFilters(["usb", "xlr", "mic-conn-other"]),
    },
    {
      id: "mic-type",
      label: "マイクタイプ",
      matchMode: "any",
      filters: pickFilters([
        "mic-type-pin",
        "mic-type-conference",
        "mic-type-stand",
        "mic-type-condenser",
        "mic-type-dynamic",
        "mic-type-wireless",
        "mic-type-headset",
      ]),
    },
    {
      id: "mic-feature",
      label: "機能",
      matchMode: "any",
      filters: pickFilters([
        "mic-feat-mute",
        "mic-feat-noise-cancel",
        "mic-feat-asmr",
      ]),
    },
    {
      id: "mic-sheet-k",
      label: "追加機能（K欄）",
      matchMode: "any",
      filters: pickFilters(["mic-sheet-k-mute"]),
    },
  ],
  camera: [
    {
      id: "resolution",
      label: "解像度",
      matchMode: "any",
      filters: pickFilters([
        "cam-res-4k",
        "cam-res-2k",
        "cam-res-1080p",
        "cam-res-720-below",
      ]),
    },
    {
      id: "fov",
      label: "画角",
      matchMode: "any",
      filters: pickFilters([
        "cam-fov-wide",
        "cam-fov-standard",
        "cam-fov-narrow",
        "cam-fov-unknown",
      ]),
    },
    {
      id: "features",
      label: "機能",
      matchMode: "any",
      filters: pickFilters([
        "cam-focus-auto",
        "cam-mic-built-in",
        "cam-non-usb-connection",
        "cam-sheet-i-ai-tracking",
        "cam-sheet-i-ai-framing",
        "cam-sheet-i-night-vision",
        "cam-sheet-i-document",
      ]),
    },
  ],
  monitor: [
    {
      id: "screen-size",
      label: "画面サイズ/画面形状",
      matchMode: "any",
      filters: pickFilters([
        "monitor-size-238",
        "monitor-size-24",
        "monitor-size-27",
        "monitor-size-315-plus",
        "mon-sheet-l-curved",
      ]),
    },
    {
      id: "resolution",
      label: "解像度",
      matchMode: "any",
      filters: pickFilters(
        MONITOR_RESOLUTION_FILTER_ORDER.map((tag) => `monitor-${tag}` as FilterId),
      ),
    },
    {
      id: "refresh-rate",
      label: "リフレッシュレート",
      matchMode: "any",
      filters: pickFilters([
        "monitor-refresh-60",
        "monitor-refresh-75",
        "monitor-refresh-100",
        "monitor-refresh-144-plus",
        "monitor-refresh-240-plus",
      ]),
    },
    {
      id: "vesa",
      label: "VESA",
      matchMode: "any",
      filters: pickFilters([
        "monitor-vesa-75",
        "monitor-vesa-100",
        "monitor-vesa-200-plus",
        "monitor-vesa-none",
      ]),
    },
    {
      id: "ports",
      label: "接続端子",
      matchMode: "any",
      filters: pickFilters([
        "monitor-port-hdmi",
        "monitor-port-dp",
        "monitor-port-usb-c",
        "monitor-port-usb-c-pd",
      ]),
    },
    {
      id: "panel-type",
      label: "液晶パネルの種類",
      matchMode: "any",
      filters: pickFilters([
        "monitor-panel-ips",
        "monitor-panel-ips-matte",
        "monitor-panel-fast-ips",
        "monitor-panel-fast-ips-matte",
        "monitor-panel-va",
        "monitor-panel-va-matte",
        "monitor-panel-tn",
        "monitor-panel-oled",
        "monitor-panel-ads",
      ]),
    },
  ],
  "monitor-arm": [
    {
      id: "arm-size-load",
      label: "最大取付サイズ/耐荷重",
      matchMode: "any",
      filters: pickFilters([
        "arm-size-up-to-27",
        "arm-size-28-35",
        "arm-size-36-plus",
        "arm-load-up-to-9",
        "arm-load-10-14",
        "arm-load-15-plus",
      ]),
    },
    {
      id: "arm-vesa",
      label: "VESA規格",
      matchMode: "any",
      filters: pickFilters(["arm-vesa-50", "arm-vesa-75", "arm-vesa-100", "arm-vesa-200"]),
    },
    {
      id: "arm-mount",
      label: "取付方式",
      matchMode: "any",
      filters: pickFilters([
        "arm-mount-both",
        "arm-mount-clamp",
        "arm-mount-grommet",
        "arm-mount-standalone",
        "arm-mount-pole",
        "arm-mount-wall",
      ]),
    },
    {
      id: "arm-type",
      label: "アーム数",
      matchMode: "any",
      filters: pickFilters(["arm-type-single", "arm-type-dual-or-more"]),
    },
  ],
  "gaming-chair": [
    {
      id: "chair-material",
      label: "素材",
      matchMode: "any",
      filters: pickFilters(["chair-mat-pu", "chair-mat-mesh", "chair-mat-fabric", "chair-mat-leather"]),
    },
    {
      id: "chair-style",
      label: "形状",
      matchMode: "any",
      filters: pickFilters([
        "chair-style-bucket",
        "chair-style-queen",
        "chair-style-floor",
        "chair-style-other",
      ]),
    },
    {
      id: "chair-recline",
      label: "最大リクライニング角度",
      matchMode: "any",
      filters: pickFilters([
        "chair-recline-180",
        "chair-recline-150-175",
        "chair-recline-130-145",
        "chair-recline-under-129",
      ]),
    },
    {
      id: "chair-adjustment",
      label: "調節機能",
      matchMode: "any",
      filters: pickFilters([
        "chair-adj-height",
        "chair-adj-tilt",
        "chair-adj-headrest",
        "chair-adj-lumbar",
        "chair-adj-armrest",
      ]),
    },
    {
      id: "chair-other",
      label: "その他",
      matchMode: "any",
      filters: pickFilters(["chair-ottoman-yes"]),
    },
  ],
  "audio-interface": [
    {
      id: "ai-input",
      label: "入力端子と数",
      matchMode: "any",
      filters: [],
    },
    {
      id: "ai-sample-rate",
      label: "サンプリングレート",
      matchMode: "any",
      filters: pickFilters(["ai-sr-48-95", "ai-sr-96-191", "ai-sr-192-plus"]),
    },
    {
      id: "ai-system",
      label: "システム要件",
      matchMode: "any",
      filters: pickFilters([
        "ai-sys-win",
        "ai-sys-mac",
        "ai-sys-ios",
        "ai-sys-android",
        "ai-sys-linux",
      ]),
    },
    {
      id: "ai-connection",
      label: "PC接続方式",
      matchMode: "any",
      filters: pickFilters([
        "ai-conn-usb-c",
        "ai-conn-usb-b",
        "ai-conn-bluetooth",
        "ai-conn-thunderbolt",
        "ai-conn-35mm",
      ]),
    },
  ],
}

/** カテゴリ表示名（フィルターパネル用） */
export function getCategoryFilterTitle(category: CategoryId): string {
  const titles: Record<CategoryId, string> = {
    mouse: "マウス",
    keyboard: "キーボード",
    mic: "マイク",
    camera: "カメラ",
    "monitor-arm": "モニターアーム",
    monitor: "モニター",
    "gaming-chair": "ゲーミングチェア",
    "audio-interface": "オーディオインターフェイス",
  }
  return titles[category]
}

/** カテゴリに応じたフィルターグループを返す（該当0件の選択肢は除外） */
export function getFilterGroupsForCategory(
  category: CategoryId | "all",
  gadgets: Gadget[] = [],
): FilterGroup[] {
  const pool = gadgetsForFilterContext(category, gadgets)

  let groups: FilterGroup[]
  if (category === "all") {
    groups = []
  } else if (category === "gaming-chair") {
    groups = buildGamingChairFilterGroups(pool)
  } else if (category === "audio-interface") {
    groups = buildAudioInterfaceFilterGroups(pool)
  } else if (category === "keyboard") {
    groups = buildKeyboardFilterGroups(pool)
  } else {
    groups = CATEGORY_FILTER_GROUPS[category] ?? []
  }

  if (category === "keyboard") return groups
  if (category === "monitor") {
    return pruneEmptyFilterGroups(groups, pool, { preserveAllFiltersInGroups: ["panel-type"] })
  }
  return pruneEmptyFilterGroups(groups, pool)
}

/** カテゴリで利用可能なフィルターID一覧 */
export function getFilterIdsForCategory(
  category: CategoryId | "all",
  gadgets: Gadget[] = [],
): FilterId[] {
  return getFilterGroupsForCategory(category, gadgets).flatMap((g) =>
    g.filters.map((f) => f.id),
  )
}

/** カテゴリ切替時に無効になったフィルターを除去 */
export function pruneFiltersForCategory(
  activeFilterIds: FilterId[],
  category: CategoryId | "all",
  gadgets: Gadget[] = [],
): FilterId[] {
  const allowed = new Set(getFilterIdsForCategory(category, gadgets))
  return activeFilterIds.filter((id) => allowed.has(id))
}

/** カテゴリの絞り込み条件を互換性タグとして評価 */
export function getCategoryFilterCompatTags(
  gadget: Gadget,
  gadgets: Gadget[] = [],
): CompatTag[] {
  const groups = getFilterGroupsForCategory(gadget.category, gadgets)
  const seen = new Set<string>()
  const tags: CompatTag[] = []

  for (const group of groups) {
    for (const filter of group.filters) {
      if (seen.has(filter.label)) continue
      seen.add(filter.label)
      tags.push({
        label: filter.label,
        status: filter.match(gadget) ? "ok" : "none",
        filterLinked: true,
      })
    }
  }

  return tags
}

/** 詳細パネル用：該当する絞り込み条件タグ（肯定のみ） */
export function getDetailFilterTags(gadget: Gadget, gadgets: Gadget[] = []): CompatTag[] {
  return getCategoryFilterCompatTags(gadget, gadgets).filter((tag) => tag.status === "ok")
}

/** @deprecated getDetailFilterTags を使用 */
export function getDetailCompatSections(gadget: Gadget): {
  filterTags: CompatTag[]
  extraTags: CompatTag[]
} {
  const filterTags = getDetailFilterTags(gadget)
  return { filterTags, extraTags: [] }
}

/** @deprecated getDetailFilterTags を使用 */
export function getDetailCompatTags(gadget: Gadget): CompatTag[] {
  return getDetailFilterTags(gadget)
}

/** マウス用途フィルター（相互排他） */
export const MOUSE_USAGE_FILTER_IDS: FilterId[] = ["mouse-gaming", "mouse-productivity"]

/** フィルター選択を更新（用途フィルターは1つのみ選択可） */
export function toggleFilterSelection(
  activeFilterIds: FilterId[],
  toggledId: FilterId,
): FilterId[] {
  if (activeFilterIds.includes(toggledId)) {
    return activeFilterIds.filter((id) => id !== toggledId)
  }

  const withoutExclusive = MOUSE_USAGE_FILTER_IDS.includes(toggledId)
    ? activeFilterIds.filter((id) => !MOUSE_USAGE_FILTER_IDS.includes(id))
    : activeFilterIds

  return [...withoutExclusive, toggledId]
}

function resolveFilterGroupsForMatching(
  categoryContext: CategoryId | "all",
  gadgets: Gadget[],
  resolvedGroups?: FilterGroup[],
): FilterGroup[] {
  if (resolvedGroups) return resolvedGroups
  if (categoryContext === "all") return []
  return getFilterGroupsForCategory(categoryContext, gadgets)
}

function evaluateGroupFilterMatch(gadget: Gadget, ids: FilterId[], mode: "any" | "all"): boolean {
  if (mode === "all") {
    return ids.every((id) => matchFilterId(gadget, id))
  }
  return ids.some((id) => matchFilterId(gadget, id))
}

function buildActiveFilterPlan(
  activeFilterIds: FilterId[],
  groups: FilterGroup[],
): {
  groupChecks: { mode: "any" | "all"; ids: FilterId[] }[]
  ungrouped: FilterId[]
} {
  const activeByGroup = new Map<string, FilterId[]>()
  const ungrouped: FilterId[] = []

  for (const id of activeFilterIds) {
    let grouped = false
    for (const group of groups) {
      if (group.filters.some((f) => f.id === id)) {
        const existing = activeByGroup.get(group.id) ?? []
        existing.push(id)
        activeByGroup.set(group.id, existing)
        grouped = true
        break
      }
    }
    if (!grouped) ungrouped.push(id)
  }

  const groupChecks = groups
    .map((group) => {
      const ids = activeByGroup.get(group.id)
      if (!ids?.length) return null
      return { mode: group.matchMode ?? "any", ids }
    })
    .filter((check): check is { mode: "any" | "all"; ids: FilterId[] } => check !== null)

  return { groupChecks, ungrouped }
}

/** フィルター条件からマッチャーを1回だけ構築（全件ループ内での再計算を避ける） */
export function createFilterMatcher(
  activeFilterIds: FilterId[],
  categoryContext: CategoryId | "all" = "all",
  gadgets: Gadget[] = [],
  resolvedGroups?: FilterGroup[],
): (gadget: Gadget) => boolean {
  if (activeFilterIds.length === 0) return () => true

  const groups = resolveFilterGroupsForMatching(categoryContext, gadgets, resolvedGroups)
  const { groupChecks, ungrouped } = buildActiveFilterPlan(activeFilterIds, groups)

  return (gadget: Gadget) => {
    for (const check of groupChecks) {
      if (!evaluateGroupFilterMatch(gadget, check.ids, check.mode)) return false
    }
    if (ungrouped.length > 0 && !evaluateGroupFilterMatch(gadget, ungrouped, "any")) return false
    return true
  }
}

/** 選択されたすべてのフィルター条件を満たすか（グループ間 AND / グループ内は matchMode に従う） */
export function matchesAllFilters(
  gadget: Gadget,
  activeFilterIds: FilterId[],
  categoryContext: CategoryId | "all" = "all",
  gadgets: Gadget[] = [],
  resolvedGroups?: FilterGroup[],
) {
  if (activeFilterIds.length === 0) return true

  const groups = resolveFilterGroupsForMatching(categoryContext, gadgets, resolvedGroups)
  const { groupChecks, ungrouped } = buildActiveFilterPlan(activeFilterIds, groups)

  for (const check of groupChecks) {
    if (!evaluateGroupFilterMatch(gadget, check.ids, check.mode)) return false
  }

  if (ungrouped.length > 0 && !evaluateGroupFilterMatch(gadget, ungrouped, "any")) return false
  return true
}
