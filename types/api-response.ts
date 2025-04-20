import { FileItem } from "./file";

export interface APIFileItem {
  FileGUID: string;
  FileName: string;
  FileExtension: string;
  FileSize: number;
  CreatedBy: string;
  CreatedDateTime: string;
  Description?: string;
  allowDeleteFile: string;
  CorrelationGUID?: string;
}

export interface APIResponseData {
  items: APIFileItem[];
  total_records: number;
  page_size: number;
  page_number: number;
}

export interface APIResponse {
  data: APIResponseData;
} 