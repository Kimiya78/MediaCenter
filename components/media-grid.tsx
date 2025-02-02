"use client"

import { useEffect, useState } from "react"
import { FileIcon, ImageIcon, VideoIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface MediaItem {
  AttachmentMetadataID: number
  FileGUID: string
  FileName: string
  FileExtension: string
  Description: string
  CreatedBy: string
  CreatedDateTime: string
}

interface MediaResponse {
  page_number: number
  page_size: number
  total_records: number
  items: MediaItem[]
}

export function MediaGrid() {
  const [media, setMedia] = useState<MediaResponse | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const pageSize = 8
  const totalPages = media ? Math.ceil(media.total_records / pageSize) : 0

  useEffect(() => {
    fetchMedia(currentPage)
  }, [currentPage])

  const fetchMedia = async (page: number) => {
    try {
      setIsLoading(true)
      // Modify the URL to match your API endpoint for fetching media
      const response = await fetch(`https://cgl1106.cinnagen.com:9020/fetch_media?page_number=${page}&page_size=${pageSize}&EntityGUID=0xBD4A81E6A803&EntityDataGUID=0x85AC4B90382C&FolderID=6`)
      if (!response.ok) throw new Error("Failed to fetch media")
      const data = await response.json()
      setMedia(data)
      setError("")
    } catch (err) {
      setError("Failed to load media")
    } finally {
      setIsLoading(false)
    }
  }

  const getFileIcon = (extension: string) => {
    switch (extension.toLowerCase()) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="h-8 w-8" />
      case "mp4":
      case "mov":
      case "avi":
        return <VideoIcon className="h-8 w-8" />
      default:
        return <FileIcon className="h-8 w-8" />
    }
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array(pageSize)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="mt-4 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
          : media?.items.map((item) => (
              <Card key={item.FileGUID} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(item.FileExtension)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {item.FileName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.CreatedDateTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {item.Description && (
                    <p className="mt-2 text-sm text-muted-foreground truncate">
                      {item.Description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {!isLoading && media && (
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
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
