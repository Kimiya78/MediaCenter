"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import ConfigURL from "@/config";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/components/folder-manager/context"; 

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  objectPass: string;
  onPasswordSubmit: (enteredPass: string) => void;
  FileID: string;
  AttachmentUrlGuid: string;
  fileName: string;
}

export function PasswordDialog({ isOpen, onClose, FileID, AttachmentUrlGuid, fileName }: PasswordDialogProps) {
  const { t } = useTranslation();
  const { dir } = useDirection();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("لطفا رمز عبور را وارد کنید");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const downloadUrl = `${ConfigURL.baseUrl}/downloading_file`;
      const response = await axios.post(
        downloadUrl,
        {
          FileGUID: FileID,
          AttachmentURLGUID: AttachmentUrlGuid,
          PasswordClear: password
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
          validateStatus: function (status) {
            return (status >= 200 && status < 300) || status === 403;
          }
        }
      );

      // Handle 403 (Invalid Password) response
      if (response.status === 403) {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const text = reader.result as string;
            const errorData = JSON.parse(text);
            setError(errorData.error || "رمز عبور نادرست است");
            //toast.error(errorData.error || "رمز عبور نادرست است");
          } catch {
            setError("رمز عبور نادرست است");
            toast.error("رمز عبور نادرست است");
          }
          setIsLoading(false);
        };
        reader.readAsText(response.data);
        return;
      }

      // If we get here, password was correct and we have the file data
      const contentType = response.headers["content-type"] || "";
      const contentDisposition = response.headers["content-disposition"] || "";
      const videoTypes = ["mp4", "webm", "ogg", "avi", "mkv", "quicktime", "video/mp4"];
      const isVideo = videoTypes.some((type) => contentType.includes(type));

      let downloadFilename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : fileName;

      // Add extension if missing
      if (!downloadFilename.includes('.')) {
        const extension = getFileTypeFromMimeType(contentType);
        downloadFilename = `${downloadFilename}.${extension}`;
      }

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
        const blobUrl = URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = downloadFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        toast.success("دانلود با موفقیت شروع شد");
      }

      onClose();
    } catch (error) {
      console.error("Download error:", error);
      if (error.response?.status === 403) {
        setError("رمز عبور نادرست است");
        toast.error("رمز عبور نادرست است");
      } else {
        setError("خطا در دانلود فایل");
        toast.error("خطا در دانلود فایل");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${dir === "rtl" ? "[&>button.absolute]:left-4 [&>button.absolute]:right-auto" : ""}`} onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-4 pt-4`}>{t("passwordDialog.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2 pt-4">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordDialog.placeholder")}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                className={`absolute ${dir === "rtl" ? "left-3" : "right-3"} top-2 text-gray-500`}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={21} /> : <Eye size={22} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("passwordDialog.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("passwordDialog.checking") : t("passwordDialog.download")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
