import ChatBot from "@/components/ChatBot"
import Link from "next/link"
import {
    AlarmClockCheck,
    ArrowRight,
    BrainCircuit,
    ChefHat,
    Dumbbell,
    Flame,
    HeartPulse,
    Salad,
    Sparkles,
    Trophy,
} from "lucide-react"

const foodReels = [
    {
        title: "Teriyaki Ayam Wajan",
        vibe: "Protein tinggi",
        description: "Porsi kenyang 15 menit. Pakai dada ayam, saos teriyaki homemade, plus sayur beku.",
        calories: "450 kkal",
        price: "Rp18K",
        accent: "from-emerald-400 via-cyan-400 to-sky-500",
    },
    {
        title: "Overnight Oat Choco",
        vibe: "Sarapan manis",
        description: "Oat, yoghurt, dan pisang yang tinggal diambil dari kulkas. Energi stabil sampai siang.",
        calories: "320 kkal",
        price: "Rp12K",
        accent: "from-fuchsia-400 via-pink-400 to-orange-400",
    },
    {
        title: "Nasi Goreng Tofu",
        vibe: "Vegan praktis",
        description: "Tekstur crispy tofu + nasi dingin sisa kemarin. Tanpa MSG tapi tetap gurih.",
        calories: "480 kkal",
        price: "Rp15K",
        accent: "from-indigo-400 via-purple-400 to-emerald-400",
    },
    {
        title: "Salad Soba Segar",
        vibe: "Lunch ringan",
        description: "Mi soba, selada renyah, dressing wijen. Cocok buat makan siang cepet di kampus.",
        calories: "390 kkal",
        price: "Rp20K",
        accent: "from-teal-400 via-emerald-400 to-lime-400",
    },
]

const wellnessTracks = [
    {
        title: "Workout kilat 18 menit",
        description: "Tiga sesi HIIT tanpa alat + cooldown ringan. Cocok buat ngejar target 3x seminggu.",
        icon: Dumbbell,
        href: "/olahraga",
        tone: "bg-indigo-500/10 text-indigo-200",
    },
    {
        title: "Reset fokus malam",
        description: "Ritual 25 menit: journaling, peregangan, dan podcast refleksi sebelum tidur.",
        icon: BrainCircuit,
        href: "/belajar",
        tone: "bg-purple-500/10 text-purple-200",
    },
    {
        title: "Meal plan budget 3 hari",
        description: "Checklist belanja & meal prep Jumat malam biar weekend kamu tetap hemat.",
        icon: ChefHat,
        href: "/feed",
        tone: "bg-emerald-500/10 text-emerald-200",
    },
]

const microWins = [
    {
        label: "Air putih",
        value: "6/8 gelas",
        hint: "Tinggal dua gelas lagi biar target terpenuhi!",
        icon: HeartPulse,
        accent: "text-cyan-300",
    },
    {
        label: "Langkah kaki",
        value: "4.530 langkah",
        hint: "Tambah jalan sore 10 menit untuk tembus 6K.",
        icon: Flame,
        accent: "text-orange-300",
    },
    {
        label: "Jam belajar",
        value: "2,5 jam",
        hint: "Blok lagi 30 menit setelah makan malam.",
        icon: AlarmClockCheck,
        accent: "text-emerald-300",
    },
]

const focusBoosters = [
    {
        title: "Rencanakan minggu kamu",
        description: "Sinkronkan jadwal kuliah, shift part time, dan sesi olahraga dalam satu timeline.",
        href: "/kalender",
    },
    {
        title: "Kurasi bahan dapur",
        description: "Checklist belanja otomatis sesuai preferensi alergi dan budget per minggu.",
        href: "/onboarding",
    },
    {
        title: "Tracking pengeluaran",
        description: "Catat pengeluaran makan & transport langsung dari dashboard, bebas ribet.",
        href: "/feed",
    },
]

export default function AuthenticatedHome() {
    return (
        <div className="space-y-20">
            <section className="grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2.4fr)] lg:items-center">
                <div className="space-y-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Progress minggu ini kelihatan solid!
                    </span>
                    <div className="space-y-5">
                        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                            Halo, selamat datang kembali! Siap lanjutkan habit sehat dan produktifmu?
                        </h1>
                        <p className="text-lg text-slate-300 sm:max-w-xl">
                            KoSurvive bantu kamu balance antara makan bergizi, tubuh tetap aktif, dan tugas kuliah yang numpuk. Semua insight disusun sesuai preferensi yang kamu pilih.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/onboarding" className="btn btn-primary">
                            Update preferensi
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Link
                            href="/feed"
                            className="btn btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                        >
                            Buka meal plan
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                        {microWins.map(({ label, value, hint, icon: Icon, accent }) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 shadow-inner shadow-slate-950/40"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                                    <Icon className={`h-4 w-4 ${accent}`} aria-hidden="true" />
                                </div>
                                <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                                <p className="text-xs text-slate-400">{hint}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-800/70 bg-slate-950/70 p-8 shadow-2xl shadow-emerald-500/10">
                    <div className="absolute right-12 top-10 h-28 w-28 rounded-full bg-emerald-500/20 blur-3xl" />
                    <div className="absolute -left-10 bottom-6 h-44 w-44 rounded-full bg-indigo-500/10 blur-3xl" />
                    <div className="relative space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-400">Streak fokus</p>
                                <p className="text-3xl font-semibold text-white">8 hari</p>
                            </div>
                            <Trophy className="h-10 w-10 text-emerald-300" aria-hidden="true" />
                        </div>
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                                    <Salad className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Konsistensi nutrisi</p>
                                    <p className="text-lg font-semibold text-white">82% akurat minggu ini</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {wellnessTracks.map(({ title, description, icon: Icon, href, tone }) => (
                                <Link
                                    key={title}
                                    href={href}
                                    className="group rounded-2xl border border-slate-800/70 bg-slate-900/70 p-5 transition hover:border-emerald-400/50 hover:bg-slate-900"
                                >
                                    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <p className="text-base font-semibold text-white">{title}</p>
                                    <p className="mt-1 text-sm text-slate-300">{description}</p>
                                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300">
                                        Mulai sekarang
                                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden="true" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Rekomendasi makanan</p>
                        <h2 className="mt-1 text-2xl font-semibold text-white">Swipe ide makan kaya FYP tapi khusus anak kos</h2>
                        <p className="text-sm text-slate-300">Semua resep menyesuaikan preferensi kamu—tinggal pilih mau dimasak hari ini.</p>
                    </div>
                    <Link href="/feed" className="btn btn-outline border-emerald-400/40 bg-slate-900/70 text-sm">
                        Lihat semua resep
                    </Link>
                </div>
                <div className="overflow-x-auto pb-4">
                    <div className="flex snap-x gap-6">
                        {foodReels.map(({ title, description, vibe, calories, price, accent }) => (
                            <article
                                key={title}
                                className="group relative flex w-64 shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[32px] border border-white/5 bg-slate-900/40 p-6 shadow-[0_25px_45px_-25px_rgba(16,185,129,0.35)] backdrop-blur-xl"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60 transition duration-500 group-hover:opacity-80`} />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.15),_rgba(15,23,42,0.6))]" />
                                <div className="relative space-y-3">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-950/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                                        {vibe}
                                    </span>
                                    <h3 className="text-xl font-semibold text-white drop-shadow-md">{title}</h3>
                                    <p className="text-sm text-slate-100/90 drop-shadow-sm">{description}</p>
                                </div>
                                <div className="relative mt-6 flex items-center justify-between gap-4">
                                    <div className="space-y-1 text-xs font-semibold text-slate-100">
                                        <p className="uppercase tracking-widest">Kalori</p>
                                        <p className="text-lg text-white">{calories}</p>
                                    </div>
                                    <div className="space-y-1 text-xs font-semibold text-slate-100">
                                        <p className="uppercase tracking-widest">Budget</p>
                                        <p className="text-lg text-white">{price}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <div className="card space-y-6">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Fokus harian</p>
                        <h2 className="text-2xl font-semibold text-white">Checklist cepat supaya hari kamu tetap rapi</h2>
                        <p className="text-sm text-slate-300">Prioritaskan aksi yang bikin dampak paling kerasa buat tubuh dan jadwalmu.</p>
                    </div>
                    <div className="space-y-4">
                        {focusBoosters.map(({ title, description, href }) => (
                            <Link
                                key={title}
                                href={href}
                                className="flex items-start gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900"
                            >
                                <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                                <div>
                                    <h3 className="text-base font-semibold text-white">{title}</h3>
                                    <p className="text-sm text-slate-300">{description}</p>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4 text-emerald-300" aria-hidden="true" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="card space-y-6 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Mood tracker</p>
                            <h2 className="mt-1 text-2xl font-semibold text-white">Catatan singkat beberapa hari terakhir</h2>
                        </div>
                        <HeartPulse className="h-8 w-8 text-rose-300" aria-hidden="true" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {["Mood aman, energi stabil", "Tidur agak telat, atur ulang jadwal", "Butuh meal prep buat 2 hari", "Semangat, lanjutkan!"].map((item) => (
                            <div
                                key={item}
                                className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4 text-sm text-slate-200 shadow-inner shadow-slate-950/40"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="card flex flex-col gap-6 overflow-hidden text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-white">Tambah inspirasi baru?</h2>
                    <p className="text-sm text-slate-300">
                        Telusuri feed resep, olahraga, dan modul belajar terbaru. Algoritma kami siap menyesuaikan dengan target pribadimu.
                    </p>
                </div>
                <Link href="/feed" className="btn btn-primary whitespace-nowrap">
                    Eksplor konten terbaru
                </Link>
            </section>

            <ChatBot />
        </div>
    )
}
