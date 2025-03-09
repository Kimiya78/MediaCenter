"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import ConfigURL from "@/config";
import { useDirection } from "@/components/folder-manager/context";
import { useTranslation } from "react-i18next";

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
              <div className="text-foreground">{t("sharingDialog.fileName")}: {fileData.FileName}</div>
              <div className="text-foreground mt-1">{t("sharingDialog.fileSize")}: {formatFileSize(fileData.FileSize)}</div>
              <div className="text-foreground mt-1">{t("sharingDialog.fileDescription")}: {fileData.Description}</div>
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
                  {t("sharingDialog.uploadedOn")}: {fileData.CreatedDateTime}
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
          {t("sharingDialog.loading")}
        </div>
      )}
    </div>
  );
}
