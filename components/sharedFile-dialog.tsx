"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import ConfigURL from "@/config";
import { useDirection } from "@/components/folder-manager/context";
import { useTranslation } from "react-i18next";
import moment from "jalali-moment";

interface SharingFormProps {
  correlationGuid: string;
}

export function SharingForm({ correlationGuid }: SharingFormProps) {
  const [fileData, setFileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dir } = useDirection();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await axios.post(`${ConfigURL.baseUrl}/get`, {
          CorrelationGUID: correlationGuid,
        });

        if (response.data && response.data.length > 0) {
          setFileData(response.data[0]);
        } else {
          throw new Error("No file data found");
        }
      } catch (error) {
        toast.error("Failed to load file data");
        console.error("Fetch error:", error);
      }
    };

    if (correlationGuid) {
      fetchFileData();
    }
  }, [correlationGuid]);

  const handleDownload = async () => {
    if (!fileData) return;

    try {
      setIsLoading(true);
      const downloadUrl = `${ConfigURL.baseUrl}/downloading_file`;

      const response = await axios.post(
        downloadUrl,
        {
          FileGUID: fileData.FileGUID,
          AttachmentURLGUID: fileData.CorrelationGUID,
          PasswordClear: "",
        },
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        }
      );

      const filename = fileData.FileName || "downloaded_file";
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const formatFileSize = (sizeInBytes: number): string => {
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB >= 1
      ? sizeInMB.toFixed(2) + "    "+ " MB"
      : (sizeInBytes / 1024).toFixed(2) + "    "+ " KB";
  };

  const formatDate = (dateString: string) => {
    const date = moment(dateString);
    if (dir === 'rtl') {
      const jalaliDate = moment(dateString, "YYYY/MM/DD - HH:mm")
      .locale("fa") // Set Persian locale
      .format(" HH:mm - jYYYY/jMM/jDD"); // Convert to Jalali
      return jalaliDate;
    }
    return date.format("YYYY/MM/DD - HH:mm");
  };

  return (
    <div
      className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg bg-muted"
      dir={dir}
    >
      <h1 className="text-2xl font-bold text-center text-foreground mb-6">
        {t("sharingDialog.title")}
      </h1>

      {fileData ? (
        <>
          <div className="space-y-4">
            <div className="p-4 rounded-lg">
              <div className="text-foreground">{t("sharingDialog.fileName")} : {fileData.FileName}</div>
              <div className="text-foreground mt-1">{t("sharingDialog.fileSize")} : {formatFileSize(fileData.FileSize)}</div>
              <div className="text-foreground mt-1">{t("sharingDialog.fileDescription")} : {fileData.Description}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <User className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  {t("sharingDialog.uploadedBy")}: {fileData.CreatedBy}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-foreground">
                  {t("sharingDialog.uploadedOn")} : {formatDate(fileData.CreatedDateTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleDownload} disabled={isLoading} className="w-full">
              {isLoading ? (
                <span>{t("sharingDialog.downloading")}</span>
              ) : (
                <>
                  <Download className="mr-2 w-5 h-5" />
                  {t("sharingDialog.downloadFile")}
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center text-muted">
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
          <p className="mt-4 text-gray-600 font-medium text-lg">{t("sharingDialog.loading")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
