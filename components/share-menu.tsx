"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Share2, Download, Lock, Unlock, Trash, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { ShareDialog } from "./share-dialog";
import { RenameDialog } from "./rename-dialog";
import axios from "axios";

interface ShareMenuProps {
  fileId: string; // FileGUID
  fileName: string;
  fileDescription: string;
  fileSize: string;
  uploadedBy: string;
  uploadedOn: string;
  attachmentUrlGuid: string; // AttachmentURLGUID
  trigger: React.ReactNode;
  isLocked?: boolean;
  onLockToggle?: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
}

export function ShareMenu({
  fileId,
  fileName,
  fileDescription,
  fileSize,
  uploadedBy,
  uploadedOn,
  attachmentUrlGuid,
  trigger,
  isLocked,
  onLockToggle,
  onDelete,
  onRename,
}: ShareMenuProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  // دانلود فایل
  const handleDownload = async () => {
    try {
      const downloadUrl = "https://cgl1106.cinnagen.com:9020/downloading_file";

      const response = await axios.post(
        downloadUrl,
        {
          FileGUID: fileId,
          AttachmentURLGUID: attachmentUrlGuid,
          PasswordClear: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob", // برای دریافت فایل به صورت باینری
        }
      );

      const contentType = response.headers["content-type"] || "";
      const contentDisposition = response.headers["content-disposition"] || "";
      const videoTypes = ["mp4", "webm", "ogg", "avi", "mkv", "quicktime", "video/mp4"];
      const isVideo = videoTypes.some((type) => contentType.includes(type));

      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : fileName;

      if (isVideo) {
        // نمایش ویدیو
        const videoContainer = document.getElementById("videoContainer");
        if (!videoContainer) throw new Error("Video container not found.");

        videoContainer.innerHTML = "";

        const videoPlayer = document.createElement("video");
        videoPlayer.controls = true;
        videoPlayer.style.width = "100%";
        videoPlayer.style.height = "auto";

        const videoSource = document.createElement("source");
        videoSource.src = URL.createObjectURL(response.data);
        videoSource.type = contentType;

        videoPlayer.appendChild(videoSource);
        videoContainer.appendChild(videoPlayer);

        videoPlayer.load();
        videoPlayer.play().catch((err) => console.error("Video playback error:", err));
      } else {
        // دانلود فایل غیر ویدیویی
        const downloadUrl = URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error("Failed to download the file.");
    }
  };

  // اشتراک‌گذاری فایل
  const handleShare = async () => {
    try {
      const shareUrl = `https://cgl1106.cinnagen.com:9020/shareFile/?FileGUID=${encodeURIComponent(
        fileId
      )}`;
      const shareMessage = `این فایل مورد نظر جهت دانلود میباشد: ${shareUrl}`;

      const shareData = {
        title: `Check out this file: ${fileName}`,
        text: `File: ${fileName}\nDescription: ${fileDescription}\nUploaded By: ${uploadedBy}\nUploaded On: ${uploadedOn}\n\n${shareMessage}`,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("File shared successfully!");
      } else {
        const clipboardText = `File: ${fileName}\nDescription: ${fileDescription}\n${shareMessage}`;
        await navigator.clipboard.writeText(clipboardText);
        toast.success("File link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      toast.error("Failed to share the file.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
            <DropdownMenuShortcut>⌃⌥A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
            <DropdownMenuShortcut>⌃⌥E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLockToggle}>
            {isLocked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Lock
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        onShare={(email, permission) => {
          console.log("Share with:", email, permission);
          setShareDialogOpen(false);
        }}
      />

      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        fileName={fileName}
        onRename={(newName) => {
          onRename?.(newName);
          setRenameDialogOpen(false);
        }}
      />
    </>
  );
}
