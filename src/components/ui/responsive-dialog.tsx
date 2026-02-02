"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent as DialogContentPrimitive,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent as DrawerContentPrimitive,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { cn } from "@/lib/utils"

const MOBILE_BREAKPOINT = "(max-width: 639px)"

type ResponsiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        {children}
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

type ResponsiveDialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogContentPrimitive
> & {
  showCloseButton?: boolean
  className?: string
  children?: React.ReactNode
}

const ResponsiveDialogContent = React.forwardRef<
  HTMLDivElement,
  ResponsiveDialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT)

  if (isMobile) {
    return (
      <DrawerContentPrimitive
        ref={ref}
        className={cn(className, "!w-full !max-w-none min-w-0 h-auto !max-h-none !overflow-visible rounded-t-2xl")}
        {...props}
      >
        {children}
      </DrawerContentPrimitive>
    )
  }

  return (
    <DialogContentPrimitive
      ref={ref}
      className={className}
      showCloseButton={showCloseButton}
      {...props}
    >
      {children}
    </DialogContentPrimitive>
  )
})
ResponsiveDialogContent.displayName = "ResponsiveDialogContent"

export { ResponsiveDialog, ResponsiveDialogContent }
