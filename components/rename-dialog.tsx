"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface RenameDialogProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  onRename: (newName: string) => void
}

export function RenameDialog({ isOpen, onClose, fileName, onRename }: RenameDialogProps) {
  const [newName, setNewName] = useState(fileName)

  useEffect(() => {
    if (isOpen) {
      setNewName(fileName)
    }
  }, [isOpen, fileName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName && newName.trim() && newName !== fileName) {
      onRename(newName.trim())
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Rename File</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter new name" autoFocus />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newName || newName.trim() === "" || newName === fileName}>
              Rename
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

