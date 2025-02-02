"use client"; 

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { FileGrid } from "@/components/file-manager/file-grid";
import { ThemeToggle } from "@/components/theme-toggle";
import { DirectionToggle } from "@/components/direction-toggle";
// import { Pagination } from "@/components/ui/pagination"; // Import Pagination Component
import type { FileItem } from "@/types/file";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { MediaGrid } from "@/components/media-grid"

export default function Page() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecords, setTotalRecords] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [currentPage, setCurrentPage] = useState(1)
  // const [media, setMedia] = useState<MediaResponse | null>(null)


  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://cgl1106.cinnagen.com:9020/fetch_media?page_number=${page}&page_size=${pageSize}&EntityGUID=0xBD4A81E6A803&EntityDataGUID=0x85AC4B90382C&FolderID=6`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const apiData = await response.json();
      const filesItem  = (apiData.items);
      setPageNumber(apiData.page_number)
      setTotalRecords(apiData.total_records) 
      setPageSize(apiData.page_size)

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
      }));

      setFiles(transformedData);
      //setTotalPages(apiData.total_pages || 1);
    } catch (error) {
      setError("Error fetching data. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pageNumber);
  }, [pageNumber]); // Update data when page changes

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

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

        <FileGrid files={files} paginationNumber={pageNumber} pageSize={pageSize} totalRecords={totalRecords} />
        
        {/* <FileGrid files={filesItem}  /> */}
        <div className="p-4">
          <MediaGrid />
        </div>

      </main>
    </div>
  );
}
