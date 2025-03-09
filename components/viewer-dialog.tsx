"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTranslation } from "react-i18next"
import { useDirection } from "@/components/folder-manager/context"

interface Viewer {
  CreatedBy: string
  DateTime: string
}

interface ViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  viewerData: Viewer[]
}

export function ViewerDialog({ isOpen, onClose, viewerData }: ViewerDialogProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()
  const formatDateTime = (dateTime: string): string => {
    if (!dateTime) return ""; // Handle empty or invalid datetime strings
    const dateObject = new Date(dateTime);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(dateObject.getDate()).padStart(2, '0');
    const hours = String(dateObject.getHours()).padStart(2, '0');
    const minutes = String(dateObject.getMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
  }
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[800px]  [&>button.absolute]:hidden ${dir === 'rtl' ? 'font-[IranYekanBakh] rtl' : ''}`}>
        <DialogHeader className={dir === 'rtl' ? 'text-right' : ''}>
          <DialogTitle className={dir === 'rtl' ? 'text-right' : ''}>{t("viewerDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[450px] overflow-y-auto">
          <Table className={dir === 'rtl' ? 'text-right' : ''}>
            <TableHeader>
              <TableRow>
                <TableHead className={dir === 'rtl' ? 'text-right pr-4' : ''}>{t("viewerDialog.person")}</TableHead>
                <TableHead className={dir === 'rtl' ? 'text-right pr-4' : ''}>{t("viewerDialog.downloadedAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewerData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className={`text-center ${dir === 'rtl' ? 'font-[IranYekanBakh]' : ''}`}>
                    {t("viewerDialog.noViewersAvailable")}
                  </TableCell>
                </TableRow>
              ) : (
                viewerData.map((viewer, index) => (
                  <TableRow key={index}>
                    <TableCell className={`${dir === 'rtl' ? 'text-right pr-4' : ''}`}>{viewer.author}</TableCell>
                    <TableCell className={`${dir === 'rtl' ? 'text-right pr-4' : ''}`}>{viewer.DateTime}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter className={dir === 'rtl' ? 'justify-start' : ''}>
          <Button onClick={onClose} className={dir === 'rtl' ? 'font-[IranYekanBakh]' : ''}>{t("viewerDialog.close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
