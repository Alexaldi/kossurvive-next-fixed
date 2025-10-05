import "./globals.css"
import ClientNavbar from "@/components/ClientNavbar"
import RouteLoader from "@/components/RouteLoader"

export const metadata = {
  title: "KosSurvive",
  description: "Sehat hemat belajar—khusus anak kos.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <RouteLoader />
        <div className="flex min-h-screen flex-col">
          <ClientNavbar />
          <main className="flex-1 px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-6xl space-y-10">{children}</div>
          </main>
          <footer className="border-t border-slate-800/70 bg-slate-950/80 py-10 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} DevSpectra - KoSurvive.
          </footer>
        </div>
      </body>
    </html>
  )
}
