"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslation } from "react-i18next"
import { useDirection } from "@/components/folder-manager/context"

interface RenameDialogProps {
  isOpen: boolean
  onClose: () => void
  objectName: string
  objectDescription?: string
  objectType: string
  onRename: (newName: string, description: string) => void; 
}

export function RenameDialog({ isOpen, onClose, objectName, objectType, objectDescription, onRename }: RenameDialogProps) {
  const [newName, setNewName] = useState(objectName)
  const [description, setDescription] = useState(objectDescription || "") // حالت جدید برای description
  const { t } = useTranslation()
  const { dir } = useDirection()

  const [initialDescription] = useState(objectDescription || ""); // مقدار اولیه توضیحات

  //console.log(" 🟡 نوع ابجکت :  " , objectType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim() && newName !== objectName) {
      try {
        await onRename(newName.trim(), description.trim())
        setNewName(newName.trim())
      } catch (error) {
        console.error("Error in rename operation:", error)
      }
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          setNewName(objectName)
          setDescription("") // Reset description when dialog closes
          onClose()
        }
      }}
    >
      <DialogContent 
        className={`sm:max-w-[425px] [&>button.absolute]:hidden ${dir === 'rtl' ? 'font-[IranYekanBakh] rtl' : ''}`}
        onPointerDownOutside={(e) => {
          e.preventDefault()
          onClose()
        }}
      >
        <DialogHeader>
          <DialogTitle className={dir === 'rtl' ? 'text-right' : ''}>
            {t("renameDialog.title")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newName" className={dir === 'rtl' ? 'text-right block' : ''}>
              {t("renameDialog.newName")}
            </Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("renameDialog.newNamePlaceholder")}
              className={dir === 'rtl' ? 'text-right' : ''}
              dir={dir}
              autoFocus
            />
          </div>

          {/* Conditional rendering of the description field */}
          {objectType === "File" && (
            <div className="space-y-2">
              <Label htmlFor="description" className={dir === 'rtl' ? 'text-right block' : ''}>
                {t("renameDialog.description")}
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("renameDialog.descriptionPlaceholder")}
                className={dir === 'rtl' ? 'text-right' : ''}
                dir={dir}
              />
            </div>
          )}

          <DialogFooter className={dir === 'rtl' ? 'justify-start flex-row-reverse' : ''}>
            <Button 
              type="submit"
              //disabled={!newName.trim() || newName === objectName}
              disabled={
                (!newName.trim() || newName === objectName) &&
                (description.trim() === initialDescription )// ✨ بررسی تغییر description
              }
              className={dir === 'rtl' ? 'font-[IranYekanBakh]' : ''}
            >
              {t("renameDialog.rename")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              // className={dir === 'rtl' ? 'font-[IranYekanBakh]' : ''}
            >
              {t("renameDialog.cancel")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}