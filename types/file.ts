export type FilePermission = "owner" | "viewer" | "cooperative"

export interface FileItem {
  correlationGuid: string
  id: string
  name: string
  type: string
  size: string | number
  createdBy: string
  createdDate: string
  isLocked: boolean
  permission: FilePermission
  description: string
  createdByAvatar?: string
  attachmentUrlGuid?: string
  requiresPassword?: boolean
  isNew?: boolean
}

export interface APIFileItem {
  CorrelationGUID: string;
  FileGUID: string;
  FileName: string;
  FileExtension: string;
  FileSize: number;
  CreatedBy: string;
  CreatedDateTime: string;
  Description: string;
  allowDeleteFile: string;
}

export interface APIResponse {
  items: APIFileItem[];
  total_records: number;
  page_size: number;
  page_number: number;
}

export interface SortConfig {
  key: keyof FileItem
  direction: "asc" | "desc"
}

