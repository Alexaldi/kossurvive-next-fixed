import "./globals.css"

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
