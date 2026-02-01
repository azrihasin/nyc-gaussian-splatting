import type { ClickableObject } from "@/clickableObjects"

type Props = {
  objects: ClickableObject[]
  onObjectClick: (object: ClickableObject) => void
}

/**
 * Renders invisible box meshes for each clickable object. On pointer click (raycast hit),
 * calls onObjectClick so the parent can open the dialog.
 * TV uses a flat panel mesh (wide × tall × thin) similar to a wall-mounted screen.
 */
export function ClickableSceneObjects({ objects, onObjectClick }: Props) {
  return (
    <group>
      {objects.map((obj) => (
        <mesh
          key={obj.id}
          position={obj.position}
          rotation={obj.rotation ?? [0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation()
            onObjectClick(obj)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            document.body.style.cursor = "pointer"
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default"
          }}
        >
          <boxGeometry args={obj.scale} />
          <meshBasicMaterial
            color="black"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
