export type FilePermission = "owner" | "viewer" | "cooperative"

export type FileItem = {
    id: string;
    name: string;
    type: string;
    size: number;
    createdBy: string;
    createdDate: string;
    permission: FilePermission;
    isLocked: boolean;
    description?: string;
  }

export interface SortConfig {
  key: keyof FileItem
  direction: "asc" | "desc"
}


export interface FolderItem {
    FolderGUID: string
    FolderID: number 
    ParentFolderID?: number
    FolderName: string
    FolderDescription: string
    PasswordRequired: number
    PermissionId?: number
  }