'use client';

import { ChevronDown, FolderClosed } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Folder {
  FolderID: number;
  FolderName: string;
  FolderGUID: string;
  ParentFolderID: number | null;
  PasswordRequired: boolean;
  children: Folder[];
}

function FolderItem({ folder, depth = 0, toggleFolder }: { folder: Folder; depth?: number; toggleFolder: (id: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (toggleFolder) {
      setIsOpen(toggleFolder(folder.FolderID));
    }
  }, [toggleFolder, folder.FolderID]);

  return (
    <div className="w-full">
      <Link 
        href={`/folders/${folder.FolderGUID}`}
        className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg"
        style={{ marginLeft: `${depth * 1}rem` }}
      >
        {folder.children.length > 0 && (
          <ChevronDown 
            className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`}
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(!isOpen);
              toggleFolder(folder.FolderID);
            }}
          />
        )}
        <FolderClosed className="w-4 h-4" />
        <span className="truncate">{folder.FolderName}</span>
      </Link>
      {isOpen && folder.children.length > 0 && (
        <div className="space-y-1">
          {folder.children.map((child) => (
            <FolderItem key={child.FolderID} folder={child} depth={depth + 1} toggleFolder={toggleFolder} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [error, setError] = useState<string>("");
  const [openFolders, setOpenFolders] = useState<Set<number>>(new Set());

  function removeDuplicates(folders: Folder[]) {
    const seen = new Set();
    return folders.filter(folder => {
      if (seen.has(folder.FolderID)) {
        return false;
      } else {
        seen.add(folder.FolderID);
        return true;
      }
    });
  }

  function buildHierarchy(folders: Folder[]) {
    const map: Record<number, Folder> = {};
    const roots: Folder[] = [];

    folders = removeDuplicates(folders);

    folders.forEach(folder => {
      map[folder.FolderID] = { ...folder, children: [] };
    });

    folders.forEach(folder => {
      if (folder.ParentFolderID === null) {
        roots.push(map[folder.FolderID]);
      } else if (map[folder.ParentFolderID]) {
        map[folder.ParentFolderID].children.push(map[folder.FolderID]);
      }
    });

    return roots;
  }

  const toggleFolder = (folderID: number) => {
    setOpenFolders((prev) => {
      const newOpenFolders = new Set(prev);
      if (newOpenFolders.has(folderID)) {
        newOpenFolders.delete(folderID);
      } else {
        newOpenFolders.add(folderID);
      }
      return newOpenFolders;
    });
  };

  useEffect(() => {
    async function fetchFolders() {
      try {
        const response = await fetch('https://cgl1106.cinnagen.com:9020/get-allFolder');
        if (!response.ok) {
          throw new Error('Failed to fetch folders');
        }
        const data = await response.json();
        const hierarchy = buildHierarchy(data);
        setFolders(hierarchy);
      } catch (error) {
        setError("Failed to load folders. Please try again later.");
        console.error('Error fetching folders:', error);
      }
    }

    fetchFolders();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {folders.map((folder) => (
        <FolderItem key={folder.FolderID} folder={folder} toggleFolder={toggleFolder} />
      ))}
    </div>
  );
}
