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

export function useUploadFile() {
  const uploadFile = async (formData: FormData, onProgress?: ProgressCallback): Promise<UploadResponse> => {
    try {
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

      return {
        success: true,
        data: response.data
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