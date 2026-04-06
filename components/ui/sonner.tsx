"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      richColors
      expand
      closeButton
      className="toaster group"
      toastOptions={{
        duration: 3800,
        classNames: {
          toast: "border shadow-2xl rounded-xl backdrop-blur-md",
          title: "text-sm font-semibold",
          description: "text-xs opacity-95",
          success: "!bg-emerald-600 !text-emerald-50 !border-emerald-300/70",
          error: "!bg-rose-600 !text-rose-50 !border-rose-300/70",
          warning: "!bg-amber-500 !text-black !border-amber-300",
          info: "!bg-sky-600 !text-sky-50 !border-sky-300/70",
          actionButton: "!bg-black/20 !text-white hover:!bg-black/30",
          cancelButton: "!bg-black/10 !text-white/90 hover:!bg-black/20"
        }
      }}
      style={
        {
          "--normal-bg": "rgba(8, 12, 20, 0.96)",
          "--normal-text": "#f8fafc",
          "--normal-border": "rgba(148, 163, 184, 0.55)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
