"use client";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/data";
import { useAsyncLoader } from "@/components/RouteLoader";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { track } = useAsyncLoader();

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const response = await track(() => fetch("/api/user"))
        const payload = await response.json()

        if (!response.ok || payload.status !== "success") return

        if (cancelled) return

        const data = payload.data ?? {}
        setName(data.name ?? "")
        setEmail(data.email ?? "")
        setPrefs(Array.isArray(data.prefs) ? data.prefs : [])
      } catch (error) {
        console.warn("Gagal memuat profil onboarding:", error)
      }
    }

    loadProfile()

    return () => {
      cancelled = true
    }
  }, [track])

  const toggle = (c) => {
    setPrefs((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  };

  async function save() {
    setError("")
    const res = await track(() =>
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, prefs }),
      })
    );
    const payload = await res.json().catch(() => null)
    if (!res.ok || payload?.status !== "success") {
      setError(payload?.message ?? "Gagal menyimpan profil.")
      return
    }
    window.location.href = "/feed";
  }

  return (
    <div className="grid gap-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-2">Pilih kategori makanan</h1>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <input
            className="input"
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <p className="mt-4 text-gray-300">Pilih preferensi makanan:</p>

        {/* Custom dropdown */}
        <div className="relative mt-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="w-full flex justify-between items-center p-2 rounded bg-gray-800 border border-gray-600 text-white"
          >
            {prefs.length > 0 ? prefs.join(", ") : "Pilih kategori"}
            <span className="ml-2">▼</span>
          </button>

          {open && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto">
              {CATEGORIES.map((c) => (
                <div
                  key={c}
                  onClick={() => toggle(c)}
                  className={`p-2 cursor-pointer ${
                    prefs.includes(c)
                      ? "bg-emerald-700 text-white"
                      : "hover:bg-emerald-700"
                  }`}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview badge */}
        <div className="mt-3 flex flex-wrap gap-2">
          {prefs.map((p) => (
            <span key={p} className="badge bg-emerald-700 text-white">
              {p}
            </span>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={save} className="btn btn-primary">
            Simpan & Lanjut
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <p className="text-sm text-gray-400">Data preferensi kamu kini tersimpan aman di database.</p>
    </div>
  );
}
