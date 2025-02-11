"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Download, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import ConfigURL from "@/config";
import { useDirection } from "@/components/folder-manager/context"; // Import the direction hook

interface SharingFormProps {
  correlationGuid: string;
}

export function SharingForm({ correlationGuid }: SharingFormProps) {
  const [fileData, setFileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dir } = useDirection(); // Detects LTR or RTL

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await axios.post(`${ConfigURL.baseUrl}/get`, {
          CorrelationGUID: correlationGuid,
        });

        if (response.data && response.data.length > 0) {
          setFileData(response.data[0]); // Assuming API returns an array
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

  // **Dynamic Labels for LTR & RTL**
  const labels = dir === "rtl"
    ? {
        title: "اشتراک گذاری فایل",
        fileName: "نام فایل",
        fileSize: "حجم فایل",
        fileDescription: "توضیحات",
        uploadedBy: "بارگذاری شده توسط",
        uploadedOn: "تاریخ بارگذاری",
        downloadFile: "دریافت فایل",
        loading: "در حال بارگذاری اطلاعات فایل...",
        downloading: "در حال دریافت...",
      }
    : {
        title: "Sharing File",
        fileName: "File Name",
        fileSize: "File Size",
        fileDescription: "Description",
        uploadedBy: "Uploaded By",
        uploadedOn: "Uploaded On",
        downloadFile: "Download File",
        loading: "Loading file details...",
        downloading: "Downloading...",
      };

  return (
    <div
      className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg bg-muted"
      dir={dir} // Apply direction dynamically
    >
      <h1 className="text-2xl font-bold text-center text-foreground mb-6">
        {labels.title}
      </h1>

      {fileData ? (
        <>
          <div className="space-y-4">
            <div className="p-4 rounded-lg">
              <div className=" text-foreground">{labels.fileName}: {fileData.FileName}</div>
              <div className=" text-foreground mt-1">{labels.fileSize}: {fileData.FileSize} bytes</div>
              <div className=" text-foreground mt-1">{labels.fileDescription}: {fileData.Description}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span className=" text-foreground">
                  {labels.uploadedBy}: {fileData.CreatedBy}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className=" text-foreground">
                  {labels.uploadedOn}: {fileData.CreatedDateTime}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button onClick={handleDownload} disabled={isLoading} className="w-full">
              {isLoading ? (
                <span>{labels.downloading}</span>
              ) : (
                <>
                  <Download className="mr-2 w-5 h-5" />
                  {labels.downloadFile}
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center  text-muted">
          {labels.loading}
        </div>
      )}
    </div>
  );
}
