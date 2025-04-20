import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ Import QueryClient
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
import NexxFetch from "@/hooks/response-handling"; // ✅ Custom API handler
import { useDirection } from "@/components/folder-manager/context"; // Import direction context
import { useTranslation } from "react-i18next";


export function UpsertLinksDialog({ attachmentURLGUID, correlationGuid, mode, isInitialURL }) {
  const [expiresOn, setExpiresOn] = useState("");
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [disable, setDisable] = useState(false);
  console.log("IsInitialURL from props:", isInitialURL);


  const queryClient = useQueryClient(); // ✅ QueryClient to refetch data
  const { dir } = useDirection(); // Dynamically fetch the current direction
  const { t } = useTranslation();

  // ✅ Fetch existing data in update mode
  const { mutate: fetchLinkData, data, isLoading, isError } = NexxFetch.usePostData<
    { ExpiresOnDate: string; PasswordHash: string; IsAnonymous: boolean; Inactive: boolean , IsInitialURL: boolean },
    { FileGUID: string }
  >(`${ConfigURL.baseUrl}/get_url?FileGUID=${correlationGuid}?AttachmentURLGUID=${attachmentURLGUID}`);

  useEffect(() => {
    if (mode === "u" && correlationGuid) {
      console.log("Fetching data for correlationGuid:", correlationGuid);
      fetchLinkData({ FileGUID: correlationGuid });
    }
  }, [mode, correlationGuid, fetchLinkData]);

  useEffect(() => {
    if (data?.data) {
      console.log("Fetched data:", data.data);
      setExpiresOn(data.data.ExpiresOnDate || "");
      setPassword(data.data.PasswordHash || "");
      setIsAnonymous(data.data.IsAnonymous);
      setDisable(data.data.Inactive || false);
      setIsInitialURL(data.data.IsInitialURL);
      console.log("IsInitialURL:", data.data.IsInitialURL);
    }
  }, [data]);


  
  // ✅ Separate mutation functions for CREATE and UPDATE
  const createMutation = useMutation({
    mutationFn: async (newData) => {
      const response = await fetch(`${ConfigURL.baseUrl}/create_url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (!response.ok) throw new Error("Failed to create link");
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ Link created successfully!");
      queryClient.invalidateQueries(["linksData"]); // ✅ Refresh the data after create
    },
    onError: (error) => {
      console.error("❌ Error creating link:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updateData) => {
      const response = await fetch(`${ConfigURL.baseUrl}/update_url`, {
        method: "PUT", // ✅ Use PUT for updates
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Failed to update link");
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ Link updated successfully!");
      queryClient.invalidateQueries(fileGUID); // ✅ Refresh data after update
    },
    onError: (error) => {
      console.error("❌ Error updating link:", error);
    },
  });

  
const deleteMutation = useMutation({
  mutationFn: async (fileGUID) => {
    const response = await fetch(`${ConfigURL.baseUrl}/delete_url`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FileGUID: fileGUID }),
    });
    if (!response.ok) throw new Error("Failed to delete link");
    return response.json();
  },
  onSuccess: () => {
    console.log("✅ Link deleted successfully!");
    queryClient.invalidateQueries(["linksData"]); // ✅ Refresh data after delete
  },
  onError: (error) => {
    console.error("❌ Error deleting link:", error);
  },
});

  const handleSubmit = () => {
    const payload = {
      FileGUID: correlationGuid,
      ExpiresOnDate: expiresOn,
      PasswordHash: isAnonymous ? null : password,
      IsAnonymous: isAnonymous,
      // Inactive: disable,
      Inactive: isInitialURL ? false : disable,
    };

    if (mode === "c") {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ ...payload, AttachmentURLGUID: attachmentURLGUID });
    }
  };

  return (
    <Sheet>
      {/* Trigger Button */}
      {mode === "c" && (
        <SheetTrigger asChild>
          <Button variant="outline">{t("upsertLinksDialog.addLink")}</Button>
        </SheetTrigger>
      )}

      {mode === "u" && (
        <SheetTrigger asChild>
          <Button variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
        </SheetTrigger>
      )}

      {/* Sheet Content */}
      <SheetContent side={dir === "ltr" ? "left" : "right"}onClick={(e) => e.stopPropagation()}>
        <SheetHeader>
          <SheetTitle>{t("upsertLinksDialog.title")}</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          {isLoading && <p>{t("upsertLinksDialog.loading")}</p>}
          {/* {isError && <p>{t("upsertLinksDialog.error")}</p>} */}
          {!isLoading && !isError && (
            <>
              {/* Expires On Date */}
              <div className="grid gap-2">
                <Label htmlFor="expiresOn">{t("upsertLinksDialog.expiresOnLabel")}</Label>
                <Input type="date" id="expiresOn" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">{t("upsertLinksDialog.passwordLabel")}</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isAnonymous}
                  className={isAnonymous ? "opacity-50 cursor-not-allowed" : ""}
                />
              </div>

              {/* Is Anonymous */}
              <div className="flex items-center space-x-2 gap-2">
                <Checkbox id="isAnonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                <Label htmlFor="isAnonymous">{t("upsertLinksDialog.isAnonymousLabel")}</Label>
              </div>

              {/* Disable (Only in Update Mode) */}
              {mode === "u" && !isInitialURL && (
                <div className="flex items-center space-x-2 gap-2">
                  <Checkbox id="disable" checked={disable}  disabled={isInitialURL} onCheckedChange={setDisable}   />
                  <Label htmlFor="disable">{t("upsertLinksDialog.disableLabel")}</Label>
                </div>
              )}

            {mode === "u" && isInitialURL && (
              <p className="text-sm text-gray-500">{t("upsertLinksDialog.initialURLDisabledMessage")}</p>
            )}
            </>
          )}
        </div>

        {/* Submit Button */}
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={createMutation.isLoading || updateMutation.isLoading }
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? t("upsertLinksDialog.submitting")
                : t("upsertLinksDialog.submit")}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}