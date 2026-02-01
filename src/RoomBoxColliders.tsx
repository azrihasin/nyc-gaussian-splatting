import { RigidBody, CuboidCollider } from "@react-three/rapier"
import type { Bounds } from "./SplatRoomScene"

/** How much to move East/West walls inward toward the center of the room (meters). */
export const WALL_INSET = 0.6
/** How much to move North/South walls inward (larger = more inward). */
export const WALL_INSET_Z = 2.2

export function RoomBoxColliders({ bounds, enabled }: { bounds: Bounds; enabled: boolean }) {
  if (!enabled) return null

  const { halfX, halfZ, height, wallThickness, floorThickness } = bounds
  const floorY = -floorThickness / 2
  const wallY = height / 2
  const inX = halfX - WALL_INSET
  const inZ = halfZ - WALL_INSET_Z

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[halfX, floorThickness / 2, halfZ]} position={[0, floorY, 0]} />
      </RigidBody>

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[wallThickness / 2, height / 2, halfZ]} position={[inX + wallThickness / 2, wallY, 0]} />
        <CuboidCollider args={[wallThickness / 2, height / 2, halfZ]} position={[-inX - wallThickness / 2, wallY, 0]} />
        <CuboidCollider args={[halfX, height / 2, wallThickness / 2]} position={[0, wallY, inZ + wallThickness / 2]} />
        <CuboidCollider args={[halfX, height / 2, wallThickness / 2]} position={[0, wallY, -inZ - wallThickness / 2]} />
      </RigidBody>
    </group>
  )
}
