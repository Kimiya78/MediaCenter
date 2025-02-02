"use client"; 

import { Sidebar } from "@/components/layout/sidebar"
import { FileGrid } from "@/components/file-manager/file-grid"
import { ThemeToggle } from "@/components/theme-toggle"
import { DirectionToggle } from "@/components/direction-toggle"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function Page() {
  // Removed state variables and useEffect


  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <DirectionToggle />
              <ThemeToggle />
            </div>
            <h1 className="text-xl font-semibold">Media Center</h1>
          </div>
        </div>

        {/* <FileGrid files={files} paginationNumber={pageNumber} pageSize={pageSize} totalRecords={totalRecords} /> */}
        <FileGrid initialFiles={[]} />

      </main>
    </div>
  );
}
