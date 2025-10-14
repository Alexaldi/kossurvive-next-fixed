import { Suspense } from "react"
import "./globals.css"
import ClientNavbar from "@/components/ClientNavbar"
import RouteLoaderProvider from "@/components/RouteLoader"

export const metadata = {
  title: "KosSurvive",
  description: "Sehat hemat belajar—khusus anak kos.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
