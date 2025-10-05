"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
    const supabase = createClient()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const searchParams = useSearchParams()
    const nextParam = useMemo(() => {
        const value = searchParams?.get("next") ?? "/"
        return value.startsWith("/") ? value : "/"
    }, [searchParams])

    const buildCallbackUrl = () => {
        const basePath = "/auth/callback"
        const url = new URL(basePath, window.location.origin)
        if (nextParam && nextParam !== "/") {
            url.searchParams.set("next", nextParam)
        }
        return `${url.pathname}${url.search}`
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        const trimmedDisplayName = displayName.trim()

        if (!trimmedDisplayName) {
            setError("Nama tampilan wajib diisi")
            return
        }

        if (password !== confirmPassword) {
            setError("Kata sandi tidak cocok")
            return
        }
        setLoading(true)
        setError("")
        setMessage("")
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: "user",
                    full_name: trimmedDisplayName,
                    display_name: trimmedDisplayName,
                },
                emailRedirectTo: `${window.location.origin}${buildCallbackUrl()}`,
            },
        })
        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        const hasSession = Boolean(data?.session)
        if (hasSession) {
            window.location.href = buildCallbackUrl()
            return
        }

        setMessage("✅ Akun berhasil dibuat, cek email untuk verifikasi!")
        setLoading(false)
    }

    const handleGoogle = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}${buildCallbackUrl()}`,
            },
        })
        if (error) setError(error.message)
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md bg-[rgba(30,30,46,0.7)] backdrop-blur-xl rounded-2xl shadow-xl p-8">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Daftar</h1>
                    <p className="text-sm text-gray-400">Buat akun baru</p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-300">Nama Tampilan</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            placeholder="Nama yang akan ditampilkan"
                            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
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
                            placeholder="Minimal 8 karakter"
                            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300">Konfirmasi Sandi</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Ulangi kata sandi"
                            className="w-full mt-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    {message && <p className="text-green-400 text-sm">{message}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Daftar"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-2 my-6 text-gray-400 text-sm">
                    <div className="flex-grow h-px bg-white/10" />
                    <span>atau</span>
                    <div className="flex-grow h-px bg-white/10" />
                </div>

                {/* Google */}
                <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-full py-3 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg text-white font-semibold hover:bg-white/10 transition disabled:opacity-50"
                >
                    <img
                        src="https://www.svgrepo.com/show/355037/google.svg"
                        alt="Google"
                        className="h-5 w-5"
                    />
                    Daftar dengan Google
                </button>
                <p className="mt-6 text-center text-sm text-gray-400">
                    Sudah punya akun?{" "}
                    <a href="/login" className="text-indigo-400 hover:underline">
                        Masuk
                    </a>
                </p>
            </div>
        </div>
    )
}
