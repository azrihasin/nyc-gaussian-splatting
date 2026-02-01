import type { ColliderScene } from "./types"

const KEY = "splat_fps_colliders_v1"

export function saveToLocal(scene: ColliderScene) {
  localStorage.setItem(KEY, JSON.stringify(scene))
}

export function loadFromLocal(): ColliderScene | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as ColliderScene
    if (parsed?.version === 1 && Array.isArray(parsed.boxes)) return parsed
  } catch {}
  return null
}
