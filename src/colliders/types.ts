export type Vec3 = [number, number, number]

export type ColliderBox = {
  id: string
  name: string
  enabled: boolean
  position: Vec3
  rotation: Vec3 // Euler radians
  scale: Vec3    // box full extents (meters)
}

export type ColliderScene = {
  version: 1
  boxes: ColliderBox[]
}

export function makeId() {
  return (crypto?.randomUUID?.() ?? `id_${Math.random().toString(16).slice(2)}`)
}
