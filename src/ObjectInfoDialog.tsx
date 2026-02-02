import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
} from "@/components/ui/responsive-dialog"
import type { ClickableObject } from "@/clickableObjects"

type Props = {
  object: ClickableObject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ObjectInfoDialog({ object, open, onOpenChange }: Props) {
  if (!object) return null

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="w-[calc(100vw-2rem)] max-w-xl gap-4 p-4 sm:gap-6 sm:p-7 sm:pt-9 max-h-[90dvh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="flex min-h-0 shrink-0 w-full sm:basis-56 overflow-hidden rounded-xl border border-black/10 bg-transparent aspect-[3/4] max-h-[40vh] sm:max-h-none">
            <img
              src={object.imageUrl}
              alt={object.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0 sm:pt-0.5">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-base sm:text-[17px] font-semibold">{object.name}</DialogTitle>
              <DialogDescription className="text-sm sm:text-[15px] text-black/70 leading-snug">
                {object.description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
