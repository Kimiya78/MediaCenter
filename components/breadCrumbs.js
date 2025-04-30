"use client"; // Ensures this runs on the client side

import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useFolder } from "@/components/folder-manager/context";
import { useEffect } from "react";

export default function Breadcrumbs() {
  const { selectedFoldersArray, setSelectedFolderId, setSelectedFoldersArray } = useFolder(); // Get folder navigation data and setters from context

  // Update document title whenever selectedFoldersArray changes
  useEffect(() => {
    if (selectedFoldersArray && selectedFoldersArray.length > 0) {
      const breadcrumbPath = ['Media Center', ...selectedFoldersArray.map(folder => folder.name)];
      document.title = breadcrumbPath.join(' > ');
    } else {
      document.title = 'Media Center';
    }
  }, [selectedFoldersArray]);

  if (!selectedFoldersArray || selectedFoldersArray.length === 0) return null;

  // Handle breadcrumb item click
  const handleBreadcrumbClick = (folderId) => {
    // Find the folder and its parents to update the selectedFoldersArray
    const clickedFolderIndex = selectedFoldersArray.findIndex((folder) => folder.id === folderId);
    if (clickedFolderIndex !== -1) {
      const newSelectedFolders = selectedFoldersArray.slice(0, clickedFolderIndex + 1);
      setSelectedFoldersArray(newSelectedFolders); // Update selectedFoldersArray
      setSelectedFolderId(folderId); // Update selectedFolderId
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {selectedFoldersArray.map((folder, index) => {
          const isLast = index === selectedFoldersArray.length - 1;
          const href = `/${selectedFoldersArray.slice(0, index + 1).map(f => f.id).join("/")}`;

          return (
            <BreadcrumbItem key={folder.id}>
              <BreadcrumbSeparator>
                <Slash />
              </BreadcrumbSeparator>
              {isLast ? (
                <BreadcrumbPage>{folder.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={href}
                  className="capitalize"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default link behavior
                    handleBreadcrumbClick(folder.id); // Handle click to update selected folder
                  }}
                >
                  {folder.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}