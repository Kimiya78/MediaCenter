import axios from 'axios';
import ConfigURL from '@/config';
import { getFileTypeFromMimeType } from '@/utils/file-utils';

interface UploadResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface ProgressCallback {
  (progressEvent: { loaded: number; total: number }): void;
}

interface UploadData {
  EntityGUID: string;
  EntityDataGUID: string;
  ServiceCategoryID: string;
  ItemID: string;
  Description: string;
  ParentfolderId: string;
  file: File;
}

export function useUploadFile() {
  const uploadFile = async (data: UploadData, onProgress?: ProgressCallback): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      
      // Detect MIME type and get proper extension
      let mimeType = data.file.type;
      
      // If no MIME type, try to detect it from the file content
      if (!mimeType || mimeType === 'application/octet-stream') {
        // Read first few bytes to detect file type
        const buffer = await data.file.slice(0, 4096).arrayBuffer();
        const arr = new Uint8Array(buffer);
        
        // Check file signatures
        if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) {
          mimeType = 'image/png';
        } else if (arr[0] === 0xFF && arr[1] === 0xD8) {
          mimeType = 'image/jpeg';
        } else if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46) {
          mimeType = 'application/pdf';
        } else if (arr[0] === 0x50 && arr[1] === 0x4B) {
          // Could be docx, xlsx, pptx, zip
          if (data.file.name.endsWith('.docx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          } else if (data.file.name.endsWith('.xlsx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          } else if (data.file.name.endsWith('.pptx')) {
            mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          } else {
            mimeType = 'application/zip';
          }
        }
      }

      // Get proper file extension based on detected MIME type
      const fileExtension = getFileTypeFromMimeType(mimeType);
      
      // If file doesn't have extension or has wrong extension, fix it
      let fileName = data.file.name;
      if (!fileName.includes('.') || !fileName.toLowerCase().endsWith(`.${fileExtension}`)) {
        fileName = `${fileName.split('.')[0]}.${fileExtension}`;
      }
      
      // Create a new File object with the proper name and detected MIME type
      const fileWithExtension = new File([data.file], fileName, { type: mimeType });
      
      // Add all form data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'file') {
          formData.append(key, fileWithExtension);
        } else {
          formData.append(key, value);
        }
      });

      console.log("🟡 Uploading file:", {
        originalName: data.file.name,
        newName: fileName,
        originalType: data.file.type,
        detectedType: mimeType,
        extension: fileExtension,
        size: data.file.size
      });

      const response = await axios.post(`${ConfigURL.baseUrl}/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress ? 
          (progressEvent) => {
            onProgress({
              loaded: progressEvent.loaded,
              total: progressEvent.total || 0
            });
          } : undefined
      });

      console.log("🟡 API Response:", response.data);

      return {
        success: true,
        data: {
          ...response.data,
          name: response.data.file_name || fileName,
          type: response.data.file_extension || fileExtension
        }
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  return { uploadFile };
}