import {
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
} from "@/components/ui/responsive-dialog"
import type { CubeInfo } from "@/cubeObjects"

type Props = {
  cube: CubeInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CubeInfoDialog({ cube, open, onOpenChange }: Props) {
  if (!cube) return null

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="w-[calc(100vw-2rem)] max-w-2xl gap-4 p-4 sm:gap-6 sm:p-7 sm:pt-9 max-h-[90dvh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex min-h-0 shrink-0 w-full sm:basis-64 overflow-hidden rounded-xl border border-black/10 bg-transparent aspect-[3/4] max-h-[40vh] sm:max-h-none">
            <img
              src={cube.imageUrl}
              alt={cube.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0 sm:pt-0.5">
            <DialogHeader className="text-left">
              <DialogTitle className="text-base sm:text-[17px] font-semibold">{cube.name}</DialogTitle>
            </DialogHeader>
            <p className="mt-2 sm:mt-3 text-sm sm:text-[15px] text-black/70 leading-relaxed">
              {cube.description}
            </p>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
