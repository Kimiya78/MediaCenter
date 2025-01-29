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
  correlationGuid: string; // CorrelationGUID
  folderId: string; // FolderID
  requiresPassword: boolean; // added: Does the file require a password?
  trigger: React.ReactNode;
  isLocked?: boolean;
  onLockToggle?: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
  onFileRemove?: (correlationGuid: string) => void; // For removing file from UI
}

export function ShareMenu({
  fileId,
  fileName,
  fileDescription,
  fileSize,
  uploadedBy,
  uploadedOn,
  attachmentUrlGuid,
  correlationGuid,
  folderId,
  requiresPassword,
  trigger,
  isLocked,
  onLockToggle,
  onDelete,
  onRename,
  onFileRemove,
}: ShareMenuProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [viewerData, setViewerData] = useState<any[]>([]);
  const [showViewerPopup, setShowViewerPopup] = useState(false);

  // **Manage download file**
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
          responseType: "blob",
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

  // **Manage share file**
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

  // **Manage delete file**
  // **Manage delete file**
  const handleDelete = async () => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the file "${fileName}"?`
      );
      if (!confirmDelete) return;

      const deleteUrl = "https://cgl1106.cinnagen.com:9020/delete";

      // Updated headers to include 'Accept' header
      const response = await axios.delete(deleteUrl, {
        data: {
          CorrelationGUID: correlationGuid,
          FolderID: folderId,
          PasswordHash: "",
        },
        headers: {
          "Content-Type": "application/json",  
          Accept: "application/json",         
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        toast.success("File deleted successfully.");
        onFileRemove?.(correlationGuid); 
      } else {
        toast.error("Failed to delete the file.");
      }
    } catch (error: any) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file. Please try again.");
    }
  };


  // **Manage viewers (new feature)**
  const handleViewer = async () => {
    try {
      const response = await axios.post(
        "https://cgl1106.cinnagen.com:9020/get_viewers_info",
        { FileGUID: fileId },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data && response.data.length > 0) {
        setViewerData(response.data);
      } else {
        setViewerData([]);
      }
      setShowViewerPopup(true);
    } catch (error) {
      toast.error("Failed to fetch viewer data.");
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
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
            <DropdownMenuShortcut> </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewer}>
            <Edit2 className="mr-2 h-4 w-4" />
            Viewer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLockToggle}>
            {requiresPassword ? (
              <>
                <Lock className="mr-2 h-4 w-4 text-red-500" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="mr-2 h-4 w-4 text-green-500" />
                Unlocked
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        onShare={(email, permission) => {
          console.log("Share with:", email, permission);
          setShareDialogOpen(false);
        }}
      />

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        fileName={fileName}
        onRename={(newName) => {
          onRename?.(newName);
          setRenameDialogOpen(false);
        }}
      />

      {/* Viewer Popup */}
      {showViewerPopup && (
        <div className="modal">
          <div className="modal-content">
            <h2>Viewers</h2>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Person</th>
                  <th className="border px-4 py-2">Downloaded At</th>
                </tr>
              </thead>
              <tbody>
                {viewerData.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="border px-4 py-2 text-center">
                      No viewers available.
                    </td>
                  </tr>
                ) : (
                  viewerData.map((viewer, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{viewer.person}</td>
                      <td className="border px-4 py-2">{viewer.downloadedAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button onClick={() => setShowViewerPopup(false)} className="close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
