import { MutableRefObject, useRef } from "react"
import { Physics } from "@react-three/rapier"
import * as THREE from "three"

import { FixedSplat } from "@/FixedSplat"
import { ColliderStoreProvider, useColliderStore } from "@/colliders/ColliderStore"
import { AuthoredColliderPhysics } from "@/colliders/AuthoredColliderPhysics"
import { Player } from "@/Player"
import { RoomBoxColliders } from "@/RoomBoxColliders"
import { ClickableSceneObjects } from "@/ClickableSceneObjects"
import { CLICKABLE_OBJECTS } from "@/clickableObjects"
import type { ClickableObject } from "@/clickableObjects"
import { CUBE_OBJECTS } from "@/cubeObjects"
import type { CubeInfo } from "@/cubeObjects"
import {
  WardrobeCube,
  SofaCube,
  ChairWithFootRestCube,
  ChairCube,
  OfficeChairCube,
  SpeakerCube,
  TelevisionCube,
  SpeakerCube2,
} from "@/CenterCubes"

export type Bounds = {
  halfX: number
  halfZ: number
  height: number
  wallThickness: number
  floorThickness: number
}

const SPLAT_TRANSFORM = {
  position: new THREE.Vector3(-0.1266854, 0, 0.84852794),
  rotation: new THREE.Euler(0, 0, 0),
  scale: new THREE.Vector3(1, 1, 1),
}

// Simplified version for Triplex viewing (no context dependencies)
export function SplatViewer({
  splatUrl = "https://huggingface.co/datasets/azrihasin/test/resolve/main/room.splat",
  bounds = {
    halfX: 5.6555,
    halfZ: 6.9878,
    height: 5.7414,
    wallThickness: 0.2,
    floorThickness: 0.2,
  }
}: {
  splatUrl?: string
  bounds?: Bounds
} = {}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />

      <group position={SPLAT_TRANSFORM.position} rotation={SPLAT_TRANSFORM.rotation} scale={SPLAT_TRANSFORM.scale}>
        <FixedSplat src={splatUrl} />
      </group>

      {/* Labeled cubes: wardrobe, sofa, chair with foot rest, chair, office chair, speaker, television, speaker */}
      <WardrobeCube cubeInfo={CUBE_OBJECTS.wardrobe} />
      <SofaCube cubeInfo={CUBE_OBJECTS.sofa} />
      <ChairWithFootRestCube cubeInfo={CUBE_OBJECTS.chairWithFootRest} />
      <ChairCube cubeInfo={CUBE_OBJECTS.chair} />
      <OfficeChairCube cubeInfo={CUBE_OBJECTS.officeChair} />
      <SpeakerCube cubeInfo={CUBE_OBJECTS.speaker} />
      <TelevisionCube cubeInfo={CUBE_OBJECTS.television} />
      <SpeakerCube2 cubeInfo={CUBE_OBJECTS.speaker2} />
    </>
  )
}

export function SplatRoomScene({
  splatUrl,
  bounds,
  onLockChange,
  controlsApiRef,
  onObjectClick,
  onCubeClick,
}: {
  splatUrl: string
  bounds: Bounds
  onLockChange: (locked: boolean) => void
  controlsApiRef: MutableRefObject<{ lock: () => void } | null>
  onObjectClick?: (object: ClickableObject) => void
  onCubeClick?: (cube: CubeInfo) => void
}) {
  const { state } = useColliderStore()

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />

      <Physics gravity={[0, -9.81, 0]}>
        {/* Invisible room boundary colliders (floor + walls) */}
        <RoomBoxColliders bounds={bounds} enabled={true} />

        {/* Your authored colliders */}
        <AuthoredColliderPhysics />

        {/* Splat */}
        <group position={SPLAT_TRANSFORM.position} rotation={SPLAT_TRANSFORM.rotation} scale={SPLAT_TRANSFORM.scale}>
          <FixedSplat src={splatUrl} />
        </group>

        {/* Labeled cubes: hidden mesh, clickable hotspots only */}
        <WardrobeCube cubeInfo={CUBE_OBJECTS.wardrobe} onCubeClick={onCubeClick} visible={false} />
        <SofaCube cubeInfo={CUBE_OBJECTS.sofa} onCubeClick={onCubeClick} visible={false} />
        <ChairWithFootRestCube cubeInfo={CUBE_OBJECTS.chairWithFootRest} onCubeClick={onCubeClick} visible={false} />
        <ChairCube cubeInfo={CUBE_OBJECTS.chair} onCubeClick={onCubeClick} visible={false} />
        <OfficeChairCube cubeInfo={CUBE_OBJECTS.officeChair} onCubeClick={onCubeClick} visible={false} />
        <SpeakerCube cubeInfo={CUBE_OBJECTS.speaker} onCubeClick={onCubeClick} visible={false} />
        <TelevisionCube cubeInfo={CUBE_OBJECTS.television} onCubeClick={onCubeClick} visible={false} />
        <SpeakerCube2 cubeInfo={CUBE_OBJECTS.speaker2} onCubeClick={onCubeClick} visible={false} />

        {/* Invisible clickable hotspots for chair, sofa, TV, image frame */}
        {onObjectClick ? (
          <ClickableSceneObjects objects={CLICKABLE_OBJECTS} onObjectClick={onObjectClick} />
        ) : null}

        {/* Player only in play mode */}
        {state.mode === "play" ? (
          <Player bounds={bounds} onLockChange={onLockChange} controlsApiRef={controlsApiRef} />
        ) : null}
      </Physics>
    </>
  )
}

const DEFAULT_BOUNDS: Bounds = {
  halfX: 5.6555,
  halfZ: 6.9878,
  height: 5.7414,
  wallThickness: 0.2,
  floorThickness: 0.2,
}

/** Standalone scene with required props and ColliderStoreProvider. Use for preview/isolation. */
export function SplatRoomSceneWithRequiredProps(props?: {
  splatUrl?: string
  bounds?: Bounds
  onLockChange?: (locked: boolean) => void
  controlsApiRef?: MutableRefObject<{ lock: () => void } | null>
  onObjectClick?: (object: ClickableObject) => void
  onCubeClick?: (cube: CubeInfo) => void
}) {
  const controlsApiRef = useRef<{ lock: () => void } | null>(null)
  return (
    <ColliderStoreProvider>
      <SplatRoomScene
        splatUrl={props?.splatUrl ?? "/room.splat"}
        bounds={props?.bounds ?? DEFAULT_BOUNDS}
        onLockChange={props?.onLockChange ?? (() => {})}
        controlsApiRef={props?.controlsApiRef ?? controlsApiRef}
        onObjectClick={props?.onObjectClick}
        onCubeClick={props?.onCubeClick}
      />
    </ColliderStoreProvider>
  )
}
