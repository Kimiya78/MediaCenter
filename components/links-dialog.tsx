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
import moment from "jalali-moment";
import { useTranslation } from "react-i18next";
import { PasswordDialog } from "@/components/password-dialog";

interface Link {
  AttachmentURLGUID: string;
  FileGUID: string;
  ExpiresOnDate: string;
  IsAnonymous: boolean;
  CreatedBy: number;
  CreatedDateTime: string;
  NeedPassword: boolean;
  Password?: string;
  IsInitialURL: boolean; 
}

interface LinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileGUID: string;
  AttachmentUrlGuid: string;
  FileID: string;
  fileName: string;
}

export default function LinksDialog({ isOpen, onClose, fileGUID, AttachmentUrlGuid, FileID, fileName }: LinksDialogProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const navigationItemsUrl = `${ConfigURL.baseUrl}/get_url?FileGUID=${fileGUID}`;
  const { data, isLoading, error: fetchError, refetch } = NexxFetch.useGetData(navigationItemsUrl, [fileGUID]);

  const { dir } = useDirection();
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, fileGUID, AttachmentUrlGuid, FileID, refetch]);

  
  useEffect(() => {
    if (data) {
      setLinks(data.AttachmentURL || []);
    } else {
      setLinks([]);
    }
  }, [data]);

  const handleDownloadClick = async (link: Link) => {
    setSelectedLink(link);
    if (link.NeedPassword) {
      setIsPasswordDialogOpen(true);
    } else {
      downloadFile(link, "");
    }
  };

  const downloadFile = async (link: Link, password: string = "") => {
    try {
      const downloadUrl = `${ConfigURL.baseUrl}/downloading_file`;

      const response = await axios.post(
        downloadUrl,
        {
          FileGUID: link.FileGUID,
          AttachmentURLGUID: link.AttachmentURLGUID,
          PasswordClear: password,
          Mode: 'r'
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
          validateStatus: (status) => status === 200 || status === 403
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
        toast.success("Video loaded successfully");
      } else {
        const downloadUrl = URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(downloadUrl);
        toast.success("Downloaded File successfully");
      }
    } catch (error: any) {
      console.error("Download error:", error);
      //toast.error("Failed to download the file");
    }
  };

  const handleDownload = async (password: string = "") => {
    if (!selectedLink) {
      toast.error("لینک مورد نظر یافت نشد");
      return;
    }
    downloadFile(selectedLink, password);
  };

  const formatDateTime = (dateString: string) => {
    if (dir === 'rtl') {
      const jalaliDate = moment(dateString, "YYYY/MM/DD - HH:mm")
        .locale("fa")
        .format("jYYYY/jMM/jDD"); // Removed time
      return jalaliDate;
    }
    if (dir === 'ltr') {
      return dateString.split(" - ")[0]; // Only return the date part
    }
  };

  const formatDate = (dateString: string) => {
    const date = moment(dateString);
    if (dir === 'rtl') {
      const jalaliDate = moment(dateString, "YYYY/MM/DD")
      .locale("fa")
      .format("jYYYY/jMM/jDD");
      return jalaliDate;
    }
    if (dir === 'ltr') {
    return dateString
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`sm:max-w-[900px] ${dir === 'rtl' ? '[&>button]:left-4 [&>button]:right-auto' : ''}`}>
          <DialogHeader>
            <DialogTitle className={`${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t("linksDialog.title")}</DialogTitle>
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
                <p className="mt-4 text-gray-600 font-medium text-lg">{t("uploadDialog.uploading")}</p>
              </div>
            }

            {/* {fetchError && <p>{t("linksDialog.error")}</p>} */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.download")}</TableHead>
                  <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.expiresOn")}</TableHead>
                  <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.anonymous")}</TableHead>
                  <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.passcode")}</TableHead>
                  <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.createdBy")}</TableHead>
                  <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.createdOn")}</TableHead>
                  <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.edit")}</TableHead>
                  {/* <TableHead className={`${dir === 'rtl' ? 'text-right pr-4' : 'text-left pl-4'}`}>{t("linksDialog.disable")}</TableHead> */}

                </TableRow>
              </TableHeader>
              <TableBody>
                {links.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      {t("linksDialog.noLinks")}
                    </TableCell>
                  </TableRow>
                ) : (
                  links.map((link) => (
                    <TableRow key={link.AttachmentURLGUID}>
                      <TableCell>
                        <Button variant="ghost" onClick={() => handleDownloadClick(link)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        {link.ExpiresOnDate.startsWith("299")
                          ? t("linksDialog.noExpiration")
                          : formatDateTime(link.ExpiresOnDate)}
                      </TableCell>
                      <TableCell>{link.IsAnonymous ? t("linksDialog.yes") : t("linksDialog.no")}</TableCell>
                      <TableCell>{link.NeedPassword ? t("linksDialog.yes") : t("linksDialog.no")}</TableCell>
                      <TableCell>{link.CreatedBy}</TableCell>
                      <TableCell>{formatDateTime(link.CreatedDateTime)}</TableCell>
                      <TableCell>
                        <UpsertLinksDialog
                          attachmentURLGUID={link.AttachmentURLGUID}
                          correlationGuid={fileGUID}
                          mode="u"
                          isInitialURL={link.IsInitialURL}
                        />
                      </TableCell>
                      {/* <TableCell>{link.IsInitialURL ? t("linksDialog.yes") : t("linksDialog.no")}</TableCell> جدید */}

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={onClose}>{t("linksDialog.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        objectPass=""
        onPasswordSubmit={(password: string) => {
          setIsPasswordDialogOpen(false);
          handleDownload(password);
        }}
        FileID={selectedLink?.FileGUID || ""}
        AttachmentUrlGuid={selectedLink?.AttachmentURLGUID || ""}
        fileName={fileName}
      />
    </>
  );
}