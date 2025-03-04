import type { FileItem } from "@/types/file";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon } from "./file-icon";
import { MoreVertical } from "lucide-react";
import { ShareMenu } from "../share-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { FolderProvider, useFolder ,DirectionProvider } from "@/components/folder-manager/context"; 

interface FileCardProps {
  file: FileItem;
  onRename: (fileId: string, newName: string) => void; // Add this prop for renaming
  onFileRemove: (correlationGuid: string) => void; 
}

export function FileCard({ file, onRename , onFileRemove }: FileCardProps) {
  const [newFileId, setNewFileId] = useState<string | null>(null);
  const { selectedFolderId } = useFolder();
  const handleFileRemove = (correlationGuid: string) => {
    onFileRemove(correlationGuid); };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "No description";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    if (!newName || newName.trim() === "") {
      console.error("Invalid new name provided for renaming.");
      return;
    }
    onRename(fileId, newName.trim()); // Call the parent's rename function
    setNewFileId(fileId);
    setTimeout(() => {
      setNewFileId(null);
    }, 2000);
  };


  const [files, setFiles] = useState<File[]>([]); // Assuming your files are in a state like this

  // const handleFileRemove = (correlationGuid: string) => {
  //   debugger
  //   //setFiles(prevFiles => prevFiles.filter(file => file.correlationGuid !== correlationGuid));
  //   setFiles((prevFiles) => prevFiles.filter((file) => file.correlationGuid !== correlationGuid));
  // };


  const formatFileSize = (sizeInBytes: number): string => {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB >= 1
      ? sizeInMB.toFixed(2) + " MB"
      : (sizeInBytes / 1024).toFixed(2) + " KB";
  };
  

  return (
    <Card className="w-full min-h-[200px] flex flex-col nx-card">
      <CardHeader className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Ensure FileIcon handles missing types gracefully */}
            <FileIcon type={(file.type || "").toLowerCase() || "unknown"} className="file-icon flex-shrink-0" />
            <div className="min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="font-medium text-sm truncate max-w-[180px]">{file.name}</h3>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-[300px]">
                    <p className="text-sm">{file.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-xs text-muted-foreground">{file.size}</p>
            </div>
          </div>
          <ShareMenu
            fileId={file.id}
            fileName={file.name}
            correlationGuid={file.correlationGuid}
            folderId={selectedFolderId}
            onFileRemove={handleFileRemove} 
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
            isLocked={file.isLocked}
            onRename={handleRenameFile} // Pass the rename handler to ShareMenu
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium capitalize">{file.type || "Unknown"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{file.createdDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Created by</span>
            <span className="font-medium truncate max-w-[120px]">{file.createdBy}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Description</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-right">
                    {file.description
                      ? file.description.length > 20
                        ? file.description.substring(0, 20) + "..."
                        : file.description
                      : "No description"}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="end" className="max-w-[300px]">
                  <p className="text-sm">{file.description || "No description"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}