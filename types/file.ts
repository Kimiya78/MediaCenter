export type FilePermission = "owner" | "viewer" | "cooperative"

export interface FileItem {
  id: string
  name: string
  type: string
  size: number
  createdBy: string
  createdDate: string
  isLocked?: boolean
  permission: FilePermission
}

export interface SortConfig {
  key: keyof FileItem
  direction: "asc" | "desc"
}

