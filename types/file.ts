export type FilePermission = "owner" | "viewer" | "cooperative"

export interface FileItem {
  correlationGuid: string
  id: string
  name: string
  type: string
  size: number
  createdBy: string
  createdDate: string
  isLocked?: boolean
  permission: FilePermission
  description?: string
  createdByAvatar?: string
  attachmentUrlGuid?: string
  requiresPassword?: boolean
}

export interface SortConfig {
  key: keyof FileItem
  direction: "asc" | "desc"
}

