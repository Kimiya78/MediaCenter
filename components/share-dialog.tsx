"use client"

import { useState } from "react"
import type { FilePermission } from "@/types/file"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  onShare: (email: string, permission: FilePermission) => void
}

export function ShareDialog({ isOpen, onClose, onShare }: ShareDialogProps) {
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<FilePermission>("viewer")

  const handleShare = () => {
    onShare(email, permission)
    setEmail("")
    setPermission("viewer")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>Add people and set their access level</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="email">Email address</label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="permission">Permission level</label>
            <Select value={permission} onValueChange={(value) => setPermission(value as FilePermission)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="cooperative">Cooperative</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={!email}>
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

