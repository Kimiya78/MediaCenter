"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { DirectionToggle } from "@/components/direction-toggle";
import { DirectionProvider } from "@/components/folder-manager/context";
import { SharingForm } from "@/components/sharing-dialog";
import { useSearchParams } from "next/navigation";


export default function SharePage() {
    // const correlationGuid = "A3153532-D6D1-4163-B7F5-C7508E195A14";  
    const searchParams = useSearchParams();
    const correlationGuid = searchParams.get("CorrelationGUID");
    
  return (
    <DirectionProvider>
      <div className="flex h-screen bg-background">
        <main className="flex-1">
          <div className="border-b bg-background">
            <div className="flex h-[5rem] items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <DirectionToggle />
                <ThemeToggle />
              </div>
              <h1 className="text-xl font-semibold">Media Center</h1>
            </div>
          </div>

          {/* Main content area */}
          <div className="container mx-auto py-8">
          <SharingForm correlationGuid={correlationGuid} />
          </div>

          {/* Video container for video file previews */}
          <div id="videoContainer" className="mt-4 container mx-auto px-8"></div>
        </main>
      </div>
    </DirectionProvider>
  );
}