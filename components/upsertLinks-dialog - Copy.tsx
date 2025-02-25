import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ConfigURL from "@/config";
import { Edit2 } from "lucide-react";


export function UpsertLinksDialog({  attachmentURLGUID , correlationGuid, mode }) {
  const [expiresOn, setExpiresOn] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [disable, setDisable] = useState(false);
  const [fetchedData, setFetchedData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (mode !== "u" || !correlationGuid) return; // Only fetch if in update mode
      
      try {
        const response = await fetch(`${ConfigURL.baseUrl}/get_url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ FileGUID: correlationGuid }),
        });
  
        if (!response.ok) throw new Error("Failed to fetch data");
  
        const data = await response.json();
        setFetchedData(data);
  
        // Ensure the state updates correctly
        setExpiresOn(data.ExpiresOnDate );
        setPassword(data.PasswordHash || "");
        setIsAnonymous(data.IsAnonymous);
        setDisable(data.Inactive || false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  
    fetchData();
  }, [mode, correlationGuid]); // Runs only when mode or correlationGuid changes
  

  const handleCheckboxChange = (checked) => {
    setIsAnonymous(checked);
    if (checked) setPassword("");
  };

//   const handleUpdateURL = () {} 

  const handleSubmit = async () => {

    debugger

    const payload =
      mode === "c"
        ? {
            FileGUID: correlationGuid,
            ExpiresOnDate: expiresOn,
            PasswordHash: isAnonymous ? null : password,
            IsAnonymous: isAnonymous,
            Inactive: disable,
          }
        : {
            FileGUID: correlationGuid,
            AttachmentURLGUID : attachmentURLGUID,
            ExpiresOnDate: expiresOn,
            PasswordHash: isAnonymous ? null : password,
            IsAnonymous: isAnonymous,
            Inactive: disable,
          };

    const isCreateMode = mode === "c";
    const endpoint = isCreateMode ? "/create_url" : "/update_url";
    const method = isCreateMode ? "POST" : "PUT";  // Use PUT for updates

    try {
      const response = await fetch(`${ConfigURL.baseUrl}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Failed to ${isCreateMode ? "create" : "update"} URL`);

      console.log(`URL ${isCreateMode ? "created" : "updated"} successfully!`);
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };


  return (
    <Sheet>
        {mode === 'c' && (
            <SheetTrigger asChild>
                <Button variant="outline">+ Add Link</Button>
            </SheetTrigger>
            )}
            
        {mode ==='u' && (
            <SheetTrigger asChild>
                <Button variant="ghost">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </SheetTrigger>

)} 
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Attachment Link</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="expiresOn">Expires On Date:</Label>
            <Input
              type="date"
              id="expiresOn"
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password:</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAnonymous}
              className={isAnonymous ? "opacity-50 cursor-not-allowed" : ""}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="isAnonymous">Is Anonymous?</Label>
          </div>
          {mode === "u" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disable"
                checked={disable}
                onCheckedChange={setDisable}
              />
              <Label htmlFor="disable">Disable</Label>
            </div>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
