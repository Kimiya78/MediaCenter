import React, { useState } from "react";
import ConfigURL from "@/config";

const UploadFile = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [parentFolderId, setParentFolderId] = useState<string>("");

  // Define correct types for the event parameter
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const file = event.target.files?.[0];  // Get the selected file
    if (!file) {
      console.log('No file selected');
      return;
    }

    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleParentFolderIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParentFolderId(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("EntityGUID", "0xBD4A81E6A803"); // Replace with actual GUID if applicable
    formData.append("EntityDataGUID", "0x85AC4B90382C"); // Replace if applicable
    formData.append("ServiceCategoryID", ""); // Changed from null to empty string
    formData.append("ItemID", ""); // Changed from null to empty string
    formData.append("Description", description || ""); // Ensure description is not null
    formData.append("ParentfolderId", parentFolderId || ""); // Ensure parentFolderId is not null
    formData.append("file", file);

    debugger

    try {
      const response = await fetch(`${ConfigURL.baseUrl}/create`, {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert("File uploaded successfully!");
        console.log(data);
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || "Something went wrong!"}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <label htmlFor="file">Select File:</label>
        <input type="file" id="file" onChange={handleFileChange} />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={handleDescriptionChange}
        />
      </div>
      <div>
        <label htmlFor="parentFolderId">Parent Folder ID:</label>
        <input
          type="number"
          id="parentFolderId"
          value={parentFolderId}
          onChange={handleParentFolderIdChange}
        />
      </div>
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadFile;
