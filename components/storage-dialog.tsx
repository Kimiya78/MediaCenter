"use client"

import { useEffect, useState } from "react"
import { HardDrive  , Cloud} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import ConfigURL from "@/config";
import { useDirection } from "@/components/folder-manager/context";



// Define the response type
interface StorageResponse {
  total_file_size: number
}

// Function to format bytes to a readable format
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export default function StorageSidebar() {
  const { dir } = useDirection();
  const [storageData, setStorageData] = useState<StorageResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const maxStorage = 5 // Maximum storage in GB
  const maxStorageBytes = maxStorage * 1024 * 1024 * 1024 // Convert to bytes

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${ConfigURL.baseUrl}/get-Filesize`)

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data: StorageResponse = await response.json()
        setStorageData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch storage data")
        console.error("Error fetching storage data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStorageData()
  }, [])

  // Calculate percentage used
  const percentageUsed = storageData ? (storageData.total_file_size / maxStorageBytes) * 100 : 0

  // Ensure percentage doesn't exceed 100%
  const clampedPercentage = Math.min(percentageUsed, 100)

  return (
    <div className="p-2">
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cloud className="h-5 w-5 text-foreground" />
            <span className="font-medium">Storage</span>
          </div>

          <div className="space-y-2">
            <Progress
              value={clampedPercentage}
              className={cn(
                "h-2",
                clampedPercentage > 90 ? "bg-muted [&>div]:bg-destructive" : "bg-muted [&>div]:bg-primary",
              )}
            />

            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading storage information...</p>
            ) : error ? (
              <p className="text-xs text-destructive">Error loading storage data</p>
            ) : storageData ? (
              <p className="text-xs text-muted-foreground">
                {dir === "rtl" 
                  ? `استفاده شده ${maxStorage}GB از ${formatBytes(storageData.total_file_size)}`
                  : `${formatBytes(storageData.total_file_size)}  of ${maxStorage}GB used`
                }
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

