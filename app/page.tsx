"use client"; 

// import { Sidebar } from "@/components/layout/sidebar"
// import { FileGrid } from "@/components/file-manager/file-grid"
// import { ThemeToggle } from "@/components/theme-toggle"
// import { DirectionToggle } from "@/components/direction-toggle"

// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination"

// export default function Page() {
//   // Removed state variables and useEffect

//   return (
//     <div className="flex h-screen bg-background">
//       <Sidebar />
//       <main className="flex-1 overflow-auto">
//         <div className="border-b bg-background">
//           <div className="flex h-[5rem] items-center justify-between px-4">
//             <div className="flex items-center gap-2">
//               <DirectionToggle />
//               <ThemeToggle />
//             </div>
//             <h1 className="text-xl font-semibold">Media Center</h1>
//           </div>
//         </div>

//         {/* <FileGrid files={files} paginationNumber={pageNumber} pageSize={pageSize} totalRecords={totalRecords} /> */}
//         <FileGrid initialFiles={[]} />

//       </main>
//     </div>
//   );
// }

"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { FileGrid } from "@/components/file-manager/file-grid";
import { ThemeToggle } from "@/components/theme-toggle";
import { DirectionToggle } from "@/components/direction-toggle";
import { FolderProvider, useFolder } from "@/components/folder-manager/context"; // Import FolderProvider and useFolder

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

export default function Page() {




  return (
    <FolderProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="border-b bg-background">
            <div className="flex h-[5rem] items-center justify-between px-4 ">
              <div className="flex items-center gap-2">
                <DirectionToggle />
                <ThemeToggle />
              </div>
              <h1 className="text-xl font-semibold">Media Center</h1>
            </div>
          </div>

          <FileGridWrapper />
        </main>
      </div>
    </FolderProvider>
  );
}

function FileGridWrapper() {
  const { selectedFolderId } = useFolder(); // Get the selectedFolderId from the context
  const [files, setFiles] = useState<{ id: number; name: string; description: string }[]>([]);

  // Function to handle new file uploads
  const handleUpload = (file: File, description: string) => {
    const newFile = {
      id: Date.now(), // Use a unique ID (e.g., timestamp)
      name: file.name,
      description,
    };
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };


  return (
    <FileGrid initialFiles={files} selectedFolderId={selectedFolderId} />
  );
}