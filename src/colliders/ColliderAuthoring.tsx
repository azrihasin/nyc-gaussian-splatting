import { useEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { OrbitControls, TransformControls } from "@react-three/drei"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import { useFrame, useThree } from "@react-three/fiber"
import { useColliderStore } from "./ColliderStore"
import type { ColliderBox, Vec3 } from "./types"

const DEG15 = THREE.MathUtils.degToRad(15)

function clampMin(v: number, min: number) {
  return v < min ? min : v
}

export function ColliderAuthoringLayer() {
  const { state, dispatch } = useColliderStore()
  const orbit = useRef<any>(null)
  const tc = useRef<any>(null)

  // disable orbit while dragging gizmo
  useEffect(() => {
    const t = tc.current
    if (!t) return
    const onDrag = (e: any) => {
      if (orbit.current) orbit.current.enabled = !e.value
    }
    t.addEventListener("dragging-changed", onDrag)
    return () => t.removeEventListener("dragging-changed", onDrag)
  }, [state.mode, state.gizmo])

  if (state.mode !== "edit") return null

  return (
    <>
      <OrbitControls ref={orbit} makeDefault enableDamping target={[-3, 1.6, -3]} />
      <SelectableBoxes />
      <Gizmo />
      <ColliderPhysics />
    </>
  )

  function ColliderPhysics() {
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

  function SelectableBoxes() {
    return (
      <>
        {state.scene.boxes.map((b) => (
          <SelectableBox key={b.id} box={b} selected={b.id === state.selectedId} />
        ))}
      </>
    )
  }

  function SelectableBox({ box, selected }: { box: ColliderBox; selected: boolean }) {
    const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
    const mat = useMemo(
      () => new THREE.MeshBasicMaterial({ transparent: true, opacity: selected ? 0.25 : 0.12, wireframe: false }),
      [selected]
    )
    const wire = useMemo(
      () => new THREE.MeshBasicMaterial({ transparent: true, opacity: selected ? 0.4 : 0.2, wireframe: true }),
      [selected]
    )

    return (
      <group
        position={box.position}
        rotation={box.rotation as any}
        scale={box.scale}
        onPointerDown={(e) => {
          e.stopPropagation()
          dispatch({ type: "select", id: box.id })
        }}
      >
        <mesh geometry={geo} material={mat} />
        <mesh geometry={geo} material={wire} />
      </group>
    )
  }

  function Gizmo() {
    const selected = state.scene.boxes.find((b) => b.id === state.selectedId) ?? null
    const proxy = useRef<THREE.Object3D>(null!)

    useEffect(() => {
      if (!selected) return
      proxy.current.position.set(...selected.position)
      proxy.current.rotation.set(selected.rotation[0], selected.rotation[1], selected.rotation[2], "XYZ")
      proxy.current.scale.set(...selected.scale)
    }, [selected?.id])

    useFrame(() => {
      if (!selected) return
      const p = proxy.current.position
      const r = proxy.current.rotation
      const s = proxy.current.scale

      let pos: Vec3 = [p.x, p.y, p.z]
      let rot: Vec3 = [r.x, r.y, r.z]
      let scl: Vec3 = [s.x, s.y, s.z]

      if (state.snapEnabled) {
        const step = state.snapStep
        pos = pos.map((v) => Math.round(v / step) * step) as Vec3
        rot = rot.map((v) => Math.round(v / DEG15) * DEG15) as Vec3
        scl = scl.map((v) => clampMin(Math.round(v / step) * step, step)) as Vec3
      }

      dispatch({ type: "setBoxTransform", id: selected.id, position: pos, rotation: rot, scale: scl })
    })

    if (!selected) return null

    return (
      <TransformControls ref={tc} mode={state.gizmo}>
        <object3D ref={proxy} />
      </TransformControls>
    )
  }
}
