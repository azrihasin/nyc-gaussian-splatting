import { useMemo, useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { KeyboardControls } from "@react-three/drei"
import type { KeyboardControlsEntry } from "@react-three/drei"

import { ColliderStoreProvider } from "@/colliders/ColliderStore"
import { SplatRoomScene, type Bounds } from "@/SplatRoomScene"
import { ObjectInfoDialog } from "@/ObjectInfoDialog"
import { CubeInfoDialog } from "@/CubeInfoDialog"
import type { ClickableObject } from "@/clickableObjects"
import type { CubeInfo } from "@/cubeObjects"

type Controls = "forward" | "backward" | "left" | "right"

/** Simulate key down/up so useKeyboardControls in Player reacts. Only show on touch/coarse pointer. */
function MobileMoveButtons() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)")
    const small = window.matchMedia("(max-width: 640px)")
    const update = () => setShow(coarse.matches || small.matches)
    update()
    coarse.addEventListener("change", update)
    small.addEventListener("change", update)
    return () => {
      coarse.removeEventListener("change", update)
      small.removeEventListener("change", update)
    }
  }, [])

  const sendKey = (code: string, down: boolean) => {
    const ev = new KeyboardEvent(down ? "keydown" : "keyup", {
      key: code === "KeyW" ? "w" : code === "KeyS" ? "s" : code === "KeyA" ? "a" : "d",
      code,
      bubbles: true,
    })
    window.dispatchEvent(ev)
  }

  if (!show) return null

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 pointer-events-none safe-area-inset flex flex-col items-center gap-2"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <button
          type="button"
          aria-label="Move forward"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black/50 text-white text-xl touch-manipulation active:bg-black/70"
          onPointerDown={() => sendKey("KeyW", true)}
          onPointerUp={() => sendKey("KeyW", false)}
          onPointerLeave={() => sendKey("KeyW", false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Move left"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black/50 text-white text-xl touch-manipulation active:bg-black/70"
            onPointerDown={() => sendKey("KeyA", true)}
            onPointerUp={() => sendKey("KeyA", false)}
            onPointerLeave={() => sendKey("KeyA", false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            ◀
          </button>
          <button
            type="button"
            aria-label="Move backward"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black/50 text-white text-xl touch-manipulation active:bg-black/70"
            onPointerDown={() => sendKey("KeyS", true)}
            onPointerUp={() => sendKey("KeyS", false)}
            onPointerLeave={() => sendKey("KeyS", false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            ▼
          </button>
          <button
            type="button"
            aria-label="Move right"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black/50 text-white text-xl touch-manipulation active:bg-black/70"
            onPointerDown={() => sendKey("KeyD", true)}
            onPointerUp={() => sendKey("KeyD", false)}
            onPointerLeave={() => sendKey("KeyD", false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  )
}

function AppInner() {
  const controlsApiRef = useRef<{ lock: () => void } | null>(null)
  const [selectedObject, setSelectedObject] = useState<ClickableObject | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCube, setSelectedCube] = useState<CubeInfo | null>(null)
  const [cubeDialogOpen, setCubeDialogOpen] = useState(false)

  const handleObjectClick = (object: ClickableObject) => {
    setSelectedObject(object)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) setSelectedObject(null)
  }

  const handleCubeClick = (cube: CubeInfo) => {
    setSelectedCube(cube)
    setCubeDialogOpen(true)
  }

  const handleCubeDialogOpenChange = (open: boolean) => {
    setCubeDialogOpen(open)
    if (!open) setSelectedCube(null)
  }

  // Bounds estimated from nycsplat2.splat (robust percentiles) and centered.
  const bounds: Bounds = useMemo(
    () => ({
      halfX: 5.6555,
      halfZ: 6.9878,
      height: 5.7414,
      wallThickness: 0.2,
      floorThickness: 0.2,
    }),
    []
  )

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: "forward", keys: ["KeyW", "ArrowUp"] },
      { name: "backward", keys: ["KeyS", "ArrowDown"] },
      { name: "left", keys: ["KeyD", "ArrowLeft"] },
      { name: "right", keys: ["KeyA", "ArrowRight"] },
    ],
    []
  )

  return (
    <div className="h-full w-full relative bg-white">
      <KeyboardControls map={map}>
        <Canvas
          camera={{
            fov: 75,
            near: 0.01,
            far: 500,
            position: [0.6, 1.6, 3],
            rotation: [0, 0, 0],
          }}
        >
          <SplatRoomScene
            splatUrl="/room.splat"
            bounds={bounds}
            onLockChange={() => {}}
            controlsApiRef={controlsApiRef}
            onObjectClick={handleObjectClick}
            onCubeClick={handleCubeClick}
          />
        </Canvas>
      </KeyboardControls>

      {/* Object info dialog (opens when user clicks chair, sofa, TV, image frame in scene) */}
      <ObjectInfoDialog
        object={selectedObject}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
      />

      {/* Cube info dialog (opens when user clicks orange cubes: wardrobe, sofa, chair, etc.) */}
      <CubeInfoDialog
        cube={selectedCube}
        open={cubeDialogOpen}
        onOpenChange={handleCubeDialogOpenChange}
      />

      {/* UI overlay — responsive for mobile */}
      <div className="absolute left-0 top-0 w-full p-3 sm:p-4 pointer-events-none safe-area-inset">
        <div className="flex justify-end">
          <div className="pointer-events-auto text-[11px] sm:text-xs bg-black/50 text-white rounded-lg px-3 py-2 sm:px-3 sm:py-2 space-y-1 sm:space-y-2 max-w-[calc(100vw-1.5rem)]">
            <div className="hidden sm:block">Click + drag to look • WASD move</div>
            <div className="sm:hidden">Touch + drag to look • Use buttons below to move</div>
            <div className="hidden sm:block">Click objects in the scene (chair, sofa, TV, picture frame) for details</div>
            <div className="sm:hidden">Tap objects in the scene for details</div>
          </div>
        </div>
      </div>

      {/* Mobile movement buttons — only on touch devices */}
      <MobileMoveButtons />
    </div>
  )
}

export default function App() {
  return (
    <ColliderStoreProvider>
      <AppInner />
    </ColliderStoreProvider>
  )
}
