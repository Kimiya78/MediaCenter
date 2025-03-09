"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDirection } from "@/components/folder-manager/context";  // Import the new context

export function DirectionToggle() {
  const { dir, toggleDirection } = useDirection();

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
  );
}