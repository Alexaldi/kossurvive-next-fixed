import Link from "next/link"
import { ArrowRight, CheckCircle2, Heart, LayoutDashboard, ShieldCheck, Sparkles, Users } from "lucide-react"

const highlightStats = [
    { label: "Mahasiswa aktif", value: "12K+", description: "Sudah pakai KoSurvive buat ngatur hidup anak kos." },
    { label: "Resep hemat", value: "120+", description: "Menu bergizi dengan budget di bawah 20 ribu." },
    { label: "Rutinitas jadi", value: "87%", description: "Pengguna bilang habit mereka jadi lebih konsisten." },
]

const landingFeatures = [
    {
        title: "Jalani hari dengan terarah",
        description: "Dashboard sederhana berisi ringkasan makan, olahraga, dan jadwal supaya kamu tahu langkah selanjutnya.",
        icon: LayoutDashboard,
    },
    {
        title: "Personalisasi sesuai kebutuhan",
        description: "KoSurvive menyesuaikan rekomendasi berdasarkan preferensi makanan, alergi, dan target kesehatanmu.",
        icon: CheckCircle2,
    },
    {
        title: "Komunitas anak kos",
        description: "Dapatkan dukungan lewat challenge bareng teman kos supaya makin semangat jaga rutinitas.",
        icon: Users,
    },
]

const roadmap = [
    "Integrasi kalender akademik biar nggak miss deadline.",
    "Catat pengeluaran otomatis dari struk digital.",
    "Fitur tantangan komunitas dengan leaderboard mingguan.",
]

export default function LandingPage() {
    return (
        <div className="space-y-20">
            <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
                <div className="space-y-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Platform gaya hidup sehat anak kos
                    </span>
                    <div className="space-y-5">
                        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                            Hidup di kos makin gampang: atur makan, olahraga, dan belajar dalam satu tempat.
                        </h1>
                        <p className="text-lg text-slate-300 sm:max-w-xl">
                            KoSurvive bantu kamu biar tetap sehat dan produktif tanpa mengorbankan budget. Cocok buat kamu yang lagi ngejar target akademik dan mau hidup lebih teratur.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/register" className="btn btn-primary">
                            Daftar gratis
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                            href="/login"
                            className="btn btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                        >
                            Sudah punya akun
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {highlightStats.map(({ label, value, description }) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-5 shadow-inner shadow-slate-950/40"
                            >
                                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
                                <p className="text-xs text-slate-400">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-800/70 bg-slate-950/70 p-8 shadow-2xl shadow-emerald-500/10">
                    <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute right-10 bottom-0 h-44 w-44 rounded-full bg-indigo-500/20 blur-3xl" />
                    <div className="relative space-y-6">
                        <div className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6">
                            <p className="text-sm text-slate-300">
                                "Pas mulai skripsi rasanya chaos banget. Setelah pakai KoSurvive, jadwal makan dan olahraga jadi lebih teratur dan aku nggak gampang drop lagi."
                            </p>
                            <p className="mt-4 text-sm font-semibold text-white">- Naya, mahasiswa tingkat akhir</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20">
                                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                                </div>
                                Data kamu aman karena semua autentikasi dikelola lewat Supabase.
                            </div>
                            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
                                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20">
                                    <Heart className="h-5 w-5" aria-hidden="true" />
                                </div>
                                Jadwal self-care dipersonalisasi biar kesehatan mental tetap terjaga.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="card space-y-8">
                <div className="space-y-3 text-center sm:text-left">
                    <h2 className="text-2xl font-semibold text-white">Kenapa harus coba KoSurvive?</h2>
                    <p className="text-sm text-slate-300 sm:max-w-3xl">
                        Semua modul dibuat bareng ahli gizi, instruktur kebugaran, dan mentor produktivitas yang ngerti kehidupan anak kos. Satu platform untuk tetap sehat, hemat, dan fokus.
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {landingFeatures.map(({ title, description, icon: Icon }) => (
                        <div
                            key={title}
                            className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6 transition hover:border-emerald-400/40 hover:bg-slate-900"
                        >
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                                <Icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">{title}</h3>
                            <p className="mt-2 text-sm text-slate-300">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-8 shadow-xl shadow-slate-950/40">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Roadmap fitur</p>
                        <h2 className="text-2xl font-semibold text-white">Fitur yang lagi kami siapkan buat kamu</h2>
                        <p className="text-sm text-slate-300">
                            Kami terus kembangin KoSurvive biar makin relevan. Ini daftar singkat update yang segera hadir.
                        </p>
                    </div>
                    <Link href="/register" className="btn btn-primary whitespace-nowrap">
                        Gabung sekarang
                    </Link>
                </div>
                <ul className="mt-6 grid gap-3 text-sm text-slate-200">
                    {roadmap.map((item) => (
                        <li key={item} className="flex items-start gap-3 rounded-2xl border border-slate-800/60 bg-slate-900/70 p-4">
                            <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}
