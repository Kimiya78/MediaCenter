"use client"

import type { FileItem, SortConfig } from "@/types/file"
import { FileCard } from "./file-card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Search, Upload, ChevronLeft, ChevronRight } from "lucide-react"
import { UploadDialog } from "../upload-dialog"
import { ShareMenu } from "../share-menu"
import { ThemeToggle } from "../theme-toggle"
import { DirectionToggle } from "../direction-toggle"
// import { Pagination } from "../ui/pagination"


import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface FileGridProps {
  files: FileItem[]
  paginationNumber : number
  pageSize : number
  totalRecords : number
}

export function FileGrid({ files: initialFiles ,  paginationNumber , pageSize , totalRecords }: FileGridProps) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [files, setFiles] = useState(initialFiles)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [itemsPerPage] = useState(8) // Fixed to 8 items per page
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [goToPage, setGoToPage] = useState("")
  const [fileType, setFileType] = useState<string>("all")

  const filteredFiles = files.filter((file) => {
    const nameMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (fileType === "all") return nameMatch

    const typeMap: Record<string, string[]> = {
      documents: ["pdf", "docx", "txt"],
      images: ["jpg", "jpeg", "png", "gif"],
      videos: ["mp4", "mov", "avi"],
    }

    return nameMatch && typeMap[fileType]?.includes(file.type.toLowerCase())
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
    return 0
  })
debugger
  const currentFiles = sortedFiles.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  // let currentFiles;
  // if (currentPage === 1) {
  //   currentFiles = sortedFiles.slice(0, itemsPerPage);
  //   console.log("sortedFiles length:", sortedFiles.length);
  //   console.log("Slicing from:", (currentPage - 1) * itemsPerPage, "to:", currentPage * itemsPerPage);

  // } else {
  //   currentFiles = sortedFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  //   console.log("sortedFiles length:", sortedFiles.length);
  //   console.log("Slicing from:", (currentPage - 1) * itemsPerPage, "to:", currentPage * itemsPerPage);

  // }
  console.log("page size :", pageSize);
  console.log("Current Files:", currentFiles);

  const totalPages = Math.ceil(totalRecords/pageSize)  

  const handleSort = (key: keyof FileItem) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleGoToPage = () => {
    const pageNumber = Number.parseInt(goToPage)
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
      setGoToPage("")
    }
  }
debugger
  return (
    <div className="p-4 space-y-4 nx-grid">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={fileType} onValueChange={setFileType}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem href="/my-drive/images" value="images">Images</SelectItem>
              <SelectItem href="/my-drive/videos" value="videos">Videos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-background border rounded-lg p-0.5 flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView("grid")}
              className={view === "grid" ? "bg-muted" : ""}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView("list")}
              className={view === "list" ? "bg-muted" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3 gap-4">
          {currentFiles.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("name")}>
                  Name
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("type")}>
                  Type
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("size")}>
                  Size
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("createdBy")}>
                  Created By
                </th>
                <th className="px-4 py-3 text-left cursor-pointer" onClick={() => handleSort("createdDate")}>
                  Created Date
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {currentFiles.map((file) => (
                <tr key={file.id} className="border-b">
                  <td className="px-4 py-3">{file.name}</td>
                  <td className="px-4 py-3">{file.type}</td>
                  <td className="px-4 py-3">{file.size} MB</td>
                  <td className="px-4 py-3">{file.createdBy}</td>
                  <td className="px-4 py-3">{file.createdDate}</td>
                  <td className="px-4 py-3">
                    <ShareMenu
                      fileId={file.id}
                      fileName={file.name}
                      trigger={
                        <Button variant="ghost" size="icon">
                          ⋮
                        </Button>
                      }
                      isLocked={file.isLocked}
                      onLockToggle={() => {
                        // Handle lock toggle
                        console.log("Toggle lock for:", file.id)
                      }}
                      onDelete={() => {
                        // Handle delete
                        console.log("Delete file:", file.id)
                      }}
                      onRename={(newName) => {
                        // Handle rename
                        console.log("Rename file:", file.id, "to:", newName)
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 nx-pagination">
        <Select
          value={itemsPerPage.toString()}
          onValueChange={(value) => {
            setItemsPerPage(Number(value))
            setCurrentPage(value)
          }}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-4">
          {/* <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rtl:ml-2 rtl:mr-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rtl:mr-2 rtl:ml-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div> */}
            {/* Pagination Component */}
            <Pagination className="justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={
                      currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-2 bg-background rounded-md border px-2">
              <span className="text-sm text-muted-foreground">Go to</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                className="w-16 h-8 border-0 bg-transparent rtl:ml-2"
              />
            </div>     
            <Button
              variant="secondary"
              size="sm"
              onClick={handleGoToPage}
              disabled={!goToPage || Number.parseInt(goToPage) < 1 || Number.parseInt(goToPage) > totalPages}
              className="rtl:ml-2"
            >
              Go
            </Button>
          </div>
        </div>
      </div>
      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(file, description) => {
          console.log("Uploading file:", file, description)
          // Handle file upload logic here
        }}
        destination="My Drive"
      />
    </div>
  )
}

