"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTranslation } from "react-i18next"
import { useDirection } from "@/components/folder-manager/context"
import moment from "jalali-moment"
import { convertToJalali } from "@/lib/utils"

interface Viewer {
  CreatedBy: string
  FormattedDateTime: string
}

interface ViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  viewerData: Viewer[]
}

export function ViewerDialog({ isOpen, onClose, viewerData }: ViewerDialogProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()

  const formatDate = (dateString: string) => {
    const date = moment(dateString);
    if (dir === 'rtl') {
      const jalaliDate = moment(dateString, "YYYY/MM/DD - HH:mm")
      .locale("fa") // Set Persian locale
      .format(" HH:mm - jYYYY/jMM/jDD"); // Convert to Jalali
      return jalaliDate;
    }
    if (dir === 'ltr') {
    return dateString
    }
  };

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
                // viewerData.map((viewer, index) => (
                //   <TableRow key={index}>
                //     <TableCell className={`${dir === 'rtl' ? 'text-right pr-4' : ''}`}>{viewer.CreatedBy}</TableCell>
                //     <TableCell className={`${dir === 'rtl' ? 'text-right pr-4' : ''}`}>{formatDate(viewer.FormattedDateTime)}</TableCell>
                //   </TableRow>
                // ))
                viewerData
                  .sort((a, b) => moment(b.FormattedDateTime, "YYYY/MM/DD - HH:mm").valueOf() - moment(a.FormattedDateTime, "YYYY/MM/DD - HH:mm").valueOf())
                  .map((viewer, index) => (
                    <TableRow key={index}>
                      <TableCell className={`${dir === 'rtl' ? 'text-right pr-4' : ''}`}>{viewer.CreatedBy}</TableCell>
                      <TableCell className={`${dir === 'rtl' ? 'text-right pr-4' : ''}`}>{formatDate(viewer.FormattedDateTime)}</TableCell>
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
