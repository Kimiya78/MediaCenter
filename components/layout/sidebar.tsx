"use client";

import { ChevronDown, ChevronRight, FolderClosed, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import NexxFetch from "@/hooks/response-handling";
import { FolderItem } from "@/types/type";
import { useFolder } from "@/components/folder-manager/context"; // Import useFolder
import ConfigURL from "@/config";
import FolderContextMenu from "@/components/folder-manager/folder-contextMenu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDirection } from "@/components/folder-manager/context"



export function Sidebar() {
  const navigationItemsUrl = `${ConfigURL.baseUrl}/get-allFolder`;
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: number | null, ParentFolderID: number | null, folderName: string } | null>(null);
  const [announcement, setAnnouncement] = useState<{ oldName: string; newName: string } | null>(null);
  const [folderList, setFolderList] = useState<FolderItem[]>([]); // Local state for folder list
  const { dir } = useDirection();

  const { data, isLoading, error } = NexxFetch.useGetData<{ folders: FolderItem[] }>(
    navigationItemsUrl,
    ["Folders"]
  );

  // Use selectedFolderId and setSelectedFolderId from the context
  const { selectedFolderId, setSelectedFolderId, setSelectedFoldersArray } = useFolder();

  if (isLoading) return <p>Loading folders...</p>;
  if (error) return <p>Error loading folders: {error.message}</p>;

  // Initialize folderList with data if it's not already set
  if (data?.folders && folderList.length === 0) {
    setFolderList(data.folders);
  }

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

    Object.values(folders).forEach((folder) => {
      folderMap[folder.FolderID] = { ...folder, children: [] };
    });

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

  const handleRightClick = (event: React.MouseEvent, folderId: number, ParentFolderID: number, folderName: string) => {
    event.preventDefault();
    setContextMenu({ x: event.pageX, y: event.pageY, folderId, ParentFolderID, folderName });
  };

  const folderTree = buildFolderTree(uniqueFolders);

  // Function to get the selected folder and its parents
  const getParentFolders = (folderId: number, folders: typeof uniqueFolders): { id: number; name: string }[] => {
    const selectedFolders: { id: number; name: string }[] = [];
    let currentFolderId = folderId;

    while (currentFolderId) {
      const folder = folders[currentFolderId];
      if (folder) {
        selectedFolders.unshift({ id: folder.FolderID, name: folder.FolderName });
        currentFolderId = folder.ParentFolderID || null;
      } else {
        break;
      }
    }

    return selectedFolders;
  };

  const renderFolderTree = (folders: (FolderItem & { children: any[] })[]) => {
    return folders.map((folder) => {
      const isExpanded = expandedFolders.has(folder.FolderID);
      const hasChildren = folder.children && folder.children.length > 0;
      const isSelected = folder.FolderID === selectedFolderId; // Use selectedFolderId from context

      return (
        <div key={folder.FolderID} className="ml-3 nx-sideBar pr-4 rtl:pr-4">
          <div
            className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer 
              transition-all 
              ${isSelected ? "bg-muted w-full" : ""}
            `}
            style={{
              width: "100%",
            }}
            onClick={() => {
              setSelectedFolderId(folder.FolderID); // Update selectedFolderId in context
              const parentFolders = getParentFolders(folder.FolderID, uniqueFolders);
              setSelectedFoldersArray(parentFolders); // Update breadcrumb
            }}
            onContextMenu={(e) => handleRightClick(e, folder.FolderID, folder.ParentFolderID, folder.FolderName)}
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3
                      className={`font-medium text-sm truncate max-w-[80px] ${
                        folder.PasswordRequired ? "text-red-500" : ""
                      }`}
                    >
                      {folder.FolderName}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start" className="max-w-[110px]">
                    <p className="text-sm">{folder.FolderName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {hasChildren && isExpanded && <div className="ml-3">{renderFolderTree(folder.children)}</div>}
        </div>
      );
    });
  };

  return (
    <div className="w-64 h-screen border-r bg-background text-foreground">
      <div className="p-4 flex flex-col h-full">
        <h1 className="text-xl font-bold mb-8">{dir === "rtl" ? "پوشه ها" : "Folders"}</h1>
        <nav className="space-y-2">{renderFolderTree(folderTree)}</nav>
      </div>

      {contextMenu && (
        <FolderContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          folderId={contextMenu.folderId!}
          parentFolderId={contextMenu.ParentFolderID}
          onClose={() => setContextMenu(null)}
          onFolderUpdate={(newName) => {
            setFolderList((prevFolders) =>
              prevFolders.map((folder) =>
                folder.FolderID === contextMenu.folderId ? { ...folder, FolderName: newName } : folder
              )
            );
            setAnnouncement({ oldName: contextMenu.folderName, newName });
          }}
          onFolderDelete={(folderId) => {
            setFolderList((prevFolders) => prevFolders.filter((folder) => folder.FolderID !== folderId));
            setAnnouncement(null);
          }}
          setAnnouncement={setAnnouncement}
          folderName={folderList.find(folder => folder.FolderID === contextMenu.folderId)?.FolderName || ""}
        />
      )}

      {announcement && (
        <div className="fixed bottom-4 left-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">

          <span>{dir === "rtl" ? `( ${announcement.newName} ) تغییر یافت به ( ${announcement.oldName} )` : `( ${announcement.oldName} ) renamed to ( ${announcement.newName} )`}</span>
          <button
            onClick={() => setAnnouncement(null)}
            className="hover:bg-gray-800 p-1 rounded"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}