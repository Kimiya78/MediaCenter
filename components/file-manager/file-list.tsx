"use client"

import { useEffect, useState } from "react"
import type { FileItem, SortConfig } from "@/types/file"
import { FileCard } from "./file-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Search, Upload, MoreVertical, FileText, Presentation, Table, ChevronDown, Video, Image as ImageIcon, File as FileIcon } from "lucide-react"
import { UploadDialog } from "../upload-dialog"
//import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDirection } from "@/components/folder-manager/context"
import ConfigURL  from "@/config"
import '@/app/globals.css'
import NexxFetch from "@/hooks/response-handling"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toJalali, toJalaliWithTime } from "@/utils/dateConverter";
import moment from "moment";
import convertToJalali from "@/hooks/useJalaliDate"





interface FileListProps {
  initialFiles: FileItem[]
  selectedFolderId: string
  setSelectedFolderId: (id: number | null) => void; // Ensure it's passed

}

export function FileList({ initialFiles, selectedFolderId ,setSelectedFolderId  }: FileListProps) {
  const { dir } = useDirection();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [goToPage, setGoToPage] = useState("");
  const [fileType, setFileType] = useState<string>("all");
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [newFileId, setNewFileId] = useState<string | null>(null);
  const [keyword_search, setKeywordSearch] = useState<string>('');
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const [objectName, setObjectName] = useState("8");


  // Reset animation state when folder changes
  useEffect(() => {
    setNewFileId(null);
  }, [selectedFolderId]);

  // Reset animation state when page changes
  useEffect(() => {
    setNewFileId(null);
  }, [currentPage]);

  // useEffect(() => {
  //   console.log("Folder changed to:", selectedFolderId); // 🔍
  //   refetch();
  // }, [currentPage, pageSize, selectedFolderId, keyword_search]);
  

  // NexxFetch API Call
  const navigationItemsUrl = `${ConfigURL.baseUrl}/fetch_media?page_number=${currentPage}&page_size=${pageSize}&EntityGUID=0xBD4A81E6A803&EntityDataGUID=0x85AC4B90382C&FolderID=${selectedFolderId}&keyword_search=${encodeURIComponent(keyword_search)}`;
  
  const { data, isLoading, error: fetchError , refetch} =  NexxFetch.useGetData<{
    page_number: number;
    total_records: number;
    page_size: number;
    items: FileItem[];
  }>(navigationItemsUrl, [currentPage, pageSize, selectedFolderId , searchQuery]); //`${navigationItemsUrl}?keyword_search=${keyword_search ?? ""}&FolderID=${selectedFolderId ?? ""}`,

  const formatFileSize = (sizeInBytes: number): string => {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB >= 1
      ? sizeInMB.toFixed(2) + "    "+ " MB"
      : (sizeInBytes / 1024).toFixed(2) + "    "+ " KB";
  };
  

  useEffect(() => {
    if (data?.items) {
      const transformedData: FileItem[] = data.items.map((item: APIFileItem) => {
        if (dir === "ltr") {
          return {
            correlationGuid: item.CorrelationGUID,
            id: item.FileGUID,
            name: item.FileName,
            type: item.FileExtension,
            size: formatFileSize(item.FileSize),
            createdBy: item.CreatedBy,
            createdDate: item.CreatedDateTime,
            description: item.Description,
            permission: item.allowDeleteFile === "true" ? "owner" : "viewer",
            isLocked: false,
          };
        }

        const createdAt = item.CreatedDateTime ? moment(item.CreatedDateTime, "YYYY/MM/DD - HH:mm").format("YYYY/MM/DD - HH:mm") : null;
        const formattedDate = createdAt ? convertToJalali(createdAt).replace(/(\d{4}\/\d{2}\/\d{2}) - (\d{2}:\d{2})/, "$2 - $1") : "Invalid Date";

        return {
          correlationGuid: item.CorrelationGUID,
          id: item.FileGUID,
          name: item.FileName,
          type: item.FileExtension,
          size: formatFileSize(item.FileSize),
          createdBy: item.CreatedBy,
          createdDate: formattedDate,
          description: item.Description,
          permission: item.allowDeleteFile === "true" ? "owner" : "viewer",
          isLocked: false,
        };
      });

      setFiles(transformedData);
      setTotalRecords(data.total_records || 0);
      setPageSize(data.page_size || 10);
      setError(null);
    }
  }, [data, dir]);
  
  // Modify the search input handler
  const handleSearch = (inputValue: string) => {
    setSearchQuery(inputValue);
    setKeywordSearch(inputValue);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filtering logic - only for file type, search is handled by API
  const filteredFiles = files.filter((file) => {
    if (fileType === "all") return true;

    const typeMap: Record<string, string[]> = {
      pictures: ["png", "jpg", "jpeg"],
      videos: ["mp4", "mov", "avi"],
      documents: ["pptx", "pdf", "docx", "xlsx", "txt"],
      pdf: ["pdf"],
      docx: ["docx"],
      pptx: ["pptx"],
      xlsx: ["xlsx"],
      png: ["png"],
      jpg: ["jpg"],
      jpeg: ["jpeg"],
      txt: ["txt"],
      all: ["png", "jpg", "jpeg", "mp4", "mov", "avi", "pptx", "pdf", "docx", "xlsx", "txt"]
    };

    const allowedExtensions = typeMap[fileType];
    if (!allowedExtensions) return false;

    const fileExtension = (file.type || "").toLowerCase();
    return allowedExtensions.includes(fileExtension);
  });

  // Sorting logic
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Reset search inputs when selectedFolderId changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery(null);
    setKeywordSearch('');
  }, [selectedFolderId]);
  


  // Pagination logic (unchanged)
  const totalPages = Math.ceil(totalRecords / pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1); // Reset to the first page if currentPage is invalid
    }
  }, [totalPages]);

  const handleSort = (key: keyof FileItem) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleGoToPage = () => {
    const pageNumber = Number.parseInt(goToPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setGoToPage("");
    }
  };

  // Upload logic with animation
  const addNewFile = (file: File, description: string) => {
    console.log("direction now is this value : " , dir)
    debugger
    const today = new Date();
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.name.split(".").pop()?.toLowerCase() || "unknown",
      size: formatFileSize(file.size),
      createdBy: "You",
      createdDate: dir === "rtl" 
        ? moment(today).locale("fa").format("HH:mm - YYYY/MM/DD")
        : moment(today).format("YYYY/MM/DD - HH:mm"),
      description: description,
      permission: "owner",
      isLocked: false
    };

    // Add the new file at the beginning of the list with animation
    setFiles((prevFiles) => {
      const updatedFiles = [newFile, ...prevFiles];
      return updatedFiles;
    });
    setNewFileId(newFile.id);

    // Remove animation after 2 seconds
    setTimeout(() => {
      setNewFileId(null);
    }, 2000);

    
  };

  // Rename logic with animation
  const handleRenameFile = (fileId: string, newName: string) => {
    if (!newName || newName.trim() === "") {
      console.error("Invalid new name provided for renaming.");
      return;
    }

    setFiles((prevFiles) => {
      const fileIndex = prevFiles.findIndex(file => file.id === fileId);
      if (fileIndex === -1) return prevFiles;
      
      const updatedFiles = [...prevFiles];
      updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], name: newName.trim() };
      return updatedFiles;
    });

    // Apply animation to renamed file
    setNewFileId(newName);

    // Remove animation after 2 seconds
    setTimeout(() => {
      setNewFileId(null);
    }, 2000);
  };
  

  const handleFileRemove = (correlationGuid: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.correlationGuid !== correlationGuid));
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
      { key: "name", label: t("tableHeaders.name") },
      { key: "type", label:  t("tableHeaders.type")  },
      { key: "size", label: t("tableHeaders.size") },
      { key: "createdBy", label: t("tableHeaders.createdBy") },
      { key: "createdDate", label:  t("tableHeaders.createdDate")  },
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
        <th className="px-4 py-3 w-10  " ></th>
      </tr>
    )
  }


  const renderTableBody = () => {
    return sortedFiles.map((file) => (
      <tr key={file.id} className="border-b hover:bg-muted/50">
        {["name", "type", "size", "createdBy", "createdDate"].map((field) => (
          <td key={field} className={`px-4 py-3 persian-text ${dir === "rtl" ? "text-right" : "text-left"}`}>
            {field === "createdBy" ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={file.createdByAvatar} alt={file.createdBy} />
                  <AvatarFallback>{file.createdBy?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium truncate max-w-[120px]">{file.createdBy}</span>
              </div>
            ) : (
              file[field as keyof FileItem]
            )}
          </td>
        ))}
        {/* <td className="px-4 py-3 text-right">
           <ShareMenu
             fileId={file.id}
             fileName={file.name}
             fileDescription={file.description}
             fileSize={file.size.toString()}
             uploadedBy={file.createdBy}
             uploadedOn={file.createdDate}
             attachmentUrlGuid={file.correlationGuid}
             correlationGuid={file.correlationGuid}
             folderId={selectedFolderId}
             requiresPassword={false}
             trigger={<MoreVertical className="h-4 w-4 cursor-pointer" />}
             isLocked={file.isLocked}
             onRename={(newName) => handleRenameFile(file.id, newName)}
             onFileRemove={handleFileRemove}
           />
        </td> */}
      </tr>
    ));
  };
  

  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    refetch();
  };

  // Modify the rendering logic to show new files first
  const renderFiles = () => {
    // First, find any new file that should be shown with animation
    const newFile = files.find(file => file.id === newFileId);
    
    // Then get the rest of the files after filtering and sorting
    const filteredAndSortedFiles = sortedFiles.filter(file => file.id !== newFileId);

    // Combine them with new file first
    const displayFiles = newFile ? [newFile, ...filteredAndSortedFiles] : filteredAndSortedFiles;

    if (view === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 lg:grid-cols-3 gap-4">
          {displayFiles.map((file) => (
            <div key={file.id} className={`${newFileId === file.id ? "animate-new-file" : ""}`}>
              <FileCard
                file={file}
                onRename={(newName) => handleRenameFile(file.id, newName)}
                onFileRemove={handleFileRemove}
              />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="rounded-lg border bg-card">
          <table className="min-w-full rounded-lg overflow-hidden">
            <thead>{renderTableHeader()}</thead>
            <tbody>
              {displayFiles.map((file) => (
                <tr key={file.id} className={`border-b hover:bg-muted/50 ${newFileId === file.id ? "animate-new-file" : ""}`}>
                  {["name", "type", "size", "createdBy", "createdDate"].map((field) => (
                    <td key={field} className={`px-4 py-3 persian-text ${dir === "rtl" ? "text-right" : "text-left"}`}>
                      {field === "createdBy" ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={file.createdByAvatar} alt={file.createdBy} />
                            <AvatarFallback>{file.createdBy?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate max-w-[120px]">{file.createdBy}</span>
                        </div>
                      ) : (
                        file[field as keyof FileItem]
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <ShareMenu
                      fileId={file.id}
                      fileName={file.name}
                      fileDescription={file.description || ""}
                      fileSize={file.size.toString()}
                      uploadedBy={file.createdBy}
                      uploadedOn={file.createdDate}
                      attachmentUrlGuid={file.correlationGuid}
                      correlationGuid={file.correlationGuid}
                      folderId={selectedFolderId}
                      requiresPassword={false}
                      trigger={<MoreVertical className="h-4 w-4 cursor-pointer" />}
                      isLocked={file.isLocked}
                      onRename={(newName) => handleRenameFile(file.id, newName)}
                      onFileRemove={handleFileRemove}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className=" grid grid-rows-[5rem_auto_3.5rem] h-[calc(100vh_-_10rem)]">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className={`absolute ${dir === 'rtl' ? 'right-2' : 'left-2'} top-2.5 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t("buttons.searchPlaceholder")}
                onChange={(e) => handleSearch(e.target.value)}
                value={searchQuery || ""}
                className={dir === 'rtl' ? 'pr-8' : 'pl-8'}
              />
            </div>

            <DropdownMenu dir={dir}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 persian-text flex justify-between items-center">
                  {dir === 'rtl' ? (
                    <>
                      <ChevronDown className="h-4 w-4 opacity-50 " />
                      <span className="truncate">
                        {fileType === "all" ? t("fileTypes.all") : t(`fileTypes.${fileType}`)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">
                        {fileType === "all" ? t("fileTypes.all") : t(`fileTypes.${fileType}`)}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align={dir === 'rtl' ? 'end' : 'start'}>
                <DropdownMenuItem className="flex items-center" onClick={() => setFileType("all")}>
                  {t("fileTypes.all")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Documents Category */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center" dir={dir}>
                    <FileText className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <span>{t("fileCategories.documents")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("pdf")}>
                        <FileIcon className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.pdf")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("docx")}>
                        <FileText className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.docx")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("pptx")}>
                        <Presentation className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.pptx")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("xlsx")}>
                        <Table className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.xlsx")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("txt")}>
                        <FileText className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.txt")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* Images Category */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center" dir={dir}>
                    <ImageIcon className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <span>{t("fileCategories.images")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("png")}>
                        <ImageIcon className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.png")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("jpg")}>
                        <ImageIcon className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.jpg")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("jpeg")}>
                        <ImageIcon className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.jpeg")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* Videos Category */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center" dir={dir}>
                    <Video className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                    <span>{t("fileCategories.videos")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem className="flex items-center" onClick={() => setFileType("videos")}>
                        <Video className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                        <span>{t("fileTypes.videos")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
       
            <TooltipProvider>
              <div className="bg-background border rounded-lg p-0.5 flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setView("grid")}
                      className={view === "grid" ? "bg-muted" : ""}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    <p className="text-sm">Grid View</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setView("list")}
                      className={view === "list" ? "bg-muted" : ""}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center">
                    <p className="text-sm">List View</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4 "  style={{ fontFamily: dir === 'rtl' ? 'IranYekanBakh' : 'EnglishFont' }} />
              {/* {dir === "rtl" ? "بارگذاری فایل " : "Upload File"} */}{t("buttons.upload")}

            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-500 hover:scrollbar-thumb-gray-700 ">
      
      {isLoading && selectedFolderId !== null && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center bg-white bg-opacity-50 z-50">
          <svg
            aria-hidden="true"
            className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          {/* Loading Text */}
          <p className="mt-4 text-gray-600 font-medium text-lg">{t("sharingDialog.loading")}</p>
        </div>
      )}


        {renderFiles()}
      </div>

      {/* Fixed Footer with RTL-aware pagination */}
      <div className=" z-10 bg-background border-t p-4">
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
                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                      }}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  ) : (
                    <PaginationPrevious
                      //href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) handlePageChange(currentPage - 1)
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
                            handlePageChange(page)
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
                      //href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) handlePageChange(currentPage - 1)
                      }}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  ) : (
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
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
                 style={{ fontFamily: dir === 'rtl' ? 'IranYekanBakh' : 'EnglishFont' }} 
              >
                {/* {dir === "rtl" ? " برو به" : "Go"}*/}{t("buttons.goTo")} 
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