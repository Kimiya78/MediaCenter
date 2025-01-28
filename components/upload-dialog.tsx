"use client"

import { useState, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { useUploadFile } from "@/hooks/use-upload-file"

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload?: (file: File, description: string) => void
  destination?: string
}

export function UploadDialog({ isOpen, onClose, onUpload, destination }: UploadDialogProps) {
  const [description, setDescription] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { uploadFile } = useUploadFile()

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

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !description) {
      toast.error("Please select a file and provide a description")
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append("EntityGUID", "0xBD4A81E6A803")
      formData.append("EntityDataGUID", "0x85AC4B90382C")
      formData.append("ServiceCategoryID", "")
      formData.append("ItemID", "")
      formData.append("Description", description)
      formData.append("ParentfolderId", "6")
      formData.append("file", selectedFile)

      const response = await uploadFile(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setProgress(percentCompleted)
      })

      if (response.success) {
        toast.success("File uploaded successfully")
        onUpload?.(selectedFile, description)
        onClose()
        setSelectedFile(null)
        setDescription("")
      } else {
        throw new Error(response.message || "Upload failed")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("Failed to upload file. Please try again.")
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [selectedFile, description, onUpload, onClose, uploadFile])

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
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <div className="flex items-center justify-between">
                <span className="text-sm truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors ${
                dragActive ? "border-primary" : "border-muted"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input 
                ref={inputRef} 
                type="file" 
                className="hidden" 
                onChange={handleChange}
                accept="*/*"
              />
              <p className="text-sm text-muted-foreground">
                Drag and drop a file here, or click to select
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description (required)
            </label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter a description for the file"
              rows={3} 
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || !description || uploading} 
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}