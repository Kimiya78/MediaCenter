import axios from 'axios';
import ConfigURL from '@/config';

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
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      console.log("🟡 Uploading file:", {
        originalName: data.file.name,
        type: data.file.type,
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
          name: response.data.file_name || data.file.name,
          type: response.data.file_extension || data.file.type || 'unknown'
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