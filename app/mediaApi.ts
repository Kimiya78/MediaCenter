import ConfigURL from "@/config";

export const fetchMedia = async (page: number, pageSize: number, folderId: number | null) => {
    const baseUrl = `${ConfigURL.baseUrl}/fetch_media`;
    const params = new URLSearchParams({
      page_number: page.toString(),
      page_size: pageSize.toString(),
      EntityGUID: '0xBD4A81E6A803',
      EntityDataGUID: '0x85AC4B90382C',
      ...(folderId ? { FolderID: folderId.toString() } : {})
    });
  
    try {
      const response = await fetch(`${baseUrl}?${params}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  };