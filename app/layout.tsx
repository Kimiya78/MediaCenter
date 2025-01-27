import "@/app/globals.css"
import "@/styles/responsive.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
/*import {CookieManager} from "@/scr/CookieManager.js"*/

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="media-center-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'