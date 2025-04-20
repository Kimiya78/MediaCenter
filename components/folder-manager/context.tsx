"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Folder Context (No changes here)
interface FolderContextProps {
  selectedFolderId: number | null;
  setSelectedFolderId: (id: number) => void;
  selectedFoldersArray: { id: number; name: string }[]; 
  setSelectedFoldersArray: (folders: { id: number; name: string }[]) => void; 
}

const FolderContext = createContext<FolderContextProps | undefined>(undefined);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedFoldersArray, setSelectedFoldersArray] = useState<{ id: number; name: string }[]>([]); // Initialize selectedFoldersArray
  return (
    <FolderContext.Provider value={{ selectedFolderId, setSelectedFolderId, selectedFoldersArray, setSelectedFoldersArray }}>
      {children}
    </FolderContext.Provider>
  );
}


export function useFolder() {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error("useFolder must be used within a FolderProvider");
  }
  return context;
}

// Direction Context (NEW)
interface DirectionContextProps {
  dir: "ltr" | "rtl";
  toggleDirection: () => void;
}

const DirectionContext = createContext<DirectionContextProps | undefined>(undefined);

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const [dir, setDir] = useState<"ltr" | "rtl">(() => localStorage.getItem("dir") as "ltr" | "rtl" || "ltr");

  useEffect(() => {
    document.documentElement.dir = dir;
    localStorage.setItem("dir", dir);
  }, [dir]);

  const toggleDirection = () => {
    setDir((prev) => (prev === "ltr" ? "rtl" : "ltr"));
  };

  return (
    <DirectionContext.Provider value={{ dir, toggleDirection }}>
      {children}
    </DirectionContext.Provider>
  );
}

export function useDirection() {
  const context = useContext(DirectionContext);
  if (!context) {
    throw new Error("useDirection must be used within a DirectionProvider");
  }
  return context;
}

