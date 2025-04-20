"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ConfigURL from "@/config";
import { Trash, FolderPlus, Edit, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { RenameDialog } from "@/components/rename-dialog";
import { CreateDialog } from "@/components/create-dialog";
import { useDirection } from "@/components/folder-manager/context";

interface ContextMenuProps {
  x: number;
  y: number;
  folderId: number;
  onClose: () => void;
  onFolderUpdate: (newName: string) => void; // Update the type to accept newName
  onFolderDelete: (folderId: number) => void;
  parentFolderId?: number | null;
  setAnnouncement: (announcement: { oldName: string; newName: string } | null) => void;
  folderName: string;
}

export default function FolderContextMenu({
  x,
  y,
  folderId,
  onClose,
  onFolderUpdate,
  onFolderDelete,
  parentFolderId = null,
  setAnnouncement,
  folderName,
}: ContextMenuProps) {
  const contextMenuRef = useRef<HTMLUListElement | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentFolderName, setCurrentFolderName] = useState(folderName);
  const { dir } = useDirection();
  // Update currentFolderName when folderName prop changes
  useEffect(() => {
    setCurrentFolderName(folderName);
  }, [folderName]);

  // Handle clicking outside the context menu only
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target as Node) &&
      !(event.target as Element).closest('[role="dialog"]')
    ) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // API Call to Create a New Folder
  const handleCreateFolder = async (name: string, description: string, password?: string) => {
    try {
      const response = await axios.post(
        `${ConfigURL.baseUrl}/createFolder`,
        {
          ParentFolderID: folderId,
          FolderName: name.trim(),
          FolderDescription: description.trim(),
          PasswordHash: password || null,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        toast.success('Folder created successfully');
        setShowCreateDialog(false);
        onClose();
         //onFolderUpdate(name); Update the parent state with the new folder name
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Error creating folder. Please try again.');
    }
  };

  // API Call to Rename a Folder
  const handleRename = async (newName: string) => {
    try {
      const oldName = currentFolderName; // Capture the old name before renaming
      const response = await axios.put(
        `${ConfigURL.baseUrl}/editFolder`,
        {
          FolderID: folderId,
          FolderName: newName.trim(),
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setAnnouncement({ oldName, newName: newName.trim() });
        setTimeout(() => setAnnouncement(null), 5000); // Hide after 5 seconds
        setRenameDialogOpen(false);
        onClose();
        onFolderUpdate(newName); // Update the parent state with the new folder name
        setCurrentFolderName(newName.trim()); // Update the current folder name state
      }
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Error renaming folder. Please try again.");
    }
  };

  // API Call to Delete Folder
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        `${ConfigURL.baseUrl}/deleteFolder`,
        {
          data: {
            FolderID: folderId,
            PasswordHash: null,
          },
          headers: { "Content-Type": "application/json" }
        }
      );

      if (response.status === 200) {
        toast.success("Folder deleted successfully");
        onFolderDelete(folderId);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Error deleting folder. Please try again.");
    }
  };

  return (
    <>
      {/* Context Menu */}
      <ul
        ref={contextMenuRef}
        className="absolute shadow-md border rounded-md w-40 py-2 z-50 bg-background text-foreground"
        style={{
          top: y,
          left: dir === 'ltr' ? x : undefined, 
          right: dir === 'rtl' ? window.innerWidth - x : undefined, 
        }}
      >
        <li
          className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
          onClick={() => setShowCreateDialog(true)}
        >
          <FolderPlus size={16} /> New Folder
        </li>
        <li
          className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
          onClick={() => setRenameDialogOpen(true)}
        >
          <Edit size={16} /> Rename
        </li>
        <li
          className="px-4 py-2 hover:bg-red-500 text-red-500 hover:text-white cursor-pointer flex items-center gap-2"
          onClick={handleDelete}
        >
          <Trash size={16} /> Delete
        </li>
      </ul>

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        objectName={currentFolderName}
        objectType="Folder"
        onRename={handleRename}
      />

      {/* Create Dialog */}
      <CreateDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateFolder}
      />
    </>
  );
}