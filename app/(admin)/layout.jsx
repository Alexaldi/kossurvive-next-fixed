import Link from "next/link"

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 py-4">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6">
          <div className="text-lg font-semibold tracking-tight text-slate-100">KoSurvive Admin</div>
          <Link
            href="/"
            className="rounded-md border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:border-emerald-500/60 hover:text-emerald-200"
          >
            Kembali ke situs utama
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-6 py-10">{children}</div>
      </main>
    </div>
  )
}
