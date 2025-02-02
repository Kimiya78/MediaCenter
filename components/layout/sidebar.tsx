"use client";

import { ChevronDown, ChevronRight, FolderClosed } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NexxFetch from "@/data/response-handling";
import { FolderItem } from "@/types/type";
import { useFolder } from "@/components/folder-manager/context"; // Import the useFolder hook

export function Sidebar() {
  const navigationItemsUrl = "https://cgl1106.cinnagen.com:9020/get-allFolder";
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null); // Track selected folder

  const { data, isLoading, error } = NexxFetch.useGetData<{ folders: FolderItem[] }>(
    navigationItemsUrl,
    ["Folders"]
  );

  const { setSelectedFolderId: updateContextFolder } = useFolder();

  if (isLoading) return <p>Loading folders...</p>;
  if (error) return <p>Error loading folders: {error.message}</p>;

  const folderList = data?.folders || [];
  if (!Array.isArray(folderList)) return <p>Error: Fetched data is not an array.</p>;

  // Deduplicate folders by FolderID while preserving permissions
  const uniqueFolders = folderList.reduce((acc, folder) => {
    if (!acc[folder.FolderID]) {
      acc[folder.FolderID] = {
        ...folder,
        permissions: [folder.PermissionId]
      };
    } else if (folder.PermissionId) {
      acc[folder.FolderID].permissions.push(folder.PermissionId);
    }
    return acc;
  }, {} as { [key: number]: FolderItem & { permissions: (number | null)[] } });

  const buildFolderTree = (folders: typeof uniqueFolders) => {
    const tree: (FolderItem & { children: any[] })[] = [];
    const folderMap: { [key: number]: FolderItem & { children: any[] } } = {};

    // Initialize the map with all folders
    Object.values(folders).forEach((folder) => {
      folderMap[folder.FolderID] = { ...folder, children: [] };
    });

    // Build the tree structure
    Object.values(folders).forEach((folder) => {
      if (folder.ParentFolderID) {
        const parent = folderMap[folder.ParentFolderID];
        if (parent) {
          parent.children.push(folderMap[folder.FolderID]);
        }
      } else {
        tree.push(folderMap[folder.FolderID]);
      }
    });

    return tree;
  };

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const folderTree = buildFolderTree(uniqueFolders);

  const renderFolderTree = (folders: (FolderItem & { children: any[] })[]) => {
    return folders.map((folder) => {
      const isExpanded = expandedFolders.has(folder.FolderID);
      const hasChildren = folder.children && folder.children.length > 0;
      const isSelected = folder.FolderID === selectedFolderId;

      return (
        <div key={folder.FolderID} className="ml-4 nx-sideBar">
          <div
            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
              isSelected ? "bg-[#668ed1]" : "hover:bg-muted"
            }`}
            onClick={() => {
              setSelectedFolderId(folder.FolderID);
              updateContextFolder(folder.FolderID);
            }}
          >
            <div className="flex items-center gap-2" onClick={() => hasChildren && toggleFolder(folder.FolderID)}>
              {hasChildren && (
                <div className="w-4 h-4">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 rtl:rotate-180" />
                  ) : (
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  )}
                </div>
              )}
              <FolderClosed className="w-4 h-4" />
              <Link href="#">
                <span className={folder.PasswordRequired ? "text-red-500" : ""}>{folder.FolderName}</span>
              </Link>
            </div>
          </div>
          {hasChildren && isExpanded && <div className="ml-4">{renderFolderTree(folder.children)}</div>}
        </div>
      );
    });
  };

  return (
    <div className="w-64 h-screen border-r bg-background text-foreground">
      <div className="p-4 flex flex-col h-full">
        <h1 className="text-xl font-bold mb-8">Folders</h1>
        <nav className="space-y-2">{renderFolderTree(folderTree)}</nav>
      </div>
    </div>
  );
}
