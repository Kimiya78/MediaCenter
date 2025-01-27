import React, { useState } from "react";

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
      const response = await fetch("http://cgl1106.cinnagen.com:9020/create", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiWlhsS2FHSkhZMmxQYVVwcllWaEphVXhEU214aWJVMXBUMmxLUWsxcVZUSlNNRTVPU1c0d0xpNW9NRUU0VlZGTGFrODFhMnBzYVVWSlVFTTJOMWQzTGkxZk5FaEllbEptV25JM2IzRjNObGROTVROVmRGTXRXalZHUzJOa2VqZDBWVk5UTUZONU1VY3lUamx6Tm1aRWJEVXpaM1I2U0d4UlUySlZNelJVYVhKU2VHbFRNemxqZWxkR2N6UTVRMGN6Ym5CMU9VSlNTMjFUVFRZd1dHcDNZVVk0YlZoWWNuQlFjVE5YZUhoTVIyOVZRMVpmTVdOVmFtSnpZVTloZFRZMlFqUndjMjlYVG1kUlRXSjFaVTUyWVhGeVpubzBXbVYwVG00MlRVaFVWSFkxZG0xcGFXZHhURUZQZWs1WGJtOWxYMTlOVldaamJWSlhZbEp4TVZKb2NtWkhPWGxSVHpoNmNtaFJRbXd6V0U5SFJXTmtSRGxvT1hKYVVGbGpObkUxYVd0dVJGWm9kRmhpTVRkcVMzTlJRMUY1WWxVek9WazBUblJpZG1weFdsb3llbFZDU1VkaWRVb3ljSFozYjJwMmNIZE5VSGhMTTJreGRrWjZTa28zUkZnMWRYTnBSa2w2VW05VU5XVjNZa2xLY0hWd2JIbExXR1ZmWTNoWVQxTjJZWGt6Tlhrd1owVXpja3hhVVdJemRrTjVUMVZQVjFGd01raGlXSFYyUWkxblVFeERSREF3WDBSWlZYTnJWVjgwTnpBeWVrZGxXVGRUUzFRMGNuQkpUWE5LY1dweVFrVjBUa3haZW0xMGRVWlBkMnRCVTNaYVJHWmlWVUppTlVoUlprWkNNSE5hTTFGdFozQlpTMjF3ZEVkbmRHRklkRzl1YmtwbWNVbG5WMUZFV2xrek1FZFdWMmhWZFdGcGNEbE5OazExY25oc01sRkxlbUV0VG5KVlltNVJWMnR2TTBSRFkwZHdVWHBmT1hCYU1FMVdkVTFOUjNwM09XVjBVa1JhV0ZNeVoyaGFOekJEYldoaVdHOHljMTlsU1dFd2RsOVhXRzFOTmtzNVRrbFhlUzFCYlZRNUxWOU9OVUpWWTJFNFF6WnRibXREVFdaR1FsZDBjbW93VW0wemFrOHlaMDF0UmpOSE9GVmFYMlp2U1U5SFJFVmZaMk5YYVd4M2NESndlV2cyUlhaTlpreGtla042V1hCamMwbFZWbFk1TjFoMWVHMWpWbVJmU1MxMmMxSkRSRWRFWlc5VWJXNUhUVmxKUTNrMlVFOVBWMGxPYXpOUlZWWnNOVTVJVjFaaU5uWTVOSGhhWkhWNE0ySTBTME01YjFaME56UlVWV0pyZVcxNlptaFhZVkpVZEhoMVZHOUZlV3Q0YkVkc2EzQmFNWEJpVEU5MFNVSnFkVGx6V0ZRMmVsQTBaVGx4VlZsdVpGZ3lObFIwWWtwVE5GRkpZbWxVTlZZdFIxOXdPRjkyVFhJdGQybE9aV3hQYUdobGFrdzRWbGhaWDJaQkxreDNaRmxMWm5WSmMyRmhhVTlrYjFocVVHODNVa0U9In0.bsuN-QsRespOi7ca6pBexDqyNXwqvIpMfU7GRoNMsBjMWKmSg79cFw8nF--CJlDNgvSbTVsIQ7zXJs1GGkSFZgnbQSeEZR4YDe8bXtW8dT4iQYQzrEeWaVnqm5TCnS_zxIYhhhk9GAcw_DWZErndOVwtDrvdYY1ZzWUfaRS6QRKQoO-YrqcT0m84bBwqYJJIMYKQRQul_Fjj-6bxdSa2uvn_2mvp4OYRKGW3olgmBQ_nVvzd9lhOMl6Uk-pAae5ixPwsNuOUyS7Lo1JQ7oPSG4q3WHnQjTVyDCy7NMtFl3YmMXg0ZX4l2HWzMfqhRRt7RSVivzBJcbPZVJLly3yUXA", // Add this if your API requires authentication
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
