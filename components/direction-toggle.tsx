"use client"

import * as React from "react"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DirectionToggle() {
  const [dir, setDir] = React.useState<"ltr" | "rtl">(() => document.documentElement.dir || "ltr")

  const toggleDirection = React.useCallback(() => {
    const newDir = dir === "ltr" ? "rtl" : "ltr"
    setDir(newDir)
    document.documentElement.dir = newDir
    // Force layout recalculation
    document.body.style.display = "none"
    document.body.offsetHeight // Force reflow
    document.body.style.display = ""
  }, [dir])

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDirection}
      className="bg-background rtl:rotate-180 transition-transform duration-200"
    >
      <Languages className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle direction</span>
    </Button>
  )
}

