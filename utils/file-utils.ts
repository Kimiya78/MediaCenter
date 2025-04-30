export function getFileTypeFromMimeType(mimeType: string): string {
  // Common MIME type mappings
  const mimeTypeMap: { [key: string]: string } = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/json': 'json',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/x-msvideo': 'avi',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z'
  };

  // If we have a direct mapping, use it
  if (mimeType in mimeTypeMap) {
    return mimeTypeMap[mimeType];
  }

  // Try to extract type from MIME type (e.g., 'image/png' -> 'png')
  const [category, subtype] = mimeType.split('/');
  if (subtype && !subtype.includes('octet-stream')) {
    return subtype;
  }

  // For binary files or unknown types
  return 'unknown';
}

export function determineFileType(file: File): string {
  // First try to get extension from filename
  const fileExtensionFromName = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : '';
  
  // If we have a valid extension from the name, use it
  if (fileExtensionFromName && fileExtensionFromName.length > 0 && fileExtensionFromName.length <= 4) {
    return fileExtensionFromName;
  }

  // If no valid extension in name, try to determine from MIME type
  if (file.type) {
    return getFileTypeFromMimeType(file.type);
  }

  // If all else fails
  return 'unknown';
} 