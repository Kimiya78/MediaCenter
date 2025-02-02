"use client"

import { useEffect, useState } from "react"
import type { FileItem, SortConfig } from "@/types/file"
import { FileCard } from "./file-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Search, Upload } from "lucide-react"
import { UploadDialog } from "../upload-dialog"
import { ShareMenu } from "../share-menu"
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
  initialFiles: FileItem[]
}

export function FileGrid({ initialFiles }: FileGridProps) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [files, setFiles] = useState<FileItem[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [goToPage, setGoToPage] = useState("")
  const [fileType, setFileType] = useState<string>("all")
  const [totalRecords, setTotalRecords] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `https://cgl1106.cinnagen.com:9020/fetch_media?page_number=${page}&page_size=${pageSize}&EntityGUID=0xBD4A81E6A803&EntityDataGUID=0x85AC4B90382C&FolderID=6`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`)
      }
      const apiData = await response.json()
      const transformedData: FileItem[] = apiData.items.map((item: any) => ({
        id: item.FileGUID,
        name: item.FileName,
        type: item.FileExtension,
        size: item.FileSize / 1024, // Convert bytes to KB
        createdBy: item.CreatedBy,
        createdDate: item.CreatedDateTime.split(" ")[0],
        description: item.Description,
        permission: item.allowDeleteFile === "true" ? "owner" : "viewer",
        isLocked: false,
      }))
      setFiles(transformedData)
      setTotalRecords(apiData.total_records)
      setPageSize(apiData.page_size)
      setError(null)
    } catch (error) {
      setError("Error fetching data. Please try again.")
      console.error("Fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles(currentPage)
  }, [currentPage, pageSize])

  const filteredFiles = files.filter((file) => {
    const nameMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (fileType === "all") return nameMatch

    const typeMap: Record<string, string[]> = {
      documents: ["pdf", "docx", "txt" ,"xlx" , "docx" , "xlsx"],
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

  const totalPages = Math.ceil(totalRecords / pageSize)

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
              <SelectItem href="/my-drive/images" value="images">
                Images
              </SelectItem>
              <SelectItem href="/my-drive/videos" value="videos">
                Videos
              </SelectItem>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 lg:grid-cols-3 gap-4">
          {sortedFiles.map((file) => (
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
              {sortedFiles.map((file) => (
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
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value))
            setCurrentPage(1) // Reset to page 1 when changing page size
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
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
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
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
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

