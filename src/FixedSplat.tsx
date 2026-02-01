import * as React from "react"
import * as THREE from "three"
import { extend, useFrame, useLoader, useThree } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import type { JSX } from "react"

/**
 * Fixed version of drei's <Splat /> that does NOT rely on HTTP Content-Length.
 *
 * In many deployments (CDN/gzip/chunked transfer), Content-Length can be missing or refer
 * to encoded bytes, while the Fetch stream yields decoded bytes. drei's streaming loader
 * uses Content-Length to pre-allocate buffers; when it's wrong, you get:
 * - RangeError: offset is out of bounds (worker Float32Array.set overflow)
 * - WebGL texSubImage2D ArrayBufferView not big enough
 *
 * This loader fetches the full ArrayBuffer first and sizes everything from buffer.byteLength.
 * It also avoids manual texSubImage2D sub-updates and instead flags DataTextures for upload.
 */

const threeVersion = parseInt(THREE.REVISION.replace(/\D+/g, ""), 10)

const SplatMaterial = shaderMaterial(
  {
    alphaTest: 0,
    viewport: new THREE.Vector2(1980, 1080),
    focal: 1000.0,
    centerAndScaleTexture: null as THREE.DataTexture | null,
    covAndColorTexture: null as THREE.DataTexture | null,
  },
  /*glsl*/ `
    precision highp sampler2D;
    precision highp usampler2D;
    out vec4 vColor;
    out vec3 vPosition;
    uniform vec2 resolution;
    uniform vec2 viewport;
    uniform float focal;
    attribute uint splatIndex;
    uniform sampler2D centerAndScaleTexture;
    uniform usampler2D covAndColorTexture;

    vec2 unpackInt16(in uint value) {
      int v = int(value);
      int v0 = v >> 16;
      int v1 = (v & 0xFFFF);
      if((v & 0x8000) != 0)
        v1 |= 0xFFFF0000;
      return vec2(float(v1), float(v0));
    }

    void main () {
      ivec2 texSize = textureSize(centerAndScaleTexture, 0);
      ivec2 texPos = ivec2(splatIndex%uint(texSize.x), splatIndex/uint(texSize.x));
      vec4 centerAndScaleData = texelFetch(centerAndScaleTexture, texPos, 0);
      vec4 center = vec4(centerAndScaleData.xyz, 1);
      vec4 camspace = modelViewMatrix * center;
      vec4 pos2d = projectionMatrix * camspace;

      float bounds = 1.2 * pos2d.w;
      if (pos2d.z < -pos2d.w || pos2d.x < -bounds || pos2d.x > bounds
        || pos2d.y < -bounds || pos2d.y > bounds) {
        gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
        return;
      }

      uvec4 covAndColorData = texelFetch(covAndColorTexture, texPos, 0);
      vec2 cov3D_M11_M12 = unpackInt16(covAndColorData.x) * centerAndScaleData.w;
      vec2 cov3D_M13_M22 = unpackInt16(covAndColorData.y) * centerAndScaleData.w;
      vec2 cov3D_M23_M33 = unpackInt16(covAndColorData.z) * centerAndScaleData.w;
      mat3 Vrk = mat3(
        cov3D_M11_M12.x, cov3D_M11_M12.y, cov3D_M13_M22.x,
        cov3D_M11_M12.y, cov3D_M13_M22.y, cov3D_M23_M33.x,
        cov3D_M13_M22.x, cov3D_M23_M33.x, cov3D_M23_M33.y
      );

      mat3 J = mat3(
        focal / camspace.z, 0., -(focal * camspace.x) / (camspace.z * camspace.z),
        0., focal / camspace.z, -(focal * camspace.y) / (camspace.z * camspace.z),
        0., 0., 0.
      );

      mat3 W = transpose(mat3(modelViewMatrix));
      mat3 T = W * J;
      mat3 cov = transpose(T) * Vrk * T;
      vec2 vCenter = vec2(pos2d) / pos2d.w;
      float diagonal1 = cov[0][0] + 0.3;
      float offDiagonal = cov[0][1];
      float diagonal2 = cov[1][1] + 0.3;
      float mid = 0.5 * (diagonal1 + diagonal2);
      float radius = length(vec2((diagonal1 - diagonal2) / 2.0, offDiagonal));
      float lambda1 = mid + radius;
      float lambda2 = max(mid - radius, 0.1);
      vec2 diagonalVector = normalize(vec2(offDiagonal, lambda1 - diagonal1));
      vec2 v1 = min(sqrt(2.0 * lambda1), 1024.0) * diagonalVector;
      vec2 v2 = min(sqrt(2.0 * lambda2), 1024.0) * vec2(diagonalVector.y, -diagonalVector.x);
      uint colorUint = covAndColorData.w;
      vColor = vec4(
        float(colorUint & uint(0xFF)) / 255.0,
        float((colorUint >> uint(8)) & uint(0xFF)) / 255.0,
        float((colorUint >> uint(16)) & uint(0xFF)) / 255.0,
        float(colorUint >> uint(24)) / 255.0
      );
      vPosition = position;

      gl_Position = vec4(
        vCenter
          + position.x * v2 / viewport * 2.0
          + position.y * v1 / viewport * 2.0, pos2d.z / pos2d.w, 1.0);
    }
    `,
  /*glsl*/ `
    #include <alphatest_pars_fragment>
    #include <alphahash_pars_fragment>
    in vec4 vColor;
    in vec3 vPosition;
    void main () {
      float A = -dot(vPosition.xy, vPosition.xy);
      if (A < -4.0) discard;
      float B = exp(A) * vColor.a;
      vec4 diffuseColor = vec4(vColor.rgb, B);
      #include <alphatest_fragment>
      #include <alphahash_fragment>
      gl_FragColor = diffuseColor;
      #include <tonemapping_fragment>
      #include <${threeVersion >= 154 ? "colorspace_fragment" : "encodings_fragment"}>
    }
  `
)

type SplatMaterialType = {
  alphaTest?: number
  alphaHash?: boolean
  centerAndScaleTexture?: THREE.DataTexture
  covAndColorTexture?: THREE.DataTexture
  viewport?: THREE.Vector2
  focal?: number
}

type TargetMesh = THREE.Mesh<THREE.InstancedBufferGeometry, THREE.ShaderMaterial & SplatMaterialType> & {
  ready: boolean
  sorted: boolean
  pm: THREE.Matrix4
  vm1: THREE.Matrix4
  vm2: THREE.Matrix4
  viewport: THREE.Vector4
}

type SharedState = {
  url: string
  gl: THREE.WebGLRenderer
  worker: Worker
  manager: THREE.LoadingManager
  loading: boolean
  loaded: boolean
  loadedVertexCount: number
  chunkSize: number
  rowLength: number
  maxVertexes: number
  totalDownloadBytes: number
  numVertices: number
  bufferTextureWidth: number
  bufferTextureHeight: number
  centerAndScaleData: Float32Array
  covAndColorData: Uint32Array
  covAndColorTexture: THREE.DataTexture
  centerAndScaleTexture: THREE.DataTexture
  onProgress?: (event: ProgressEvent) => void
  fileBuffer: ArrayBuffer | null
  connect(target: TargetMesh): () => void
  update(target: TargetMesh, camera: THREE.Camera, hashed: boolean): void
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      splatMaterial: SplatMaterialType & JSX.IntrinsicElements["shaderMaterial"]
    }
  }
}

function createWorker(self: Worker) {
  let matrices: Float32Array | null = null
  let offset = 0

  function sortSplats(view: Float32Array, hashed = false) {
    if (!matrices) return new Uint32Array(0)
    const vertexCount = matrices.length / 16
    const threshold = -0.0001
    let maxDepth = -Infinity
    let minDepth = Infinity
    const depthList = new Float32Array(vertexCount)
    const sizeList = new Int32Array(depthList.buffer)
    const validIndexList = new Int32Array(vertexCount)
    let validCount = 0

    for (let i = 0; i < vertexCount; i++) {
      // Sign of depth is reversed
      const depth =
        view[0] * matrices[i * 16 + 12] +
        view[1] * matrices[i * 16 + 13] +
        view[2] * matrices[i * 16 + 14] +
        view[3]
      // Skip behind of camera and small, transparent splat
      if (hashed || (depth < 0 && matrices[i * 16 + 15] > threshold * depth)) {
        depthList[validCount] = depth
        validIndexList[validCount] = i
        validCount++
        if (depth > maxDepth) maxDepth = depth
        if (depth < minDepth) minDepth = depth
      }
    }

    // 16-bit single-pass counting sort
    const depthInv = (256 * 256 - 1) / (maxDepth - minDepth)
    const counts0 = new Uint32Array(256 * 256)
    for (let i = 0; i < validCount; i++) {
      sizeList[i] = ((depthList[i] - minDepth) * depthInv) | 0
      counts0[sizeList[i]]++
    }
    const starts0 = new Uint32Array(256 * 256)
    for (let i = 1; i < 256 * 256; i++) starts0[i] = starts0[i - 1] + counts0[i - 1]
    const depthIndex = new Uint32Array(validCount)
    for (let i = 0; i < validCount; i++) depthIndex[starts0[sizeList[i]]++] = validIndexList[i]
    return depthIndex
  }

  self.onmessage = (e: MessageEvent) => {
    const data = e.data as any
    if (data.method === "push") {
      if (offset === 0) matrices = new Float32Array(data.length)
      const new_matrices = new Float32Array(data.matrices)

      // Guard against bad lengths (the original drei code can overflow here)
      if (matrices && offset + new_matrices.length > matrices.length) {
        const clamped = new_matrices.subarray(0, Math.max(0, matrices.length - offset))
        if (clamped.length > 0) matrices.set(clamped, offset)
      } else {
        matrices?.set(new_matrices, offset)
      }

      offset += new_matrices.length
    } else if (data.method === "sort") {
      if (matrices) {
        const indices = sortSplats(new Float32Array(data.view), data.hashed)
        ;(self as any).postMessage(
          {
            indices,
            key: data.key,
          },
          [indices.buffer]
        )
      }
    }
  }
}

class FixedSplatLoader extends THREE.Loader {
  gl: THREE.WebGLRenderer | null = null
  chunkSize = 25000

  load(url: string, onLoad: (shared: SharedState) => void, onProgress?: (e: ProgressEvent) => void, onError?: (e: unknown) => void) {
    const shared: SharedState = {
      gl: this.gl!,
      url: this.manager.resolveURL(url),
      worker: new Worker(URL.createObjectURL(new Blob(["(", createWorker.toString(), ")(self)"], { type: "application/javascript" }))),
      manager: this.manager,
      loading: false,
      loaded: false,
      loadedVertexCount: 0,
      chunkSize: this.chunkSize,
      totalDownloadBytes: 0,
      numVertices: 0,
      rowLength: 3 * 4 + 3 * 4 + 4 + 4, // 32
      maxVertexes: 0,
      bufferTextureWidth: 0,
      bufferTextureHeight: 0,
      centerAndScaleData: new Float32Array(0),
      covAndColorData: new Uint32Array(0),
      covAndColorTexture: new THREE.DataTexture(),
      centerAndScaleTexture: new THREE.DataTexture(),
      onProgress,
      fileBuffer: null,
      update: (target, camera, hashed) => update(camera, shared, target, hashed),
      connect: (target) => connect(shared, target),
    }

    loadAll(shared)
      .then(onLoad)
      .catch((e) => {
        onError?.(e)
        shared.manager.itemError(shared.url)
      })
  }
}

async function loadAll(shared: SharedState) {
  shared.manager.itemStart(shared.url)

  const res = await fetch(shared.url)
  if (!res.ok) throw new Error(`Failed to fetch splat: ${res.status} ${res.statusText}`)

  const buffer = await res.arrayBuffer()
  shared.fileBuffer = buffer
  shared.totalDownloadBytes = buffer.byteLength
  shared.numVertices = Math.floor(shared.totalDownloadBytes / shared.rowLength)

  const maxTextureSize = shared.gl.getContext().getParameter(shared.gl.getContext().MAX_TEXTURE_SIZE)
  shared.maxVertexes = maxTextureSize * maxTextureSize
  if (shared.numVertices > shared.maxVertexes) shared.numVertices = shared.maxVertexes

  shared.bufferTextureWidth = maxTextureSize
  shared.bufferTextureHeight = Math.floor((shared.numVertices - 1) / maxTextureSize) + 1

  shared.centerAndScaleData = new Float32Array(shared.bufferTextureWidth * shared.bufferTextureHeight * 4)
  shared.covAndColorData = new Uint32Array(shared.bufferTextureWidth * shared.bufferTextureHeight * 4)

  shared.centerAndScaleTexture = new THREE.DataTexture(
    shared.centerAndScaleData,
    shared.bufferTextureWidth,
    shared.bufferTextureHeight,
    THREE.RGBAFormat,
    THREE.FloatType
  )
  shared.centerAndScaleTexture.needsUpdate = true

  shared.covAndColorTexture = new THREE.DataTexture(
    shared.covAndColorData,
    shared.bufferTextureWidth,
    shared.bufferTextureHeight,
    THREE.RGBAIntegerFormat,
    THREE.UnsignedIntType
  )
  ;(shared.covAndColorTexture as any).internalFormat = "RGBA32UI"
  shared.covAndColorTexture.needsUpdate = true

  return shared
}

function update(camera: THREE.Camera, shared: SharedState, target: TargetMesh, hashed: boolean) {
  camera.updateMatrixWorld()
  shared.gl.getCurrentViewport(target.viewport)
  target.material.viewport!.x = target.viewport.z
  target.material.viewport!.y = target.viewport.w
  target.material.focal = (target.viewport.w / 2.0) * Math.abs((camera as any).projectionMatrix.elements[5])

  if (target.ready) {
    if (hashed && target.sorted) return
    target.ready = false
    const view = new Float32Array([
      target.modelViewMatrix.elements[2],
      -target.modelViewMatrix.elements[6],
      target.modelViewMatrix.elements[10],
      target.modelViewMatrix.elements[14],
    ])
    shared.worker.postMessage({ method: "sort", src: shared.url, key: target.uuid, view: view.buffer, hashed }, [view.buffer])
    if (hashed && shared.loaded) target.sorted = true
  }
}

function connect(shared: SharedState, target: TargetMesh) {
  // Kick off processing exactly once (when we have a target to render)
  if (!shared.loading) {
    shared.loading = true
    processWholeFile(shared).catch((e) => console.error(e))
  }

  target.ready = false
  target.pm = new THREE.Matrix4()
  target.vm1 = new THREE.Matrix4()
  target.vm2 = new THREE.Matrix4()
  target.viewport = new THREE.Vector4()

  const splatIndexArray = new Uint32Array(shared.bufferTextureWidth * shared.bufferTextureHeight)
  const splatIndexes = new THREE.InstancedBufferAttribute(splatIndexArray, 1, false)
  splatIndexes.setUsage(THREE.DynamicDrawUsage)

  const geometry = (target.geometry = new THREE.InstancedBufferGeometry())
  const positionsArray = new Float32Array(6 * 3)
  const positions = new THREE.BufferAttribute(positionsArray, 3)
  geometry.setAttribute("position", positions)
  positions.setXYZ(2, -2.0, 2.0, 0.0)
  positions.setXYZ(1, 2.0, 2.0, 0.0)
  positions.setXYZ(0, -2.0, -2.0, 0.0)
  positions.setXYZ(5, -2.0, -2.0, 0.0)
  positions.setXYZ(4, 2.0, 2.0, 0.0)
  positions.setXYZ(3, 2.0, -2.0, 0.0)
  positions.needsUpdate = true
  geometry.setAttribute("splatIndex", splatIndexes)
  geometry.instanceCount = 1

  function listener(e: MessageEvent) {
    const data = e.data as any
    if (target && data.key === target.uuid) {
      const indexes = new Uint32Array(data.indices)
      ;(geometry.attributes.splatIndex as THREE.InstancedBufferAttribute).set(indexes)
      geometry.attributes.splatIndex.needsUpdate = true
      geometry.instanceCount = indexes.length
      target.ready = true
    }
  }
  shared.worker.addEventListener("message", listener)

  async function wait() {
    while (true) {
      const centerProps = shared.gl.properties.get(shared.centerAndScaleTexture) as any
      const covProps = shared.gl.properties.get(shared.covAndColorTexture) as any
      if (centerProps?.__webglTexture && covProps?.__webglTexture && shared.loadedVertexCount > 0) break
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
    target.ready = true
  }
  wait()

  return () => shared.worker.removeEventListener("message", listener)
}

async function processWholeFile(shared: SharedState) {
  if (!shared.fileBuffer) return

  // Truncate to full rows and to maxVertexes
  const usableBytes = shared.numVertices * shared.rowLength
  const sliced = shared.fileBuffer.slice(0, usableBytes)

  const matrices = pushDataBufferNoSubUpdates(shared, sliced, shared.numVertices)
  shared.worker.postMessage(
    {
      method: "push",
      src: shared.url,
      length: shared.numVertices * 16,
      matrices: matrices.buffer,
    },
    [matrices.buffer]
  )

  shared.loaded = true
  shared.manager.itemEnd(shared.url)
}

function pushDataBufferNoSubUpdates(shared: SharedState, buffer: ArrayBuffer, vertexCount: number) {
  if (shared.loadedVertexCount + vertexCount > shared.maxVertexes) vertexCount = shared.maxVertexes - shared.loadedVertexCount
  if (vertexCount <= 0) throw new Error("Failed to parse file")

  const u_buffer = new Uint8Array(buffer)
  const f_buffer = new Float32Array(buffer)
  const matrices = new Float32Array(vertexCount * 16)
  const covAndColorData_uint8 = new Uint8Array(shared.covAndColorData.buffer)
  const covAndColorData_int16 = new Int16Array(shared.covAndColorData.buffer)

  for (let i = 0; i < vertexCount; i++) {
    const quat = new THREE.Quaternion(
      -((u_buffer[32 * i + 28 + 1] - 128) / 128.0),
      (u_buffer[32 * i + 28 + 2] - 128) / 128.0,
      (u_buffer[32 * i + 28 + 3] - 128) / 128.0,
      -((u_buffer[32 * i + 28 + 0] - 128) / 128.0)
    )
    quat.invert()

    const center = new THREE.Vector3(f_buffer[8 * i + 0], f_buffer[8 * i + 1], -f_buffer[8 * i + 2])
    const scale = new THREE.Vector3(f_buffer[8 * i + 3 + 0], f_buffer[8 * i + 3 + 1], f_buffer[8 * i + 3 + 2])

    const mtx = new THREE.Matrix4()
    mtx.makeRotationFromQuaternion(quat)
    mtx.transpose()
    mtx.scale(scale)
    const mtx_t = mtx.clone()
    mtx.transpose()
    mtx.premultiply(mtx_t)
    mtx.setPosition(center)

    const cov_indexes = [0, 1, 2, 5, 6, 10]
    let max_value = 0.0
    for (let j = 0; j < cov_indexes.length; j++) if (Math.abs(mtx.elements[cov_indexes[j]]) > max_value) max_value = Math.abs(mtx.elements[cov_indexes[j]])

    let destOffset = shared.loadedVertexCount * 4 + i * 4
    shared.centerAndScaleData[destOffset + 0] = center.x
    shared.centerAndScaleData[destOffset + 1] = -center.y
    shared.centerAndScaleData[destOffset + 2] = center.z
    shared.centerAndScaleData[destOffset + 3] = max_value / 32767.0

    destOffset = shared.loadedVertexCount * 8 + i * 4 * 2
    for (let j = 0; j < cov_indexes.length; j++) covAndColorData_int16[destOffset + j] = (mtx.elements[cov_indexes[j]] * 32767.0) / max_value

    // RGBA
    destOffset = shared.loadedVertexCount * 16 + (i * 4 + 3) * 4
    const col = new THREE.Color(u_buffer[32 * i + 24 + 0] / 255, u_buffer[32 * i + 24 + 1] / 255, u_buffer[32 * i + 24 + 2] / 255)
    col.convertSRGBToLinear()
    covAndColorData_uint8[destOffset + 0] = col.r * 255
    covAndColorData_uint8[destOffset + 1] = col.g * 255
    covAndColorData_uint8[destOffset + 2] = col.b * 255
    covAndColorData_uint8[destOffset + 3] = u_buffer[32 * i + 24 + 3]

    // Store scale and transparent to remove splat in sorting process
    mtx.elements[15] = Math.max(scale.x, scale.y, scale.z) * (u_buffer[32 * i + 24 + 3] / 255.0)
    for (let j = 0; j < 16; j++) matrices[i * 16 + j] = mtx.elements[j]
  }

  shared.loadedVertexCount += vertexCount
  shared.centerAndScaleTexture.needsUpdate = true
  shared.covAndColorTexture.needsUpdate = true

  return matrices
}

type FixedSplatProps = {
  src: string
  toneMapped?: boolean
  alphaTest?: number
  alphaHash?: boolean
  chunkSize?: number
} & JSX.IntrinsicElements["mesh"]

export function FixedSplat({ src, toneMapped = false, alphaTest = 0, alphaHash = false, chunkSize = 25000, ...props }: FixedSplatProps) {
  extend({ SplatMaterial })
  const ref = React.useRef<TargetMesh | null>(null)
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)

  const shared = useLoader(FixedSplatLoader as any, src, (loader: FixedSplatLoader) => {
    loader.gl = gl as any
    loader.chunkSize = chunkSize
  }) as SharedState

  React.useLayoutEffect(() => shared.connect(ref.current as TargetMesh), [src])
  useFrame(() => shared.update(ref.current as TargetMesh, camera, alphaHash))

  return (
    <mesh ref={ref as any} frustumCulled={false} {...props}>
      {/* @ts-ignore */}
      <splatMaterial
        key={`${src}/${alphaTest}/${alphaHash}${(SplatMaterial as any).key}`}
        transparent={!alphaHash}
        depthTest={true}
        alphaTest={alphaHash ? 0 : alphaTest}
        centerAndScaleTexture={shared.centerAndScaleTexture}
        covAndColorTexture={shared.covAndColorTexture}
        depthWrite={alphaHash ? true : alphaTest > 0}
        blending={alphaHash ? THREE.NormalBlending : THREE.CustomBlending}
        blendSrcAlpha={THREE.OneFactor}
        alphaHash={!!alphaHash}
        toneMapped={toneMapped}
      />
    </mesh>
  )
}

