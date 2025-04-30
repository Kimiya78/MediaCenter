// components/sidebarOpen-toggle.tsx
"use client";

import * as React from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react"; // Import the icons
import { Button } from "@/components/ui/button"; // Adjust the import based on your button component
import { useDirection } from "@/components/folder-manager/context";

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  const { dir } = useDirection();
  return (
    <Button 
      onClick={onToggle}   
      className="p-2 bg-background hover:bg-gray-300 dark:hover:bg-muted "
    >
      {dir === "rtl" ? (
        isOpen ? (
          <PanelRightClose className="h-[1.2rem] w-[1.2rem] text-black dark:text-white" />
        ) : (
          <PanelRightOpen className="h-[1.2rem] w-[1.2rem] text-black dark:text-white" />
        )
      ) : (
        isOpen ? (
          <PanelRightOpen className="h-[1.2rem] w-[1.2rem] text-black dark:text-white" />
        ) : (
          <PanelRightClose className="h-[1.2rem] w-[1.2rem] text-black dark:text-white" />
        )
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// ========================================================================================================================
