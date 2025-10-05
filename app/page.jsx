import ChatBot from "@/components/ChatBot"
import Link from "next/link"
import {
  ArrowRight,
  CalendarClock,
  ChefHat,
  Dumbbell,
  GraduationCap,
  Sparkles,
} from "lucide-react"

const featureHighlights = [
  {
    icon: ChefHat,
    title: "Resep Hemat & Sehat",
    description:
      "Menu harian dengan bahan sederhana, kalkulasi kalori, dan estimasi biaya jelas.",
    href: "/feed",
  },
  {
    icon: Dumbbell,
    title: "Olahraga Tanpa Ribet",
    description:
      "Rutinitas 15 menit, tanpa alat, plus tracker mood supaya tubuh dan mental tetap segar.",
    href: "/olahraga",
  },
  {
    icon: GraduationCap,
    title: "Skill Kilat Anak Kos",
    description:
      "Playlist belajar praktis: budgeting, masak dasar, sampai produktivitas sebelum deadline.",
    href: "/belajar",
  },
]

const quickActions = [
  {
    title: "Atur preferensi makan",
    description: "Kurasi menu sesuai selera dan alergi kamu biar rekomendasinya makin akurat.",
    href: "/onboarding",
  },
  {
    title: "Catat jadwal penting",
    description: "Pakai kalender aktivitas buat ingetin olahraga, masak bareng, atau deadline tugas.",
    href: "/kalender",
  },
]

export default function Home() {
  return (
    <>
      <section className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Hidup anak kos biar tetap balance
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Bikin hari-hari anak kos jadi lebih sehat, produktif, dan hemat.
            </h1>
            <p className="text-lg text-slate-300 sm:max-w-xl">
              KoSurvive bantu kamu ngatur makan, olahraga, sampai belajar tanpa ribet. Semua
              dikurasi supaya pas dengan ritme hidup anak kos modern.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding" className="btn btn-primary">
              Mulai personalisasi
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/feed"
              className="btn btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              Lihat rekomendasi
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {["+120 resep", "+40 workout", "+30 modul"].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-5 text-center text-sm text-slate-300 shadow-inner shadow-slate-950/40"
              >
                <p className="text-lg font-semibold text-white">{item}</p>
                <p>Siap dipakai kapan saja</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card relative overflow-hidden">
          <div className="absolute right-8 top-8 hidden h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl lg:block" />
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative space-y-6">
            <h2 className="text-2xl font-semibold text-white">Progress mingguan kamu</h2>
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">Konsistensi makan sehat</p>
                  <p className="text-lg font-semibold text-emerald-300">4 dari 5 hari</p>
                </div>
                <ChefHat className="h-8 w-8 text-emerald-300" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">Sesi olahraga selesai</p>
                  <p className="text-lg font-semibold text-indigo-300">3 kali minggu ini</p>
                </div>
                <Dumbbell className="h-8 w-8 text-indigo-300" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-400">Jam belajar fokus</p>
                  <p className="text-lg font-semibold text-cyan-300">6 jam efektif</p>
                </div>
                <GraduationCap className="h-8 w-8 text-cyan-300" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {featureHighlights.map(({ icon: Icon, title, description, href }) => (
          <Link key={title} href={href} className="card group h-full">
            <div className="flex h-full flex-col gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 transition group-hover:scale-105 group-hover:bg-emerald-500/25">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-300">{description}</p>
              </div>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                Jelajahi fitur
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="card space-y-4">
          <h2 className="text-2xl font-semibold text-white">Langkah cepat buat kamu</h2>
          <p className="text-sm text-slate-300">
            Kunci keseharianmu biar lebih teratur. Tinggal pilih aksi yang paling urgent hari ini.
          </p>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-start gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 transition hover:border-emerald-400/50 hover:bg-slate-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-300">
                  <CalendarClock className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{action.title}</h3>
                  <p className="text-sm text-slate-300">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card grid gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">Tips of the day</h2>
            <p className="text-sm text-slate-300">
              Manfaatkan insight kecil ini buat nge-boost produktivitas kamu hari ini.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Gunakan meal-prep 2x seminggu supaya menu sehat kamu siap santap kapan aja.",
              "Stretching 5 menit tiap 90 menit belajar bisa ningkatin fokus dan mood.",
              "Catat pengeluaran harian langsung setelah transaksi biar dompet aman.",
            ].map((tip) => (
              <div
                key={tip}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-inner shadow-slate-950/30"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-6 overflow-hidden text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">Siap upgrade hidup anak kos kamu?</h2>
          <p className="text-sm text-slate-300">
            Terus eksplor fitur KoSurvive dan lihat gimana rutinitas kamu jadi lebih terarah, tanpa nguras dompet.
          </p>
        </div>
        <Link
          href="/feed"
          className="btn btn-primary whitespace-nowrap"
        >
          Lanjut eksplor
        </Link>
      </section>

      <ChatBot />
    </>
  )
}
