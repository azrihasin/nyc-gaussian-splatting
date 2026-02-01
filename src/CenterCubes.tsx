import { CUBE_OBJECTS } from "@/cubeObjects"
import type { CubeInfo } from "@/cubeObjects"

type CubeProps = {
  onCubeClick?: (info: CubeInfo) => void
  cubeInfo?: CubeInfo
  /** When false, mesh is not drawn but remains clickable (raycast still hits it). Default true. */
  visible?: boolean
}

function cubeClickProps(props: CubeProps, defaultCubeInfo: CubeInfo) {
  const { onCubeClick, cubeInfo = defaultCubeInfo } = props
  return {
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onCubeClick?.(cubeInfo)
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      document.body.style.cursor = "pointer"
    },
    onPointerOut: () => {
      document.body.style.cursor = "default"
    },
  }
}

function cubeMaterial(visible: boolean) {
  if (visible) {
    return <meshStandardMaterial color="#ff9944" emissive="#ff6600" emissiveIntensity={0.5} />
  }
  return (
    <meshBasicMaterial color="black" transparent opacity={0} depthWrite={false} />
  )
}

/** Cube 1 – wardrobe */
export function WardrobeCube(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh
      position={[-4.5, 1.37, -2.04]}
      scale={[0.46, 1.18, 1.07]}
      {...cubeClickProps(props, CUBE_OBJECTS.wardrobe)}
    >
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

/** Cube 2 – sofa */
export function SofaCube(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh position={[2.81, 0.8, 3.98]} scale={[3.32, 1.59, 1.66]} {...cubeClickProps(props, CUBE_OBJECTS.sofa)}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

/** Cube 3 – chair with foot rest */
export function ChairWithFootRestCube(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh
      position={[-1.62, 0.8, 3.99]}
      rotation={[0, -0.33161255787892263, 0]}
      scale={[1.1, 1, 2.48]}
      {...cubeClickProps(props, CUBE_OBJECTS.chairWithFootRest)}
    >
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

/** Cube 4 – chair */
export function ChairCube(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh
      position={[-3.78, 0.8, 0.8]}
      rotation={[0, 0.349065850398866, 0]}
      scale={[1, 1.76, 1]}
      {...cubeClickProps(props, CUBE_OBJECTS.chair)}
    >
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

/** Cube 5 – office chair */
export function OfficeChairCube(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh
      position={[-2.94, 0.8, -2.7]}
      scale={[0.69, 1.71, 0.67]}
      rotation={[0, 0.5061454830783556, 0]}
      {...cubeClickProps(props, CUBE_OBJECTS.officeChair)}
    >
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

/** Cube 6 – speaker */
export function SpeakerCube(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh position={[-0.95, 0.8, -3.15]} scale={[0.39, 2.01, 0.33]} {...cubeClickProps(props, CUBE_OBJECTS.speaker)}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

/** Cube 7 – television */
export function TelevisionCube(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh position={[1.98, 1.67, -3.71]} scale={[2.17, 1.4, 0.28]} {...cubeClickProps(props, CUBE_OBJECTS.television)}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

/** Cube 8 – speaker */
export function SpeakerCube2(props: CubeProps) {
  const visible = props.visible !== false
  return (
    <mesh position={[3.85, 0.8, -3]} scale={[0.39, 1.94, 0.22]} {...cubeClickProps(props, CUBE_OBJECTS.speaker2)}>
      <boxGeometry args={[1.6, 1.6, 1.6]} />
      {cubeMaterial(visible)}
    </mesh>
  )
}

// Backward-compatible aliases (e.g. for Triplex editor)
export { WardrobeCube as CenterCube1 }
export { SofaCube as CenterCube2 }
export { ChairWithFootRestCube as CenterCube3 }
export { ChairCube as CenterCube4 }
export { OfficeChairCube as CenterCube5 }
export { SpeakerCube as CenterCube6 }
export { TelevisionCube as CenterCube7 }
export { SpeakerCube2 as CenterCube8 }
