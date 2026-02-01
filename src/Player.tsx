import { MutableRefObject, useEffect, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { CuboidCollider, RigidBody } from "@react-three/rapier"
import * as THREE from "three"
import { WALL_INSET } from "@/RoomBoxColliders"
import type { Bounds } from "./SplatRoomScene"

type Controls = "forward" | "backward" | "left" | "right"

const SENSITIVITY = 0.002
const PITCH_MIN = -Math.PI / 2 + 0.01
const PITCH_MAX = Math.PI / 2 - 0.01

export function Player({
  bounds,
  onLockChange,
  controlsApiRef,
}: {
  bounds: Bounds
  onLockChange: (locked: boolean) => void
  controlsApiRef: MutableRefObject<{ lock: () => void } | null>
}) {
  const rb = useRef<any>(null)
  const isDragging = useRef(false)
  const prevPointer = useRef({ x: 0, y: 0 })
  // Slight right by default: small negative Y = yaw right
  const INITIAL_YAW = -0.28
  const euler = useRef(new THREE.Euler(0, INITIAL_YAW, 0, "YXZ"))

  const { camera, gl } = useThree()

  useEffect(() => {
    camera.quaternion.setFromEuler(euler.current)
  }, [camera])
  const [, get] = useKeyboardControls<Controls>()

  const eyeHeight = 1.6
  const radius = 0.35
  const halfHeight = 0.45
  const maxSpeed = 2.2

  useEffect(() => {
    controlsApiRef.current = { lock: () => {} }
    return () => {
      controlsApiRef.current = null
    }
  }, [controlsApiRef])

  useEffect(() => {
    const dom = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      isDragging.current = true
      prevPointer.current = { x: e.clientX, y: e.clientY }
      euler.current.setFromQuaternion(camera.quaternion)
      dom.setPointerCapture(e.pointerId)
      onLockChange(true)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const dx = (e.clientX - prevPointer.current.x) * SENSITIVITY
      const dy = (e.clientY - prevPointer.current.y) * SENSITIVITY
      prevPointer.current = { x: e.clientX, y: e.clientY }
      euler.current.y -= dx
      euler.current.x -= dy
      euler.current.x = Math.max(PITCH_MIN, Math.min(PITCH_MAX, euler.current.x))
      camera.quaternion.setFromEuler(euler.current)
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return
      isDragging.current = false
      dom.releasePointerCapture(e.pointerId)
      onLockChange(false)
    }

    const onPointerLeave = () => {
      if (isDragging.current) {
        isDragging.current = false
        onLockChange(false)
      }
    }

    dom.addEventListener("pointerdown", onPointerDown)
    dom.addEventListener("pointermove", onPointerMove)
    dom.addEventListener("pointerup", onPointerUp)
    dom.addEventListener("pointerleave", onPointerLeave)

    return () => {
      dom.removeEventListener("pointerdown", onPointerDown)
      dom.removeEventListener("pointermove", onPointerMove)
      dom.removeEventListener("pointerup", onPointerUp)
      dom.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [camera, gl, onLockChange])

  useEffect(() => {
    rb.current?.setTranslation({ x: 0.6, y: 1.0, z: 3 }, true)
  }, [])

  useFrame(() => {
    const body = rb.current
    if (!body) return

    const t = body.translation()
    camera.position.set(t.x, t.y + eyeHeight, t.z)

    const { forward, backward, left, right } = get()

    // camera forward (ignore pitch)
    const forwardDir = new THREE.Vector3()
    camera.getWorldDirection(forwardDir)
    forwardDir.y = 0
    forwardDir.normalize()

    const rightDir = new THREE.Vector3().crossVectors(forwardDir, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(-1)

    const move = new THREE.Vector3()
    if (forward) move.add(forwardDir)
    if (backward) move.sub(forwardDir)
    if (right) move.add(rightDir)
    if (left) move.sub(rightDir)

    if (move.lengthSq() > 0) move.normalize().multiplyScalar(maxSpeed)

    const v = body.linvel()
    body.setLinvel({ x: move.x, y: v.y, z: move.z }, true)

    // clamp fallback (match room walls inset)
    const margin = 0.35
    const maxX = bounds.halfX - WALL_INSET - margin
    const maxZ = bounds.halfZ - WALL_INSET - margin
    const x = THREE.MathUtils.clamp(t.x, -maxX, maxX)
    const z = THREE.MathUtils.clamp(t.z, -maxZ, maxZ)
    const y = Math.max(t.y, 0)
    if (x !== t.x || z !== t.z || y !== t.y) {
      body.setTranslation({ x, y, z }, true)
    }
  })

  return (
    <>
      <RigidBody
        ref={rb}
        colliders={false}
        mass={1}
        friction={0.0}
        linearDamping={2.0}
        angularDamping={999}
        enabledRotations={[false, false, false]}
        position={[0.6, 1, 3]}
      >
        <CuboidCollider args={[radius, halfHeight + radius, radius]} />
      </RigidBody>
    </>
  )
}
