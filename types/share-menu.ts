import { ReactNode } from 'react';

export interface ShareMenuProps {
  fileId: string;
  fileName: string;
  fileDescription: string;
  fileSize: string;
  uploadedBy: string;
  uploadedOn: string;
  attachmentUrlGuid: string;
  correlationGuid: string;
  folderId: string;
  requiresPassword: boolean;
  trigger: ReactNode;
  isLocked: boolean;
  onRename: (newName: string) => void;
  onFileRemove: (correlationGuid: string) => void;
} 