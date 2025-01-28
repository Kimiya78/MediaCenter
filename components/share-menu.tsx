"use client";

import axios from "axios"; // اضافه کردن Axios
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

interface ShareMenuProps {
  fileId: string;
  fileName: string;
  attachmentUrlGuid: string; // اضافه کردن پارامتر جدید برای AttachmentURLGUID
  trigger: React.ReactNode;
  isLocked?: boolean;
  onLockToggle?: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
}

export function ShareMenu({
  fileId,
  fileName,
  attachmentUrlGuid,
  trigger,
  isLocked,
  onLockToggle,
  onDelete,
  onRename,
}: ShareMenuProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const handleCopyLink = async () => {
    const link = `https://your-domain.com/files/${fileId}`;
    await navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard");
  };

  const handleDownload = async () => {
    try {
      const downloadUrl = "https://cgl1106.cinnagen.com:9020/downloading_file";

      const response = await axios.post(
        downloadUrl,
        {
          FileGUID: fileId, // مقدار داینامیک از props
          AttachmentURLGUID: attachmentUrlGuid, // مقدار داینامیک از props
          PasswordClear: "", // رمز عبور (می‌توان آن را نیز داینامیک کرد)
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob", // مهم: برای دریافت فایل به صورت باینری
        }
      );

      const contentType = response.headers["content-type"] || "";
      const contentDisposition = response.headers["content-disposition"] || "";
      const videoTypes = ["mp4", "webm", "ogg", "avi", "mkv", "quicktime", "video/mp4"];
      const isVideo = videoTypes.some((type) => contentType.includes(type));

      // استخراج نام فایل از Content-Disposition یا مقدار پیش‌فرض
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : fileName;

      if (isVideo) {
        // نمایش ویدیو
        const videoContainer = document.getElementById("videoContainer");
        if (!videoContainer) {
          throw new Error("Video container element not found.");
        }

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
      const errorMessage =
        error.response?.data?.error || "Failed to download the file. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
            <DropdownMenuShortcut>⌃⌥A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
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
