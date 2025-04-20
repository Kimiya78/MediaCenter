"use client";

import "@/public/locales/i18n";
import { Sidebar } from "@/components/layout/sidebar";
import { FileList } from "@/components/file-manager/file-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { DirectionToggle } from "@/components/direction-toggle";
import { FolderProvider, useFolder, DirectionProvider } from "@/components/folder-manager/context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Breadcrumbs from "@/components/breadCrumbs";
import { useState } from "react";
import { I18nDirectionProvider } from "@/public/locales/I18nDirectionProvider";
import { SidebarToggle } from "@/components/sidebarOpen-toggle"; // Import the new SidebarToggle component
import { setFont } from "@/components/fontSwitcher.js"; 
import { useEffect } from 'react';
import { useDirection } from "@/components/folder-manager/context"; // Ensure this is the correct import





export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
  
  // const { dir } = useDirection(); 
  // const isRtl = dir === 'rtl'; 

  // useEffect(() => {
  //   setFont(isRtl); // Set the font based on the direction
  // }, [isRtl]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // Toggle function
  };

  return (
    <DirectionProvider>
      <I18nDirectionProvider> 
        <FolderProvider>
          <div className="flex bg-background">
            {/* <Sidebar /> */}

            {isSidebarOpen && <Sidebar />} 

            <main className="grid grid-rows-[8rem_auto] w-full h-[calc(100vh_-_20rem)]">
              <div className="border-b bg-background grid grid-rows-[3re_1rem]">
                <div className="flex h-[5rem] items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    {/* Sidebar Toggle Button */}
                    <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <SidebarToggle isOpen={isSidebarOpen} onToggle={toggleSidebar} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center" className="max-w-[110px]">
                        <p className="text-sm">Toggle Sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>

                    <h1 className="text-xl font-semibold">Media Center</h1>
                  </div>

                  <TooltipProvider>
                    <div className="flex items-center gap-2">

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <DirectionToggle />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-w-[110px]">
                          <p className="text-sm">Toggle Direction</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <ThemeToggle />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="max-w-[110px]">
                          <p className="text-sm">Toggle Theme</p>
                        </TooltipContent>
                      </Tooltip>

                    </div>
                    
                  </TooltipProvider>
                </div>
                <div className="flex h-[3rem] items-center justify-between px-4">
                  <Breadcrumbs />
                </div>
              </div>

              <FileListWrapper />
            </main>
          </div>
        </FolderProvider>
      </I18nDirectionProvider>
    </DirectionProvider>
  );
}

function FileListWrapper() {
  const { selectedFolderId, setSelectedFolderId } = useFolder();
  const [files, setFiles] = useState<{ id: number; name: string; description: string }[]>([]);

  const handleUpload = (file: File, description: string) => {
    const newFile = {
      id: Date.now(),
      name: file.name,
      description,
    };
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };

  return <FileList initialFiles={files} selectedFolderId={selectedFolderId} setSelectedFolderId={setSelectedFolderId} />;
}
