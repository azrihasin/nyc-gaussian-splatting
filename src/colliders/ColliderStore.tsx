import React, { createContext, useContext, useMemo, useReducer } from "react"
import type { ColliderBox, ColliderScene, Vec3 } from "./types"
import { makeId } from "./types"

type State = {
  scene: ColliderScene
  selectedId: string | null
  mode: "play" | "edit"
  gizmo: "translate" | "rotate" | "scale"
  snapEnabled: boolean
  snapStep: number
}

type Action =
  | { type: "setMode"; mode: State["mode"] }
  | { type: "setGizmo"; gizmo: State["gizmo"] }
  | { type: "select"; id: string | null }
  | { type: "toggleSnap"; value: boolean }
  | { type: "setSnapStep"; value: number }
  | { type: "setScene"; scene: ColliderScene }
  | { type: "addBox"; box?: Partial<ColliderBox> }
  | { type: "deleteSelected" }
  | { type: "duplicateSelected" }
  | { type: "updateBox"; id: string; patch: Partial<ColliderBox> }
  | { type: "setBoxTransform"; id: string; position: Vec3; rotation: Vec3; scale: Vec3 }

const defaultScene: ColliderScene = {
  version: 1,
  boxes: [],
}

const initialState: State = {
  scene: defaultScene,
  selectedId: null,
  mode: "play",
  gizmo: "translate",
  snapEnabled: true,
  snapStep: 0.25,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setMode":
      return { ...state, mode: action.mode }
    case "setGizmo":
      return { ...state, gizmo: action.gizmo }
    case "select":
      return { ...state, selectedId: action.id }
    case "toggleSnap":
      return { ...state, snapEnabled: action.value }
    case "setSnapStep":
      return { ...state, snapStep: action.value }
    case "setScene":
      return { ...state, scene: action.scene, selectedId: null }
    case "addBox": {
      const id = makeId()
      const box: ColliderBox = {
        id,
        name: action.box?.name ?? `Box ${state.scene.boxes.length + 1}`,
        enabled: action.box?.enabled ?? true,
        position: action.box?.position ?? [0, 1, 0],
        rotation: action.box?.rotation ?? [0, 0, 0],
        scale: action.box?.scale ?? [2, 2, 2],
      }
      return {
        ...state,
        scene: { ...state.scene, boxes: [...state.scene.boxes, box] },
        selectedId: id,
      }
    }
    case "deleteSelected": {
      if (!state.selectedId) return state
      return {
        ...state,
        scene: { ...state.scene, boxes: state.scene.boxes.filter((b) => b.id !== state.selectedId) },
        selectedId: null,
      }
    }
    case "duplicateSelected": {
      const id = state.selectedId
      if (!id) return state
      const src = state.scene.boxes.find((b) => b.id === id)
      if (!src) return state
      const copyId = makeId()
      const copy: ColliderBox = {
        ...src,
        id: copyId,
        name: `${src.name} (copy)`,
        position: [src.position[0] + 0.25, src.position[1], src.position[2] + 0.25],
      }
      return {
        ...state,
        scene: { ...state.scene, boxes: [...state.scene.boxes, copy] },
        selectedId: copyId,
      }
    }
    case "updateBox": {
      const boxes = state.scene.boxes.map((b) => (b.id === action.id ? { ...b, ...action.patch } : b))
      return { ...state, scene: { ...state.scene, boxes } }
    }
    case "setBoxTransform": {
      const boxes = state.scene.boxes.map((b) =>
        b.id === action.id ? { ...b, position: action.position, rotation: action.rotation, scale: action.scale } : b
      )
      return { ...state, scene: { ...state.scene, boxes } }
    }
    default:
      return state
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function ColliderStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useColliderStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useColliderStore must be used inside ColliderStoreProvider")
  return ctx
}
