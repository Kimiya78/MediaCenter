"use client";

import { createContext, useContext, useState } from "react";

interface FolderContextProps {
  selectedFolderId: number | null;
  setSelectedFolderId: (id: number) => void;
}

const FolderContext = createContext<FolderContextProps | undefined>(undefined);

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  return (
    <FolderContext.Provider value={{ selectedFolderId, setSelectedFolderId }}>
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