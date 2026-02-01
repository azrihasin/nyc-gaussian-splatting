import { useMemo, useState } from "react"
import { useColliderStore } from "./ColliderStore"
import { saveToLocal, loadFromLocal } from "./storage"
import type { ColliderScene } from "./types"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export function ColliderEditorPanel() {
  const { state, dispatch } = useColliderStore()
  const selected = useMemo(
    () => state.scene.boxes.find((b) => b.id === state.selectedId) ?? null,
    [state.scene.boxes, state.selectedId]
  )
  const [io, setIo] = useState("")

  const isEdit = state.mode === "edit"

  return (
    <Card className="pointer-events-auto w-[380px]">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Collider Editor</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-black/60">{isEdit ? "EDIT" : "PLAY"}</div>
            <Switch
              checked={isEdit}
              onCheckedChange={(v) => dispatch({ type: "setMode", mode: v ? "edit" : "play" })}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={state.gizmo === "translate" ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch({ type: "setGizmo", gizmo: "translate" })}
          >
            Move
          </Button>
          <Button
            variant={state.gizmo === "rotate" ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch({ type: "setGizmo", gizmo: "rotate" })}
          >
            Rotate
          </Button>
          <Button
            variant={state.gizmo === "scale" ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch({ type: "setGizmo", gizmo: "scale" })}
          >
            Scale
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs">Snap</div>
          <Switch
            checked={state.snapEnabled}
            onCheckedChange={(v) => dispatch({ type: "toggleSnap", value: v })}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs w-24 text-black/60">Snap step</div>
          <input
            className="w-full h-8 rounded-md border border-black/20 px-2 text-sm bg-white"
            type="number"
            min={0.01}
            step={0.05}
            value={state.snapStep}
            onChange={(e) => dispatch({ type: "setSnapStep", value: Number(e.target.value) })}
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={() => dispatch({ type: "addBox" })}>
            Add Box
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => dispatch({ type: "duplicateSelected" })}
            disabled={!selected}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => dispatch({ type: "deleteSelected" })}
            disabled={!selected}
          >
            Delete
          </Button>
        </div>

        <div className="border border-black/10 rounded-md p-2 space-y-2">
          <div className="text-xs text-black/60">Selected</div>
          {selected ? (
            <>
              <input
                className="w-full h-8 rounded-md border border-black/20 px-2 text-sm bg-white"
                value={selected.name}
                onChange={(e) =>
                  dispatch({ type: "updateBox", id: selected.id, patch: { name: e.target.value } })
                }
              />
              <div className="flex items-center justify-between">
                <div className="text-xs">Enabled</div>
                <Switch
                  checked={selected.enabled}
                  onCheckedChange={(v) =>
                    dispatch({ type: "updateBox", id: selected.id, patch: { enabled: v } })
                  }
                />
              </div>
              <div className="text-xs text-black/60">
                Click a box in the scene, then use gizmo to adjust.
              </div>
            </>
          ) : (
            <div className="text-xs text-black/60">Click a collider box in the scene.</div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => saveToLocal(state.scene)}>
            Save Local
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const loaded = loadFromLocal()
              if (loaded) dispatch({ type: "setScene", scene: loaded })
            }}
          >
            Load Local
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIo(JSON.stringify(state.scene, null, 2))}>
            Export JSON
          </Button>
        </div>

        <textarea
          className="w-full h-40 rounded-md border border-black/20 p-2 text-xs font-mono bg-white"
          value={io}
          onChange={(e) => setIo(e.target.value)}
          placeholder="Export JSON will appear here. Paste JSON here to import."
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => {
              try {
                const parsed = JSON.parse(io) as ColliderScene
                if (parsed?.version === 1 && Array.isArray(parsed.boxes)) {
                  dispatch({ type: "setScene", scene: parsed })
                }
              } catch {
                // ignore
              }
            }}
          >
            Import JSON
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => download("colliders.json", JSON.stringify(state.scene, null, 2))}
          >
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function download(filename: string, text: string) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }))
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
