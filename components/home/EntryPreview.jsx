"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

const initialState = {
    loading: true,
    entries: [],
    error: null,
}

export default function EntryPreview() {
    const [state, setState] = useState(initialState)

    useEffect(() => {
        const controller = new AbortController()

        const loadEntries = async () => {
            try {
                const response = await fetch("/api/entries?limit=3", {
                    signal: controller.signal,
                })

                if (!response.ok) {
                    const payload = await response.json().catch(() => null)
                    throw new Error(payload?.message ?? "Gagal memuat data aktivitas.")
                }

                const payload = await response.json()
                setState({ loading: false, entries: payload.data?.entries ?? [], error: null })
            } catch (error) {
                if (error.name === "AbortError") return
                setState({ loading: false, entries: [], error: error.message })
            }
        }

        loadEntries()

        return () => controller.abort()
    }, [])

    if (state.loading) {
        return (
            <section className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-inner shadow-slate-950/40">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Aktivitas terbaru kamu</h2>
                    <span className="text-xs text-slate-400">Memuat...</span>
                </div>
                <div className="mt-6 grid gap-3">
                    {[...Array(3).keys()].map((index) => (
                        <div
                            key={index}
                            className="animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4"
                        >
                            <div className="h-4 w-40 rounded bg-slate-800" />
                            <div className="mt-3 h-3 w-56 rounded bg-slate-800" />
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (state.error) {
        return (
            <section className="rounded-3xl border border-rose-500/40 bg-rose-950/40 p-6 text-rose-100">
                <h2 className="text-lg font-semibold">Aktivitas terbaru</h2>
                <p className="mt-2 text-sm text-rose-200/80">{state.error}</p>
                <p className="mt-4 text-xs text-rose-200/70">
                    Pastikan sudah login dan environment Supabase & database telah dikonfigurasi.
                </p>
            </section>
        )
    }

    if (state.entries.length === 0) {
        return (
            <section className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 text-slate-300">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Aktivitas terbaru kamu</h2>
                    <Link href="/tambah-aktivitas" className="text-sm font-semibold text-emerald-300">
                        Catat sekarang
                    </Link>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                    Belum ada catatan aktivitas. Mulai catat makanan, olahraga, atau sesi belajar kamu untuk melihat ringkasannya di sini.
                </p>
            </section>
        )
    }

    return (
        <section className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-inner shadow-emerald-500/10">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Aktivitas terbaru kamu</h2>
                <Link href="/kalender" className="text-sm font-semibold text-emerald-300">
                    Lihat semua
                </Link>
            </div>
            <div className="mt-6 grid gap-3">
                {state.entries.map((entry) => (
                    <article
                        key={entry.id}
                        className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-base font-semibold text-white">{entry.title}</h3>
                            {entry.mood && (
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                                    {entry.mood}
                                </span>
                            )}
                        </div>
                        {entry.description && (
                            <p className="mt-2 text-sm text-slate-300">{entry.description}</p>
                        )}
                        <time className="mt-3 block text-xs text-slate-500">
                            {new Date(entry.occurredAt ?? entry.createdAt).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short",
                            })}
                        </time>
                    </article>
                ))}
            </div>
        </section>
    )
}
