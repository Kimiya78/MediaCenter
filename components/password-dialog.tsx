"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  objectPass: string;
  onPasswordSubmit: (enteredPass: string) => void;
}

export function PasswordDialog({ isOpen, onClose, objectPass, onPasswordSubmit }: PasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password cannot be empty.");
      return;
    }
    if (password !== objectPass) {
      setError("Incorrect password.");
      return;
    }
    onPasswordSubmit(password);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password"> </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password here "
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={21} /> : <Eye size={22} />}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}










// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// interface RenameDialogProps {
//   isOpen: boolean
//   onClose: () => void
//   objectPass: string
//   objectType: string
//   onRename: (newPass: string) => void
// }

// export function RenameDialog({
//   isOpen,
//   onClose,
//   objectPass,
//   onRename
// }: RenameDialogProps) {
//   const [newPass, setnewPass] = useState(objectPass)

//   useEffect(() => {
//     if (isOpen) {
//       setnewPass(objectPass)
//     }
//   }, [isOpen, objectPass])

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (newPass && newPass.trim() && newPass !== objectPass) {
//       onRename(newPass.trim())
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
//         <DialogHeader>
//           <DialogTitle>Input Password </DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="newPass">password</Label>
//             <Input
//               id="newPass"
//               value={newPass}
//               onChange={(e) => setnewPass(e.target.value)}
//               placeholder="Enter new name"
//               autoFocus
//             />
//           </div>
//           <div className="flex justify-end gap-2 pt-4">
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={!newPass || newPass.trim() === "" || newPass === objectPass}
//             >
//               Submit
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }