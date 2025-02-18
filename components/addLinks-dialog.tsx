"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddLinksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { expiresOn: string; password: string; isAnonymous: boolean }) => void;
}

const AddLinksDialog: React.FC<AddLinksDialogProps> = ({ isOpen, onClose, onSubmit }) => {
  const [expiresOn, setExpiresOn] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    onSubmit({ expiresOn, password, isAnonymous });
    onClose(); // Close dialog after submission
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-center">Attachment Link</DialogTitle>
      </DialogHeader>
      <DialogContent className="space-y-4">
        {/* Expires On Date */}
        <div>
          <Label className="font-medium">Expires On Date:</Label>
          <Input
            type="date"
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Password */}
        <div>
          <Label className="font-medium">Password:</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
            placeholder="Enter password"
          />
        </div>

        {/* Is Anonymous */}
        <div className="flex items-center space-x-2">
          <Checkbox checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          <Label className="font-medium">Is Anonymous</Label>
        </div>
      </DialogContent>

      <DialogFooter className="flex justify-center mt-4">
        <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Submit
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AddLinksDialog;
