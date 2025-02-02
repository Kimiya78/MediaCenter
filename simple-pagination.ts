

"use client";

import { useEffect, useState } from "react";
import { FileIcon, ImageIcon, VideoIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface MediaItem {
  FileGUID: string;
  FileName: string;
  FileExtension: string;
  CreatedDateTime: string;
  // Add other properties if needed
}

interface MediaResponse {
  page_number: number;
  page_size: number;
  total_records: number;
  items: MediaItem[];
}

export default function MediaPage() {
  const [data, setData] = useState<MediaResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 8;
  const totalPages = data ? Math.ceil(data.total_records / pageSize) : 0;

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `https://cgl1106.cinnagen.com:9020/fetch_media?page_number=${page}&page_size=${pageSize}&EntityGUID=0xBD4A81E6A803&EntityDataGUID=0x85AC4B90382C&FolderID=6`
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (extension: string) => {
    switch (extension.toLowerCase()) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <ImageIcon className="h-8 w-8" />;
      case "mp4":
      case "mov":
      case "avi":
        return <VideoIcon className="h-8 w-8" />;
      default:
        return <FileIcon className="h-8 w-8" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Media Center</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data?.items.map((item) => (
          <Card key={item.FileGUID} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {getFileIcon(item.FileExtension)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.FileName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.CreatedDateTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8 justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? "opacity-50 pointer-events-none" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </main>
  );
}
