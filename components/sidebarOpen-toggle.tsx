// components/sidebarOpen-toggle.tsx
"use client";

import * as React from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react"; // Import the icons
import { Button } from "@/components/ui/button"; // Adjust the import based on your button component

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
  return (
    <Button 
      onClick={onToggle}   
      className="p-2 bg-background hover:bg-gray-300 dark:hover:bg-muted "
    >
      {isOpen ? (
        <PanelRightClose className="h-[1.2rem] w-[1.2rem] text-black dark:text-white" />
      ) : (
        <PanelRightOpen className="h-[1.2rem] w-[1.2rem] text-black dark:text-white" />
      )}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

// ========================================================================================================================


// "use client";

// import * as React from "react";
// import { HiOutlineChevronLeft } from "react-icons/hi"; // Import the icon
// import { Button } from "@/components/ui/button"; // Adjust the import based on your button component

// interface SidebarToggleProps {
//   isOpen: boolean;
//   onToggle: () => void;
// }

// export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
//   return (
//     <Button onClick={onToggle} className="p-2 text-sm rounded bg-gray-200 hover:bg-gray-300">
//       <HiOutlineChevronLeft className={`transform transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
//       <span className="sr-only">Toggle Sidebar</span>
//     </Button>
//   );
// }


// ========================================================================================================================
// "use client";

// import * as React from "react";
// import { HiOutlineChevronLeft } from "react-icons/hi"; // Import the icon
// import { Button } from "@/components/ui/button"; // Adjust the import based on your button component

// interface SidebarToggleProps {
//   isOpen: boolean;
//   onToggle: () => void;
// }

// export function SidebarToggle({ isOpen, onToggle }: SidebarToggleProps) {
//   return (
//     <Button onClick={onToggle} className="p-2 text-sm rounded bg-gray-200 hover:bg-gray-300">
//       <HiOutlineChevronLeft className={`transform transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
//       <span className="sr-only">Toggle Sidebar</span>
//     </Button>
//   );
// }