import { useState, useEffect, useRef } from "react";
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
//import DatePicker from 'react-datepicker2';
import moment from 'moment-jalaali';
import { DateObject } from "react-multi-date-picker";
//import DatePicker from "react-multi-date-picker";
import jalali from "dayjs-jalali";
import DatePicker, { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian"; // Jalali calendar
import persian_fa from "react-date-object/locales/persian_fa"; // Persian locale

// Add these interfaces at the top of the file after imports
interface LinkPayload {
  FileGUID: string;
  ExpiresOnDate: string;
  PasswordHash: string | null;
  IsAnonymous: boolean;
  Inactive: boolean;
}

interface UpdateLinkPayload extends LinkPayload {
  AttachmentURLGUID: string;
}

// Add these type definitions at the top after imports
interface UpsertLinksDialogProps {
  attachmentURLGUID: string;
  correlationGuid: string;
  mode: 'c' | 'u';
  isInitialURL: boolean;
}

export function UpsertLinksDialog({ 
  attachmentURLGUID, 
  correlationGuid, 
  mode, 
  isInitialURL: initialIsInitialURL 
}: UpsertLinksDialogProps) {
  const [expiresOn, setExpiresOn] = useState(moment()); 
  const [password, setPassword] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [disable, setDisable] = useState(false);
  const [isInitialURL, setIsInitialURL] = useState(initialIsInitialURL);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  const queryClient = useQueryClient(); // ✅ QueryClient to refetch data
  const { dir } = useDirection(); 
  const { t } = useTranslation();

  const getTodayDate = (dir) => {
    return dir === "rtl"
      ? new DateObject({ calendar: persian }) 
      : new DateObject(); 
  };

  // ✅ Fetch existing data in update mode
  const { mutate: fetchLinkData, data, isLoading, isError } = NexxFetch.usePostData<
  { ExpiresOnDate: string; PasswordHash: string; IsAnonymous: boolean; Inactive: boolean; IsInitialURL: boolean },
  { FileGUID: string }
>(`${ConfigURL.baseUrl}/get_url?FileGUID=${correlationGuid}&AttachmentURLGUID=${attachmentURLGUID}`);


  
  const formatDateForAPI = (date: DateObject | moment.Moment | string | null): string | null => {
    if (!date) return null;

    try {
      if (date instanceof DateObject) {
        // Convert Jalali to Gregorian
        const gregorianDate = date.convert("gregorian");
        return gregorianDate.format("YYYY-MM-DD HH:mm:ss");
      } 
      
      if (moment.isMoment(date)) {
        // Convert Jalali to Gregorian
        const gregorianDate = date.clone().locale('en');
        return gregorianDate.format("YYYY-MM-DD HH:mm:ss");
      } 
      
      if (typeof date === "string") {
        // Parse string to moment, convert to Gregorian and format
        const jalaliDate = moment(date, "YYYY/MM/DD", "fa");
        const gregorianDate = jalaliDate.clone().locale('en');
        return gregorianDate.format("YYYY-MM-DD HH:mm:ss");
      }
      
      return null;
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };
  console.log(" 0000000000 Formatted ExpiresOn:", formatDateForAPI(expiresOn));
  console.log(" 0000000000 Formatted ExpiresOn:", expiresOn);


  useEffect(() => {
    if (mode === "u" && correlationGuid) {
      console.log("--- Fetching data for correlationGuid : " , correlationGuid, "----");
      fetchLinkData({ FileGUID: correlationGuid });
    }
  }, [mode, correlationGuid, fetchLinkData]);
  

  useEffect(() => {
    if (data?.data) {
      console.log("Fetched data:", data.data);
      const fetchedDate = moment(data.data.ExpiresOnDate, 'YYYY/MM/DD'); // تبدیل رشته به شیء Moment
      console.log("Fetched data:", data.data);
      setExpiresOn(data.data.ExpiresOnDate || "");
      setPassword(data.data.PasswordHash || "");
      setIsAnonymous(data.data.IsAnonymous);
      setDisable(data.data.Inactive || false);
      setIsInitialURL(data.data.IsInitialURL);
      console.log("IsInitialURL:", data.data.IsInitialURL);
    }
  }, [data]);

  // Handle click outside calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click is outside both the calendar element and its popper
      const calendarElement = document.querySelector('.rmdp-container');
      const isClickOutsideCalendar = calendarElement && !calendarElement.contains(event.target);
      const isClickOutsideInput = calendarRef.current && !calendarRef.current.contains(event.target);
      
      if (isClickOutsideCalendar && isClickOutsideInput) {
        const elem = document.querySelector('.rmdp-container input') as HTMLElement;
        if (elem) {
          elem.click(); // This will close the calendar
        }
      }
    }



    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (data?.data) {
      console.log("Fetched data from server:", data.data);
    }
  }, [data]);

  
  // ✅ Separate mutation functions for CREATE and UPDATE
  const createMutation = useMutation<string, Error, LinkPayload>({
    mutationFn: async (newData: LinkPayload) => {
      const response = await fetch(`${ConfigURL.baseUrl}/create_url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create link");
      }
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ Link created successfully!");
      queryClient.invalidateQueries(["linksData"]);
    },
    onError: (error) => {
      console.error("❌ Error creating link:", error.message);
    },
  });

  const updateMutation = useMutation<string, Error, UpdateLinkPayload>({
    mutationFn: async (updateData: UpdateLinkPayload) => {
      const response = await fetch(`${ConfigURL.baseUrl}/update_url`, {
        method: "PUT", // ✅ Use PUT for updates
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update link");
      }
      return response.json();
    },
    onSuccess: () => {
      console.log("✅ Link updated successfully!");
      queryClient.invalidateQueries(["linksData"]);
    },
    onError: (error) => {
      console.error("❌ Error updating link:", error.message);
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
    const formattedDate = formatDateForAPI(expiresOn);
    if (!formattedDate) {
      console.error("Invalid date");
      return;
    }

    const basePayload: LinkPayload = {
      FileGUID: correlationGuid,
      ExpiresOnDate: formattedDate,
      PasswordHash: isAnonymous ? null : password,
      IsAnonymous: isAnonymous,
      Inactive:  disable,
    };

    console.log("Payload being sent to server:", basePayload);

    if (mode === "c") {
      createMutation.mutate(basePayload);
    } else {
      const updatePayload: UpdateLinkPayload = {
        ...basePayload,
        AttachmentURLGUID: attachmentURLGUID,
      };
      console.log("Update payload being sent to server:", updatePayload);
      updateMutation.mutate(updatePayload);
    }
  };

  // Update Checkbox handlers
  const handleIsAnonymousChange = (checked: boolean) => {
    setIsAnonymous(checked);
  };

  const handleDisableChange = (checked: boolean) => {
    setDisable(checked);
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
                <Label htmlFor="expiresOn">
                  {t("upsertLinksDialog.expiresOnLabel")} <span className="text-red-500 text-xs font-light">* {t("upsertLinksDialog.expiresOnRequired")}</span>
                </Label>
                
                <DatePicker
                  ref={calendarRef}
                  value={expiresOn}
                  onChange={(date) => setExpiresOn(date)}
                  calendar={dir === "rtl" ? persian : undefined}
                  locale={dir === "rtl" ? persian_fa : undefined}
                  format="YYYY/MM/DD"
                  minDate={getTodayDate(dir)}
                  className="custom-datepicker"
                  containerClassName="w-full"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    height: '40px',
                  }}
                />
                {/* <p className="text-sm text-gray-500">{t("upsertLinksDialog.expiresOnRequired")}</p> */}
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
                <Checkbox id="isAnonymous" checked={isAnonymous} onCheckedChange={handleIsAnonymousChange} />
                <Label htmlFor="isAnonymous">{t("upsertLinksDialog.isAnonymousLabel")}</Label>
              </div>

              {/* Disable (Only in Update Mode) */}
              {mode === "u" && !isInitialURL && (
                <div className="flex items-center space-x-2 gap-2">
                  <Checkbox id="disable" checked={disable}  disabled={isInitialURL} onCheckedChange={handleDisableChange}  />
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