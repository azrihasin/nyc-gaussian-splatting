import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { CubeInfo } from "@/cubeObjects"

type Props = {
  cube: CubeInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CubeInfoDialog({ cube, open, onOpenChange }: Props) {
  if (!cube) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-6 p-7 pt-9">
        <div className="flex gap-6">
          <div className="flex min-h-0 shrink-0 basis-64 overflow-hidden rounded-xl border border-black/10 bg-transparent aspect-[3/4]">
            <img
              src={cube.imageUrl}
              alt={cube.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-[17px] font-semibold">{cube.name}</DialogTitle>
            </DialogHeader>
            <p className="mt-3 text-[15px] text-black/70 leading-relaxed">
              {cube.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
