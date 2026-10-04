import { Mouse, Keyboard, Mic, Video, Monitor, MonitorUp, Armchair, AudioLines } from "lucide-react"
import type { CategoryId } from "@/lib/gadgets"

const map = {
  mouse: Mouse,
  keyboard: Keyboard,
  mic: Mic,
  camera: Video,
  "monitor-arm": MonitorUp,
  monitor: Monitor,
  "gaming-chair": Armchair,
  "audio-interface": AudioLines,
} as const

export function CategoryIcon({
  category,
  className,
}: {
  category: CategoryId
  className?: string
}) {
  const Icon = map[category]
  return <Icon className={className} aria-hidden="true" />
}
