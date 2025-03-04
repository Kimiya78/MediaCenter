"use client"; 


import { Sidebar } from "@/components/layout/sidebar";
import { FileList } from "@/components/file-manager/file-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { DirectionToggle } from "@/components/direction-toggle";
import { FolderProvider, useFolder ,DirectionProvider } from "@/components/folder-manager/context"; // Import FolderProvider and useFolder
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useState } from "react";
import Breadcrumbs from "@/components/breadCrumbs";


export default function Page() {


  return (
    <DirectionProvider>
      <FolderProvider>
        <div className="flex  bg-background">
          <Sidebar />
          <main className="grid grid-rows-[8rem_auto] w-full  h-[calc(100vh_-_10rem)]">
            <div className="border-b bg-background  grid grid-rows-[3re_1rem]">
              <div className="flex h-[5rem] items-center justify-between px-4 ">
                <h1 className="text-xl font-semibold">Media Center</h1>
                {/* <div className="flex items-center gap-2">
                  <DirectionToggle />
                  <ThemeToggle /
                  >
                </div> */}

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
              <div className="flex h-[3rem] items-center justify-between px-4 ">
                  <Breadcrumbs />
              </div>
            </div>
            
            <FileListWrapper />
          </main>
        </div>
      </FolderProvider>
    </DirectionProvider>
  );
}

function FileListWrapper() {
  const { selectedFolderId , setSelectedFolderId  } = useFolder(); // Get the selectedFolderId from the context
  const [files, setFiles] = useState<{ id: number; name: string; description: string }[]>([]);

  // Function to handle new file uploads
  const handleUpload = (file: File, description: string) => {
    const newFile = {
      id: Date.now(), 
      name: file.name,
      description,
    };
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };


  return (
    <FileList initialFiles={files} selectedFolderId={selectedFolderId}  setSelectedFolderId={setSelectedFolderId} />
  );
}