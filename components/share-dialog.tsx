"use client"

import { useState } from "react"
import type { FilePermission } from "@/types/file"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
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
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useDirection } from "@/components/folder-manager/context"
import { cn } from "@/lib/utils"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  onShare: (email: string, permission: FilePermission) => void
  shareUrl: string
}

export function ShareDialog({ isOpen, onClose, onShare, shareUrl }: ShareDialogProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()
  const [email, setEmail] = useState("")
  const [permission, setPermission] = useState<FilePermission>("viewer")
  const [emailError, setEmailError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    return emailRegex.test(email)
  }

  const handleShare = () => {
    if (!validateEmail(email)) {
      setEmailError(t('share.emailError'))
      return
    }
    setEmailError("")
    onShare(email, permission)
    setEmail("")
    setPermission("viewer")
    onClose()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success(t('share.linkCopied'))
    } catch (error) {
      toast.error(t('share.copyError'))
    }
  }

  const rtlClass = dir === "rtl" ? "text-right" : "text-left"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-[500px]", rtlClass)}>
        <DialogHeader className={rtlClass}>
          <DialogTitle>{t('share.title')}</DialogTitle>
          <DialogDescription>{t('share.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="email" className={rtlClass}>
              {t('share.emailLabel')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t('share.emailPlaceholder')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
              }}
              className={cn(emailError ? "border-red-500" : "", rtlClass)}
              dir={dir}
            />
            {emailError && <span className={cn("text-sm text-red-500", rtlClass)}>{emailError}</span>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="permission" className={rtlClass}>
              {t('share.permissionLabel')}
            </label>
            <div className={rtlClass}>
              <Select dir={dir} value={permission} onValueChange={(value) => setPermission(value as FilePermission)}>
                <SelectTrigger className={rtlClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    {t('share.permissionViewer')}
                  </SelectItem>
                  <SelectItem value="cooperative">
                    {t('share.permissionCooperative')}
                  </SelectItem>
                  <SelectItem value="owner">
                    {t('share.permissionOwner')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2 mt-4">
            <label className={rtlClass}>
              {t('share.linkLabel')}
            </label>
            <div className={cn("flex gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
              <Input
                readOnly
                value={shareUrl}
                className={cn("flex-1", rtlClass)}
                dir={dir}
              />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className={cn("sm:justify-end gap-2", dir === "rtl" ? "flex-row-reverse" : "flex-row")}>
          <Button variant="outline" onClick={onClose}>
            {t('share.cancel')}
          </Button>
          <Button onClick={handleShare} disabled={!email}>
            {t('share.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

