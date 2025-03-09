"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"

interface CreateDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, description: string, password?: string) => void
}

export function CreateDialog({ isOpen, onClose, onCreate }: CreateDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [folderDescription, setFolderDescription] = useState("")
  const [folderPassword, setFolderPassword] = useState("")
  const { t } = useTranslation()

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
          <DialogTitle>{t("createDialog.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">{t("createDialog.folderName")}</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={t("createDialog.folderNamePlaceholder")}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folderDescription">{t("createDialog.description")}</Label>
            <Input
              id="folderDescription"
              value={folderDescription}
              onChange={(e) => setFolderDescription(e.target.value)}
              placeholder={t("createDialog.descriptionPlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folderPassword">{t("createDialog.password")}</Label>
            <Input
              id="folderPassword"
              type="password"
              value={folderPassword}
              onChange={(e) => setFolderPassword(e.target.value)}
              placeholder={t("createDialog.passwordPlaceholder")}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("createDialog.cancel")}
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              {t("createDialog.create")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}