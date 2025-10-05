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
        <RouteLoaderProvider>
          <div className="relative flex min-h-screen flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-0 -z-10 opacity-90">
              <div className="absolute -left-1/2 top-[-25%] h-[420px] w-[720px] rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="absolute right-[-30%] top-[15%] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="absolute bottom-[-20%] left-[10%] h-[320px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.08),_transparent_60%)]" />
            </div>

            <ClientNavbar />
            <main className="relative flex-1 px-4 py-12 sm:px-6 lg:px-12">
              <div className="mx-auto w-full max-w-6xl space-y-16">{children}</div>
            </main>
            <footer className="relative border-t border-slate-800/70 bg-slate-950/80 py-10 text-center text-sm text-slate-400">
              © {new Date().getFullYear()} DevSpectra - KoSurvive.
            </footer>
          </div>
        </RouteLoaderProvider>
      </body>
    </html>
  )
}
