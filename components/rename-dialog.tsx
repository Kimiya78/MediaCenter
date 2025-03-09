"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import { useDirection } from "@/components/folder-manager/context"


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

  const { t } = useTranslation()
  const { dir } = useDirection()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{dir === 'rtl' ? t("renameDialog.title") : `${t("renameDialog.title")} ${objectType}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newName">{t("renameDialog.newName")}</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("renameDialog.newNamePlaceholder")}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("renameDialog.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!newName || newName.trim() === "" || newName === objectName}
            >
              {t("renameDialog.rename")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}