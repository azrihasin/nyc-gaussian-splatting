import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ClickableObject } from "@/clickableObjects"

type Props = {
  object: ClickableObject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ObjectInfoDialog({ object, open, onOpenChange }: Props) {
  if (!object) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl gap-6 p-7 pt-9">
        <div className="flex gap-6">
          <div className="flex min-h-0 shrink-0 basis-56 overflow-hidden rounded-xl border border-black/10 bg-transparent aspect-[3/4]">
            <img
              src={object.imageUrl}
              alt={object.name}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <DialogHeader className="text-left space-y-2">
              <DialogTitle className="text-[17px] font-semibold">{object.name}</DialogTitle>
              <DialogDescription className="text-[15px] text-black/70 leading-snug">
                {object.description}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
