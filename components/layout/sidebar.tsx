"use client"

import { ChevronDown, FolderClosed, Image, Video } from "lucide-react"
import Link from "next/link"

export function Sidebar() {
  return (
    <div className="w-64 h-screen border-r bg-background text-foreground">
      <div className="p-4 flex flex-col h-full">
        <h1 className="text-xl font-bold mb-8">Folders</h1>
        <nav className="space-y-2">
          <div>
            <Link href="/my-drive" className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
              <ChevronDown className="w-4 h-4 rtl:rotate-180" />
              <FolderClosed className="w-4 h-4" />
              My Drive
            </Link>
            <div className="ml-4 rtl:mr-4 rtl:ml-0 space-y-1">
              <Link href="/my-drive/documents" className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
                <FolderClosed className="w-4 h-4" />
                Documents
              </Link>
            </div>
          </div>
          <Link href="/my-drive/images" className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
            <Image className="w-4 h-4" />
            Images
          </Link>
          <Link href="/my-drive/videos" className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg">
            <Video className="w-4 h-4" />
            Videos
          </Link>
        </nav>
      </div>
    </div>
  )
}

