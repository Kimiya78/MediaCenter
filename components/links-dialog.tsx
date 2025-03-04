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
import axios from "axios";
import { toast } from "sonner";

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
  AttachmentUrlGuid: string;
  FileID: string;
  fileName: string;
}

export default function LinksDialog({ isOpen, onClose, fileGUID , AttachmentUrlGuid , FileID , fileName}: LinksDialogProps) {
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
  }, [isOpen, fileGUID, , AttachmentUrlGuid , FileID , refetch]);

  useEffect(() => {
    if (data?.AttachmentURL) {
      setLinks(data.AttachmentURL);
    } else {
      setLinks([]);
    }
  }, [data]);


  const handleDownload = async () => {
    try {
      debugger
      const downloadUrl = `${ConfigURL.baseUrl}/downloading_file`;

      const response = await axios.post(
        downloadUrl,
        {
          FileGUID: FileID,
          AttachmentURLGUID: AttachmentUrlGuid,
          PasswordClear: "",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"] || "";
      const contentDisposition = response.headers["content-disposition"] || "";
      const videoTypes = ["mp4", "webm", "ogg", "avi", "mkv", "quicktime", "video/mp4"];
      const isVideo = videoTypes.some((type) => contentType.includes(type));

      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : fileName;

      if (isVideo) {
        const videoContainer = document.getElementById("videoContainer");
        if (!videoContainer) throw new Error("Video container not found.");

        videoContainer.innerHTML = "";

        const videoPlayer = document.createElement("video");
        videoPlayer.controls = true;
        videoPlayer.style.width = "100%";
        videoPlayer.style.height = "auto";

        const videoSource = document.createElement("source");
        videoSource.src = URL.createObjectURL(response.data);
        videoSource.type = contentType;

        videoPlayer.appendChild(videoSource);
        videoContainer.appendChild(videoPlayer);

        videoPlayer.load();
        videoPlayer.play().catch((err) => console.error("Video playback error:", err));
      } else {
        const downloadUrl = URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error("Failed to download the file.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{dir === "rtl" ? "لینک‌ها" : "Links"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <UpsertLinksDialog attachmentURLGUID={fileGUID} correlationGuid={fileGUID} mode="c" />

          {isLoading && 
            <div className="absolute top-0 left-0 right-0 bottom-0 flex flex-col justify-center items-center bg-white bg-opacity-50 z-50">
            <svg
              aria-hidden="true"
              className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            {/* Loading Text */}
            <p className="mt-4 text-gray-600 font-medium text-lg">{dir === "rtl" ? "در حال بارگذاری..." : "Loading..."}</p>
            </div>
          }

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
                    <TableCell>{link.CreatedBy}</TableCell>
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