"use client"

import { useEffect, useState } from "react"
import type { FileItem, SortConfig } from "@/types/file"
import { FileCard } from "./file-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Search, Upload, MoreVertical } from "lucide-react"
import { UploadDialog } from "../upload-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { useDirection } from "@/components/folder-manager/context"
import ConfigURL  from "@/config"


interface FileListProps {
  initialFiles: FileItem[]
  selectedFolderId: string
}

export function FileList({ initialFiles, selectedFolderId }: FileListProps) {
  const { dir } = useDirection()
  const [view, setView] = useState<"grid" | "list">("grid")
  // debugger
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
  const [newFileId, setNewFileId] = useState<string | null>(null)

  const fetchFiles = async (page: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${ConfigURL.baseUrl}/fetch_media?page_number=${page}&page_size=${pageSize}&EntityGUID=0xBD4A81E6A803&EntityDataGUID=0x85AC4B90382C&FolderID=${selectedFolderId}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`)
      }
      const apiData = await response.json()
      // debugger
      const transformedData: FileItem[] = apiData.items.map((item: any) => ({
        correlationGuid: item.CorrelationGUID,
        id: item.FileGUID,
        name: item.FileName,
        type: item.FileExtension,
        size: item.FileSize / 1024,
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
  }, [currentPage, pageSize, selectedFolderId])

  const filteredFiles = files.filter((file) => {
    const nameMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (fileType === "all") return nameMatch

    const typeMap: Record<string, string[]> = {
      documents: ["pdf", "docx", "txt", "xlx", "docx", "xlsx"],
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

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
    }

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

  const addNewFile = (file: File, description: string) => {
    const today = new Date()
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.name.split(".").pop() || "",
      size: file.size / 1024,
      createdBy: "You",
      createdDate: today.toISOString().split("T")[0],
      description,
      permission: "owner",
      isLocked: false,
    }

    setFiles((prevFiles) => [newFile, ...prevFiles])
    setNewFileId(newFile.id)
    setTimeout(() => {
      setNewFileId(null)
    }, 2000)
  }

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles.map((file) =>
        file.id === fileId ? { ...file, name: newName } : file
      );
  
      return [...updatedFiles]; // ✅ Force React to detect the change
    });
  
    // Apply animation to renamed file like an upload
    setNewFileId(fileId);  
    setTimeout(() => {
      setNewFileId(null);
    }, 2000);
  };
  
  
  

  const FileActions = ({ file }: { file: FileItem }) => {
    // debugger
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Download</DropdownMenuItem>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }


  const renderTableHeader = () => {
    const headers = [
      { key: "name", label: dir === "rtl" ? "نام فایل" : "Name" },
      { key: "type", label: dir === "rtl" ? "نوع" : "Type" },
      { key: "size", label: dir === "rtl" ? "سایز" : "Size" },
      { key: "createdBy", label: dir === "rtl" ? "ایجاد کننده" : "Created By" },
      { key: "createdDate", label: dir === "rtl" ? "تاریخ ایجاد" : "Created Date" },
    ]

    return (
      <tr className="border-b">
        {headers.map(({ key, label }) => (
          <th
            key={key}
            className={`px-4 py-3 cursor-pointer hover:bg-muted/50 ${dir === "rtl" ? "text-right" : "text-left"}`}
            onClick={() => handleSort(key as keyof FileItem)}
          >
            <div className="flex items-center gap-2">
              {label}
              {sortConfig.key === key && <span className="text-xs">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>}
            </div>
          </th>
        ))}
        <th className="px-4 py-3 w-10"></th>
      </tr>
    )
  }

  const renderTableBody = () => {
    return sortedFiles.map((file) => (
      <tr key={file.id} className="border-b hover:bg-muted/50">
        {["name", "type", "size", "createdBy", "createdDate"].map((field) => (
          <td key={field} className={`px-4 py-3 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            {file[field as keyof FileItem]}
          </td>
        ))}
        <td className="px-4 py-3 text-right">

            <ShareMenu
              fileId={file.id}
              fileName={file.name} // ✅ This updates when state changes
              fileDescription={file.description}
              fileSize={file.size.toString()}
              uploadedBy={file.createdBy}
              uploadedOn={file.createdDate}
              attachmentUrlGuid={file.correlationGuid}
              correlationGuid={file.correlationGuid}
              folderId={selectedFolderId}
              requiresPassword={false}
              trigger={<MoreVertical className="h-4 w-4" />}
              isLocked={file.isLocked}
              onRename={handleRenameFile} // ✅ Passes update function correctly
            />
        </td>
      </tr>
    ))
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={dir === "rtl" ? "جستجوی فایل ها..." : "Search files..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder={dir === "rtl" ? "فیلتر" : "Filter"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{dir === "rtl" ? "همه" : "All"}</SelectItem>
                <SelectItem value="documents">{dir === "rtl" ? "اسناد" : "Documents"}</SelectItem>
                <SelectItem value="images">{dir === "rtl" ? "تصاویر" : "Images"}</SelectItem>
                <SelectItem value="videos">{dir === "rtl" ? "ویدیوها" : "Videos"}</SelectItem>
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
              {dir === "rtl" ? "آپلود" : "Upload"}
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto p-4">
        {view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 lg:grid-cols-3 gap-4 ">
            {sortedFiles.map((file) => (
              <div key={file.id} className={`${newFileId === file.id ? "animate-new-file" : ""}`}>
                <FileCard file={file} actions={<FileActions file={file} />} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card ">
            <table className="min-w-full rounded-lg overflow-hidden">
              <thead>{renderTableHeader()}</thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fixed Footer with RTL-aware pagination */}
      <div className="sticky bottom-0 z-10 bg-background border-t p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1)
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
              <PaginationContent dir={dir}>
                <PaginationItem>
                  {dir === "rtl" ? (
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  ) : (
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  )}
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
                  {dir === "rtl" ? (
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  ) : (
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-background rounded-md border px-2">
                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  className="w-16 h-8 border-0 bg-transparent rtl:mr-2"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGoToPage}
                disabled={!goToPage || Number.parseInt(goToPage) < 1 || Number.parseInt(goToPage) > totalPages}
              >
                {dir === "rtl" ? " برو به" : "Go"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={(file, description) => {
          addNewFile(file, description)
          setIsUploadOpen(false)
        }}
        destination="My Drive"
      />
    </div>
  )
}