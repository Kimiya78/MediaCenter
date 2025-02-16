"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description: string, password?: string) => void
}

export function CreateDialog({ isOpen, onClose, onCreate }: CreateDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [folderDescription, setFolderDescription] = useState("")
  const [folderPassword, setFolderPassword] = useState("")

  useEffect(() => {
    if (isOpen) {
      setFolderName("")
      setFolderDescription("")
      setFolderPassword("")
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (folderName.trim()) {
      onCreate(
        folderName.trim(),
        folderDescription.trim(),
        folderPassword.trim() || ""
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folderDescription">Description</Label>
            <Input
              id="folderDescription"
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
              placeholder="Enter folder description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folderPassword">Password (Optional)</Label>
            <Input
              id="folderPassword"
              type="password"
              value={folderPassword}
              onChange={(e) => setFolderPassword(e.target.value)}
              placeholder="Enter folder password"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}