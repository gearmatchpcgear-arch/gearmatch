/**
 * モニターアーム取付方式フィルターの整合性チェック
 */
import { monitorArmBestsellers } from "../lib/monitor-arm-bestsellers.ts"
import { monitorArmNewReleases } from "../lib/monitor-arm-new-releases.ts"
import { monitorArmNewReleasesPage2 } from "../lib/monitor-arm-new-releases-page2.ts"
import {
  getMonitorArmFilterTags,
  getMonitorArmMountText,
  hasMonitorArmFilterTag,
  matchesMonitorArmMountFilterTag,
  MONITOR_ARM_MOUNT_FILTER_TAGS,
} from "../lib/monitor-arm-filter-tags.ts"
import { getFilterGroupsForCategory } from "../lib/gadget-filters.ts"
import { getListableGadgets } from "../lib/gadgets.ts"

const arms = getListableGadgets([
  ...monitorArmBestsellers,
  ...monitorArmNewReleases,
  ...monitorArmNewReleasesPage2,
])

const mountGroup = getFilterGroupsForCategory("monitor-arm", arms).find(
  (g) => g.id === "arm-mount",
)
const expectedLabels = [
  "クランプ & グロメット両対応",
  "クランプ式",
  "グロメット式",
  "自立型（スタンド）",
  "ポールマウント（支柱取付）",
  "壁掛け",
]

if (!mountGroup) {
  console.error("FAIL: arm-mount group missing")
  process.exit(1)
}

for (const label of expectedLabels) {
  if (!mountGroup.filters.some((f) => f.label === label)) {
    console.error("FAIL: missing mount filter label:", label)
    process.exit(1)
  }
}

if (mountGroup.filters.some((f) => f.label.includes("テーブルトップ"))) {
  console.error("FAIL: tabletop filter should be removed")
  process.exit(1)
}

const cases = [
  ["クランプ式 & グロメット式", "mount-both", true],
  ["クランプ式/グロメット式", "mount-both", true],
  ["クランプ・グロメット式", "mount-both", true],
  ["クランプ式", "mount-clamp", true],
  ["クランプ式", "mount-both", false],
  ["グロメット式", "mount-grommet", true],
  ["自立型", "mount-standalone", true],
  ["置き型", "mount-standalone", true],
  ["ポールマウント方式", "mount-pole", true],
  ["支柱取付け", "mount-pole", true],
  ["壁面取付", "mount-wall", true],
  ["壁掛け", "mount-wall", true],
  ["壁寄せ", "mount-wall", false],
]

let failed = 0
for (const [value, tag, expected] of cases) {
  const actual = matchesMonitorArmMountFilterTag(value, tag)
  if (actual !== expected) {
    console.error("FAIL mount match", { value, tag, expected, actual })
    failed++
  }
}

for (const tag of MONITOR_ARM_MOUNT_FILTER_TAGS) {
  const count = arms.filter((g) => hasMonitorArmFilterTag(g, tag)).length
  console.log(`${tag}: ${count}`)
}

const missingMount = arms.filter((g) => {
  const tags = getMonitorArmFilterTags(g)
  return !tags.some((t) => t.startsWith("mount-"))
})
console.log(`No mount tags: ${missingMount.length}`)
for (const g of missingMount.slice(0, 5)) {
  console.log(`  - ${g.name} | ${getMonitorArmMountText(g)}`)
}

if (failed > 0) {
  console.error(`${failed} verification(s) failed`)
  process.exit(1)
}

console.log("verify-monitor-arm-mount-filters: ok")
