import { RigidBody, CuboidCollider } from "@react-three/rapier"
import { useColliderStore } from "./ColliderStore"

export function AuthoredColliderPhysics() {
  const { state } = useColliderStore()
  return (
    <>
      {state.scene.boxes.map((b) =>
        b.enabled ? (
          <RigidBody key={b.id} type="fixed" colliders={false}>
            <CuboidCollider
              args={[b.scale[0] / 2, b.scale[1] / 2, b.scale[2] / 2]}
              position={b.position}
              rotation={b.rotation}
            />
          </RigidBody>
        ) : null
      )}
    </>
  )
}
