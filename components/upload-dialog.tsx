"use client"

import { useState, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, description: string) => void
  destination?: string
}

export function UploadDialog({ isOpen, onClose, onUpload, destination }: UploadDialogProps) {
  const [description, setDescription] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    debugger
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
  
    const formData = new FormData();
    formData.append("EntityGUID", "0xBD4A81E6A803"); // Replace with actual GUID if applicable
    formData.append("EntityDataGUID", "0x85AC4B90382C"); // Replace if applicable
    formData.append("ServiceCategoryID", ""); // Change if necessary
    formData.append("ItemID", ""); // Change if necessary
    formData.append("Description", description || ""); // Ensure description is not null
    formData.append("ParentfolderId", "6"); // Ensure parentFolderId is not null
    formData.append("file", selectedFile);
  
    setUploading(true); // Set uploading to true before starting the request
    try {
      const response = await fetch("https://cgl1106.cinnagen.com:9020/create", {
        method: "POST",
        body: formData,
   /*     headers: {
          'Content-Type': 'application/json',
        },*/
      });
  
      if (response.ok) {
        const data = await response.json();
        alert("File uploaded successfully!");
        console.log(data);
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Something went wrong!"}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    } finally {
      setUploading(false); // Reset uploading state
      setProgress(0); // Reset progress after upload is done
      onClose(); // Close the dialog after upload
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="space-y-0.5">
            <DialogTitle>Upload File</DialogTitle>
            {destination && <p className="text-sm text-muted-foreground">Uploading to: {destination}</p>}
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {selectedFile ? (
            <div className="border-2 border-dashed rounded-lg p-4 text-center">{selectedFile.name}</div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? "border-primary" : "border-muted"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
              <p className="text-sm text-muted-foreground">Drag and drop a file here, or click to select</p>
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (required)
            </label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">Uploading...</p>
            </div>
          )}

          <Button onClick={handleSubmit} disabled={!selectedFile || !description || uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

