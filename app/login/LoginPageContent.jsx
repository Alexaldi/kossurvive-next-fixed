"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouteLoader } from "@/components/RouteLoader"

export function LoadingState() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3 text-slate-300">
                <span className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
                <p className="text-sm font-medium">Menyiapkan halaman masuk...</p>
            </div>
        </div>
    )
}

export default function LoginPageContent() {
    const router = useRouter()
    const { client: supabase, error: configError } = useMemo(() => {
        try {
            return { client: createClient(), error: null }
        } catch (error) {
            console.error("Supabase client init failed:", error)
            return { client: null, error }
        }
    }, [])
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const searchParams = useSearchParams()
    const { showLoader, hideLoader } = useRouteLoader()
    const nextParam = useMemo(() => {
        const value = searchParams?.get("next") ?? "/home"
        return value.startsWith("/") ? value : "/home"
    }, [searchParams])

    if (!supabase) {
        const message = configError?.message ?? "Supabase belum dikonfigurasi."
        return (
            <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-rose-200">
                <div className="max-w-md space-y-2 rounded-2xl border border-rose-400/30 bg-rose-950/40 p-6 backdrop-blur">
                    <p className="text-base font-semibold text-rose-100">Konfigurasi auth belum lengkap</p>
                    <p>{message}</p>
                    <p className="text-xs text-rose-300/80">
                        Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ke environment sebelum mencoba login.
                    </p>
                </div>
            </div>
        )
    }

    const buildCallbackUrl = () => {
        const basePath = "/auth/callback"
        if (!nextParam || nextParam === "/home") return basePath
        const url = new URL(basePath, window.location.origin)
        url.searchParams.set("next", nextParam)
        return `${url.pathname}${url.search}`
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        showLoader()
        setError("")

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                setError(error.message)
                hideLoader()
                setLoading(false)
                return
            }

            router.replace(buildCallbackUrl())
        } catch (err) {
            console.error(err)
            setError("Terjadi kesalahan tak terduga. Coba lagi.")
            hideLoader()
            setLoading(false)
        }
    }

    const handleGoogle = async () => {
        setLoading(true)
        showLoader()
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}${buildCallbackUrl()}`,
                },
            })
            if (error) {
                console.error(error)
                hideLoader()
                setLoading(false)
            }
        } catch (err) {
            console.error(err)
            hideLoader()
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md bg-[rgba(30,30,46,0.7)] backdrop-blur-xl rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Masuk</h1>
                    <p className="text-sm text-gray-400">Akses akun Anda</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="nama@email.com"
                            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300">Kata Sandi</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="********"
                            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold shadow hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2 text-sm font-semibold">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                                Memproses
                            </span>
                        ) : (
                            "Masuk"
                        )}
                    </button>
                </form>

                <div className="flex items-center gap-2 my-6 text-gray-400 text-sm">
                    <div className="flex-grow h-px bg-white/10" />
                    <span>atau</span>
                    <div className="flex-grow h-px bg-white/10" />
                </div>

                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    type="button"
                    className="w-full py-3 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <span className="flex items-center gap-2 text-sm font-semibold">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                            Menyiapkan
                        </span>
                    ) : (
                        <>
                            <img
                                src="https://www.svgrepo.com/show/355037/google.svg"
                                alt="Google"
                                className="h-5 w-5"
                            />
                            Lanjutkan dengan Google
                        </>
                    )}
                </button>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Belum punya akun?{" "}
                    <a href="/register" className="text-indigo-400 hover:underline">
                        Daftar
                    </a>
                </p>
            </div>
        </div>
    )
}

