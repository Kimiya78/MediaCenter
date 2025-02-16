"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RenameDialogProps {
  isOpen: boolean
  onClose: () => void
  objectName: string
  objectType: string
  onRename: (newName: string) => void
}

export function RenameDialog({
  isOpen,
  onClose,
  objectName,
  objectType,
  onRename
}: RenameDialogProps) {
  const [newName, setNewName] = useState(objectName)

  useEffect(() => {
    if (isOpen) {
      setNewName(objectName)
    }
  }, [isOpen, objectName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName && newName.trim() && newName !== objectName) {
      onRename(newName.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Rename {objectType}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newName">New Name</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newName || newName.trim() === "" || newName === objectName}
            >
              Rename
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}