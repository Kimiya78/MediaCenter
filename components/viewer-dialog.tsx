"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
      <DialogContent className="  sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Viewers</DialogTitle>
        </DialogHeader>
        <div className="max-h-[450px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Downloaded At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewerData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    No viewers available.
                  </TableCell>
                </TableRow>
              ) : (
                viewerData.map((viewer, index) => (
                  <TableRow key={index}>
                    <TableCell>{viewer.author}</TableCell>
                    <TableCell>{formatDateTime(viewer.FormattedDateTime)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

