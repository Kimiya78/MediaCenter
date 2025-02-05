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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Viewers</DialogTitle>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto">
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
                    <TableCell>{viewer.createdDateTime}</TableCell>
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

