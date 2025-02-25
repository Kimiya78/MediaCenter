"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import ConfigURL from "@/config";
import { UpsertLinksDialog } from "@/components/upsertLinks-dialog";
import NexxFetch from "@/hooks/response-handling";
import { useDirection } from "@/components/folder-manager/context";

// Adjusted Link interface to match the structure of the API response.
interface Link {
  AttachmentURLGUID: string;
  FileGUID: string;
  ExpiresOnDate: string;
  IsAnonymous: boolean;
  CreatedByID: number;
  CreatedDateTime: string;
  NeedPassword: boolean;
}

interface LinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileGUID: string;
}

export default function LinksDialog({ isOpen, onClose, fileGUID }: LinksDialogProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const navigationItemsUrl = `${ConfigURL.baseUrl}/get_url?FileGUID=${fileGUID}`;
  const { data, isLoading, error: fetchError, refetch } = NexxFetch.useGetData<{ AttachmentURL: Link[] }>(
    navigationItemsUrl,
    [fileGUID]
  );

  // Dynamically fetch the direction from the context
  const { dir } = useDirection();

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, fileGUID, refetch]);

  useEffect(() => {
    if (data?.AttachmentURL) {
      setLinks(data.AttachmentURL);
    } else {
      setLinks([]);
    }
  }, [data]);

  const handleDownload = (link: Link) => {
    console.log("Downloading file with AttachmentURLGUID:", link.AttachmentURLGUID);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{dir === "rtl" ? "لینک‌ها" : "Links"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <UpsertLinksDialog attachmentURLGUID={fileGUID} correlationGuid={fileGUID} mode="c" />
          {isLoading && <p>{dir === "rtl" ? "در حال بارگذاری..." : "Loading..."}</p>}
          {fetchError && <p>{dir === "rtl" ? "خطا در دریافت لینک‌ها" : "Error fetching links"}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dir === "rtl" ? "دریافت فایل" : "Download"}</TableHead>
                <TableHead>{dir === "rtl" ? "تاریخ انقضا" : "Expires On"}</TableHead>
                <TableHead>{dir === "rtl" ? "دسترسی همگانی" : "Anonymous"}</TableHead>
                <TableHead>{dir === "rtl" ? "رمزگذاری شده" : "Passcode"}</TableHead>
                <TableHead>{dir === "rtl" ? "ایجاد کننده" : "Created By"}</TableHead>
                <TableHead>{dir === "rtl" ? "تاریخ بارگذاری" : "Created On"}</TableHead>
                <TableHead>{dir === "rtl" ? "ویرایش" : "Edit"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {dir === "rtl" ? "لینکی موجود نیست." : "No links available."}
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.AttachmentURLGUID}>
                    <TableCell>
                      <Button variant="ghost" onClick={() => handleDownload(link)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {link.ExpiresOnDate
                        ? new Date(link.ExpiresOnDate).toLocaleString()
                        : dir === "rtl"
                        ? "بدون انقضا"
                        : "No Expiration"}
                    </TableCell>
                    <TableCell>{link.IsAnonymous ? (dir === "rtl" ? "بله" : "Yes") : dir === "rtl" ? "خیر" : "No"}</TableCell>
                    <TableCell>{link.NeedPassword ? (dir === "rtl" ? "بله" : "Yes") : dir === "rtl" ? "خیر" : "No"}</TableCell>
                    <TableCell>{link.CreatedByID}</TableCell>
                    <TableCell>{new Date(link.CreatedDateTime).toLocaleString()}</TableCell>
                    <TableCell>
                      <UpsertLinksDialog
                        attachmentURLGUID={link.AttachmentURLGUID}
                        correlationGuid={fileGUID}
                        mode="u"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>{dir === "rtl" ? "بستن" : "Close"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}