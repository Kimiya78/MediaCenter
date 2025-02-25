"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Share2, Download, Lock, Unlock, Trash, Edit2 , Eye , Key , Link } from "lucide-react";
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
import ConfigURL from "@/config";
import { ViewerDialog } from "@/components/viewer-dialog"
import { PasswordDialog } from "@/components/password-dialog";
import LinksDialog  from "@/components/links-dialog";

interface ShareMenuProps {
  fileId: string;
  fileName: string;
  fileDescription: string;
  fileSize: string;
  uploadedBy: string;
  uploadedOn: string;
  attachmentUrlGuid: string; 
  correlationGuid: string; 
  folderId: string; 
  requiresPassword: boolean; 
  trigger: React.ReactNode;
  isLocked?: boolean;
  onLockToggle?: () => void;
  onDelete?: () => void;
  onRename?: (newName: string) => void;
  onFileRemove?: (correlationGuid: string) => void; 
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const correctPassword = "";

  const handlePasswordSubmit = (enteredPass: string) => {
    console.log("Password entered:", enteredPass);

  };


  const [isLinksDialogOpen, setLinksDialogOpen] = useState(false);
  const [linksData, setLinksData] = useState<any[]>([]);
  

  const handleLinksClick = async () => {
    setLinksDialogOpen(true);
  };

  const closeLinksDialog = () => {
    setLinksDialogOpen(false);
  };


  // **Manage download file**
  
  const handleDownload = async () => {
    try {
      const downloadUrl = `${ConfigURL.baseUrl}/downloading_file`;

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
      // ✅ New share URL using correlationGuid
      const shareUrl = `${ConfigURL.baseUrl}/share?CorrelationGUID=${encodeURIComponent(correlationGuid)}`;
      
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
        await navigator.clipboard.writeText(shareMessage);
        toast.success("File link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      toast.error("Failed to share the file.");
    }
  };
  

  // **Manage rename file**
  const handleRename = async (newName: string) => {
    try {
      const response = await axios.put(
        `${ConfigURL.baseUrl}/rename`,
        {
          CorrelationGUID: correlationGuid,
          FileName: newName,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (response.status === 200) {
        toast.success("File renamed successfully.");
  
        if (onRename) {
          onRename(fileId, newName); // 🔥 Immediately tell parent to update UI
        }
      } else {
        toast.error("Failed to rename the file.");
      }
    } catch (error) {
      console.error("Error renaming file:", error);
      toast.error("Error renaming file. Please try again.");
    }
  };
  


  // **Manage delete file**
  const handleDelete = async () => {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the file "${fileName}"?`
      );
      if (!confirmDelete) return;
      debugger
      const deleteUrl = `${ConfigURL.baseUrl}/delete`;

      const response = await axios.delete(deleteUrl, {
        data: {
          CorrelationGUID: correlationGuid,
          FolderID: folderId,
          PasswordHash: null,
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
        `${ConfigURL.baseUrl}/get_viewers_info`,
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
        <DropdownMenuContent align="end" className="w-[200px] cursor-pointer">
          <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
            <Share2 className="mr-2 h-4 w-4  " />
            Share
            {/* <DropdownMenuShortcut>⌃⌥A</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDelete} className="text-destructive cursor-pointer">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)} className="cursor-pointer">
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
            <DropdownMenuShortcut> </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleViewer} className="cursor-pointer">
            <Eye className="mr-2 h-4 w-4" />
            Viewer
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onLockToggle} className="cursor-pointer">
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

          <DropdownMenuItem onClick={handlePasswordSubmit} className="cursor-pointer">
            <Key className="mr-2 h-4 w-4" />
            <button onClick={() => setIsDialogOpen(true)}>       pass      </button>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleLinksClick} className="cursor-pointer">
            <Link className="mr-2 h-4 w-4" />
            Links
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
        objectName={fileName}
        objectType="File"
        onRename={(newName) => {
          handleRename(newName)
          setRenameDialogOpen(false)
        }}
      />

      <PasswordDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        objectPass={correctPassword}
        onPasswordSubmit={handlePasswordSubmit}
      /> 


      {/* Viewer Popup */}
      {showViewerPopup && (

        <ViewerDialog isOpen={showViewerPopup} onClose={() => setShowViewerPopup(false)} viewerData={viewerData} />
      )}
      
      {/* Links Dialog */}
      {isLinksDialogOpen && (
        <LinksDialog isOpen={isLinksDialogOpen} onClose={closeLinksDialog} fileGUID={correlationGuid} />
      )}

    </> 
  );
}
