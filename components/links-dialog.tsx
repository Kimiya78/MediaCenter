"use client"

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CirclePlus, Download, Edit2 } from "lucide-react";
import ConfigURL from "@/config";
// import {AddLinksDialog} from "@/components/addLinks-dialog"; 

import { UpsertLinksDialog } from "@/components/upsertLinks-dialog"; 


interface Link {
  FileGUID: string;
  ExpiresOnDate: string;
  IsAnonymous: boolean;
  CreatedByID: number;
  CreatedDateTime: string;
  NeedPassword: boolean;
}

interface LinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileGUID: string; 
}

export default function LinksDialog({ isOpen, onClose, fileGUID  }: LinksDialogProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [isAddLinksOpen, setIsAddLinksOpen] = useState(false);

  // Fetch links when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      fetchLinks();
    }
  }, [isOpen]);
//----------------------------------------
  const fetchLinks = async () => {
    try {
      const response = await fetch(`${ConfigURL.baseUrl}/get_url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ FileGUID: fileGUID }),
      });
      debugger
      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }

      const data = await response.json();
      console.log(data.attachmentURLGUID)
      if (data.AttachmentURL && data.AttachmentURL.length > 0) {
        setLinks(data.AttachmentURL); 
      } else {
        setLinks([]); 
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const handleDownload = (link: Link) => {
    console.log("Downloading file with AttachmentURLGUID:", link.AttachmentURLGUID);
  };

  const handleEdit = (link: Link) => {
    console.log("Editing file record", link);
  };

  const handleAddLink = () => {
    console.log("Adding new link");
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Links</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {/* <AddLinksDialog /> */}
          <UpsertLinksDialog attachmentURLGUID={fileGUID} correlationGuid={fileGUID} mode="c" />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Download</TableHead>
                <TableHead>Expires On</TableHead>
                <TableHead>Anonymous</TableHead>
                <TableHead>Passcode</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No links available.
                  </TableCell>
                </TableRow>
              ) : (
                links.map((link) => (
                  <TableRow key={link.AttachmentURLGUID}>
                    <TableCell>
                      <Button variant="ghost" onClick={() => handleDownload(link)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>{link.ExpiresOnDate ? new Date(link.ExpiresOnDate).toLocaleString() : "No Expiration"}</TableCell>
                    <TableCell>{link.IsAnonymous ? "Yes" : "No"}</TableCell>
                    <TableCell>{link.NeedPassword ? "Yes" : "No"}</TableCell>
                    <TableCell>{link.CreatedByID}</TableCell>
                    <TableCell>{new Date(link.CreatedDateTime).toLocaleString()}</TableCell>
                    <TableCell>
                      
                      <UpsertLinksDialog  attachmentURLGUID ={link.AttachmentURLGUID} correlationGuid={fileGUID} mode="u" />

                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}