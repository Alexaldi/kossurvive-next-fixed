"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
    const supabase = createClient()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        // arahkan ke callback supaya flow sinkronisasi konsisten dengan OAuth
        window.location.href = "/auth/callback"
    }

    const handleGoogle = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })
        if (error) console.error(error)
        setLoading(false)
    }


    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md bg-[rgba(30,30,46,0.7)] backdrop-blur-xl rounded-2xl shadow-xl p-8">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Masuk</h1>
                    <p className="text-sm text-gray-400">Akses akun Anda</p>
                </div>

                {/* Form */}
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
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white font-semibold shadow hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? "Loading..." : "Masuk"}
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-2 my-6 text-gray-400 text-sm">
                    <div className="flex-grow h-px bg-white/10" />
                    <span>atau</span>
                    <div className="flex-grow h-px bg-white/10" />
                </div>

                {/* Google login */}
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
                    Lanjutkan dengan Google
                </button>

                {/* Link ke register */}
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
