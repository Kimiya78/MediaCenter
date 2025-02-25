"use client";

import "@/app/globals.css"
import "@/styles/responsive.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
/*import {CookieManager} from "@/scr/CookieManager.js"*/
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const inter = Inter({ subsets: ["latin"] })
import Breadcrumbs from "@/components/Breadcrumbs";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const queryClient = new QueryClient();

  return (
    <html lang="en" suppressHydrationWarning className="overflow-hidden ">
      <body className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="media-center-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}


import './globals.css'