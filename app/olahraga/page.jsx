"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Brain, Dumbbell, HeartPulse, MoonStar, Smile, Sparkles, SunMedium, Timer } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { useAsyncLoader } from "@/components/RouteLoader";

const MOOD_CHOICES = [
  {
    value: "🔥 Semangat",
    label: "🔥 Semangat",
    hint: "Siap gerak penuh energi",
    icon: Sparkles,
  },
  {
    value: "🙂 Biasa",
    label: "🙂 Biasa",
    hint: "Mood stabil, bisa olahraga santai",
    icon: Smile,
  },
  {
    value: "😴 Lelah",
    label: "😴 Lelah",
    hint: "Butuh pemulihan ringan",
    icon: MoonStar,
  },
  {
    value: "😕 Stres",
    label: "😕 Stres",
    hint: "Perlu release ketegangan",
    icon: Brain,
  },
];

const MOOD_SOLUTIONS = {
  "🔥 Semangat": "Pertahankan energi positifmu hari ini!",
  "🙂 Biasa": "Hari yang tenang, nikmati momen sederhana.",
  "😴 Lelah": "Coba istirahat sejenak atau lakukan olahraga ringan.",
  "😕 Stres": "Ambil napas dalam-dalam, coba olahraga singkat untuk relaksasi.",
};

const WORKOUT_SUGGESTIONS = {
  "🔥 Semangat": {
    name: "5 Menit Full Body",
    moves: ["Jumping jack 60s", "Push-up 30s", "Plank 30s", "Squat 45s", "Stretch 1m"],
  },
  "🙂 Biasa": {
    name: "Plank Ladder",
    moves: ["Plank 20s", "Rest 10s", "Plank 30s", "Rest 10s", "Plank 40s"],
  },
  "😴 Lelah": {
    name: "Stretching Kamar",
    moves: ["Neck roll", "Shoulder stretch", "Hamstring stretch", "Hip opener"],
  },
  "😕 Stres": {
    name: "Stretching Kamar",
    moves: ["Neck roll", "Shoulder stretch", "Hamstring stretch", "Hip opener"],
  },
};

export default function Olahraga() {
  const [workouts, setWorkouts] = useState([]);
  const [mood, setMood] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [recommendedWorkout, setRecommendedWorkout] = useState(null);
  const { track } = useAsyncLoader();

  useEffect(() => {
    async function loadWorkouts() {
      const data = await track(() => fetch("/api/workouts").then((r) => r.json()));
      setWorkouts(data);
    }
    loadWorkouts();
  }, [track]);

  async function submitMood() {
    if (!mood) {
      setToast("Silakan pilih mood dulu!");
      setTimeout(() => setToast(""), 2500);
      return;
    }

    await track(() =>
      fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      })
    );

    setMessage(MOOD_SOLUTIONS[mood] || "");
    setRecommendedWorkout(WORKOUT_SUGGESTIONS[mood] || null);
    setMood("");
    setToast("Rekaman anda sudah di simpan !");
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div className="space-y-12">
      <PageHero
        eyebrow="Ritme tubuh"
        title="Olahraga ringan biar badan tetap fit di kos"
        description="Tetap aktif meski ruang gerak terbatas. Pilih workout singkat, catat mood harian, dan dapatkan rekomendasi gerakan yang sesuai energimu."
        actions={
          <>
            <button onClick={() => document.getElementById("workout-section")?.scrollIntoView({ behavior: "smooth" })} className="btn btn-primary">
              Lihat daftar workout
            </button>
            <Link
              href="/kalender"
              className="btn btn-outline border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
            >
              Atur jadwal workout
            </Link>
            <button
              onClick={() => document.getElementById("mood-section")?.scrollIntoView({ behavior: "smooth" })}
              className="btn btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              Catat mood sekarang
            </button>
          </>
        }
      >
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-6 shadow-inner shadow-emerald-500/20">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
              <SunMedium className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Rutinitas sehat</p>
              <p className="text-lg font-semibold text-white">Durasi pendek, efek panjang</p>
              <p className="text-sm text-slate-300">
                Sesi 5-10 menit sudah cukup buat jaga stamina dan fokus belajar.
              </p>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Gerakan</dt>
              <dd className="mt-2 text-lg font-semibold text-white">{workouts.length} paket</dd>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Waktu</dt>
              <dd className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
                <Timer className="h-4 w-4 text-emerald-200" aria-hidden="true" />5-10 mnt
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
              <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Fokus</dt>
              <dd className="mt-2 text-lg font-semibold text-white">Mood & energi</dd>
            </div>
          </dl>
        </div>
      </PageHero>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section id="workout-section" className="card space-y-6 scroll-mt-28">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
                <Dumbbell className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">Pilihan workout singkat</h2>
                <p className="text-sm text-slate-300">
                  Setiap paket bisa kamu lakukan di kamar kos tanpa alat tambahan.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/60 p-5 transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{w.name}</h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{w.moves.length} langkah</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                    <HeartPulse className="h-4 w-4" aria-hidden="true" />Fokus tubuh
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {w.moves.map((m, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="mood-section" className="card relative space-y-6 scroll-mt-28">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
              <Brain className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">Mood tracker</h2>
              <p className="text-sm text-slate-300">
                Tandai perasaanmu lalu simpan, supaya rekomendasi olahraga makin relevan.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {MOOD_CHOICES.map(({ value, label, hint, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setMood(value);
                }}
                className={`rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4 text-left transition duration-200 hover:border-emerald-400/40 hover:bg-slate-900/60 ${
                  mood === value
                    ? "border-emerald-400/60 bg-emerald-500/10 text-white shadow-inner shadow-emerald-500/30"
                    : "text-slate-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-xs text-slate-300">{hint}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button onClick={submitMood} className="btn btn-primary w-full sm:w-auto">
            Simpan mood
          </button>

          {message && (
            <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100 animate-fade-in">
              {message}
            </div>
          )}

          {recommendedWorkout && (
            <div className="space-y-3 rounded-2xl border border-slate-800/60 bg-slate-950/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <HeartPulse className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                {recommendedWorkout.name}
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                {recommendedWorkout.moves.map((m, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {toast && (
            <div className="animate-toast-in absolute -top-4 right-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              {toast}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
