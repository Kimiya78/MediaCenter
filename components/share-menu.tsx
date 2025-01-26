"use client"

import { Copy, Share2, Download, Lock, Unlock, Trash, Edit2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import { ShareDialog } from "./share-dialog"
import { RenameDialog } from "./rename-dialog"
import { useState } from "react"
import { toast } from "sonner"

interface ShareMenuProps {
  fileId: string
  fileName: string
  trigger: React.ReactNode
  isLocked?: boolean
  onLockToggle?: () => void
  onDelete?: () => void
  onRename?: (newName: string) => void
}

export function ShareMenu({ fileId, fileName, trigger, isLocked, onLockToggle, onDelete, onRename }: ShareMenuProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)

  const handleCopyLink = async () => {
    const link = `https://your-domain.com/files/${fileId}`
    await navigator.clipboard.writeText(link)
    toast.success("Link copied to clipboard")
  }

  const handleDownload = () => {
    console.log("Downloading file:", fileId)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
            <DropdownMenuShortcut>⌃⌥A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy link
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRenameDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename
            <DropdownMenuShortcut>⌃⌥E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLockToggle}>
            {isLocked ? (
              <>
                <Unlock className="mr-2 h-4 w-4" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Lock
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        onShare={(email, permission) => {
          console.log("Share with:", email, permission)
          setShareDialogOpen(false)
        }}
      />

      <RenameDialog
        isOpen={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        fileName={fileName}
        onRename={(newName) => {
          onRename?.(newName)
          setRenameDialogOpen(false)
        }}
      />
    </>
  )
}

