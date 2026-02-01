import { useMemo, useRef, useState } from "react"
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

      {/* UI overlay */}
      <div className="absolute left-0 top-0 w-full p-4 pointer-events-none">
        <div className="flex justify-end">
          <div className="pointer-events-auto text-xs bg-black/40 text-white rounded-lg px-3 py-2 space-y-2">
            <div>Click + drag to look • WASD move</div>
            <div>Click objects in the scene (chair, sofa, TV, picture frame) for details</div>
          </div>
        </div>
      </div>
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
