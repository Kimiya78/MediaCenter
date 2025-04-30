"use client";

import { useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUploadFile } from "@/hooks/use-upload-file";
import { useFolder } from "@/components/folder-manager/context";
import { useDirection } from "@/components/folder-manager/context"
import { useTranslation } from "react-i18next";
import NexxFetch from "@/hooks/response-handling";
import ConfigURL from "@/config";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload?: (file: File, description: string, mimeType: string) => void; // Callback to pass new file data
  destination?: string;
}

export function UploadDialog({ isOpen, onClose, onUpload, destination }: UploadDialogProps) {
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useUploadFile();
  const { t } = useTranslation();
  const { dir } = useDirection();
  const { selectedFolderId } = useFolder();

  // Add refetch functionality
  const navigationItemsUrl = `${ConfigURL.baseUrl}/fetch_media?page_number=1&page_size=10&EntityGUID=0xBD4A81E6A803&EntityDataGUID=0x85AC4B90382C&FolderID=${selectedFolderId}`;
  const { refetch } = NexxFetch.useGetData(navigationItemsUrl, [selectedFolderId]);

  // Reset all state function
  const resetState = useCallback(() => {
    setDescription("");
    setDragActive(false);
    setSelectedFile(null);
    setUploading(false);
    setProgress(0);
  }, []);

  // Custom close handler that resets state
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !description) {
      toast.error(t("uploadDialog.selectFileError"));
      return;
    }

    if (!selectedFolderId) {
      toast.error(t("uploadDialog.selectFolderError"));
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Detect MIME type and extension
      let mimeType = selectedFile.type;
      let fileName = selectedFile.name;
      
      // If no MIME type or generic type, try to detect from file content
      if (!mimeType || mimeType === 'application/octet-stream') {
        const buffer = await selectedFile.slice(0, 4096).arrayBuffer();
        const arr = new Uint8Array(buffer);
        
        // Check file signatures
        if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
          mimeType = 'image/png';
        } else if (arr[0] === 0xFF && arr[1] === 0xD8) {
          mimeType = 'image/jpeg';
        } else if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46) {
          mimeType = 'application/pdf';
        } else if (arr[0] === 0x50 && arr[1] === 0x4B) {
          // Could be docx, xlsx, pptx, zip
          if (fileName.endsWith('.docx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          } else if (fileName.endsWith('.xlsx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          } else if (fileName.endsWith('.pptx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          } else {
            mimeType = 'application/zip';
          }
        }
      }

      // Get file extension from MIME type
      const extensionMap: { [key: string]: string } = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'application/pdf': 'pdf',
        'video/mp4': 'mp4',
        'text/plain': 'txt',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'application/zip': 'zip'
      };

      const extension = extensionMap[mimeType] || 'bin';
      
      // Ensure filename has correct extension
      if (!fileName.includes('.') || !fileName.toLowerCase().endsWith(`.${extension}`)) {
        fileName = `${fileName.split('.')[0]}.${extension}`;
      }

      // Create new File object with correct name and type
      const fileWithProperType = new File([selectedFile], fileName, { type: mimeType });

      const uploadData = {
        EntityGUID: "0xBD4A81E6A803",
        EntityDataGUID: "0x85AC4B90382C",
        ServiceCategoryID: "",
        ItemID: "",
        Description: description,
        ParentfolderId: selectedFolderId.toString(),
        file: fileWithProperType
      };

      console.log("🟡 Uploading file:", {
        originalName: selectedFile.name,
        newName: fileName,
        originalType: selectedFile.type,
        detectedType: mimeType,
        extension: extension
      });

      const response = await uploadFile(uploadData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });

      if (response.success) {
        // Pass the detected MIME type and proper filename to parent
        onUpload?.(fileWithProperType, description, mimeType);
        onClose();
        setSelectedFile(null);
        setDescription("");
        refetch(); // Refresh the file list
      } else {
        throw new Error(response.message || t("uploadDialog.uploadError"));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(t("uploadDialog.uploadError"));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [selectedFile, description, selectedFolderId, onUpload, onClose, uploadFile, t]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="space-y-0.5">
            <DialogTitle>{t("uploadDialog.title")}</DialogTitle>
            {destination && <p className="text-sm text-muted-foreground">{t("uploadDialog.uploadingTo")}: {destination}</p>}
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {selectedFile ? (
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors ${
                dragActive ? "border-primary" : "border-muted"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input 
                ref={inputRef} 
                type="file" 
                className="hidden" 
                onChange={handleChange}
                accept="*/*"
              />
              <p className="text-sm text-muted-foreground">
                {t("uploadDialog.dragAndDrop")}
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              {t("uploadDialog.description")}
            </label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder={t("uploadDialog.descriptionPlaceholder")}
              rows={3} 
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                {t("uploadDialog.uploading")} {progress}%
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !description || uploading || !selectedFolderId} 
            className="w-full"
          >
            {t("uploadDialog.uploadButton")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}