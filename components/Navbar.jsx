"use client"

import { useEffect, useMemo, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
    const supabase = useMemo(() => createClient(), [])
    const router = useRouter()
    const [userState, setUserState] = useState({
        loading: true,
        displayName: null,
        email: null,
        avatarUrl: null,
    })

    const displayInitial = useMemo(() => {
        const source = userState.displayName ?? userState.email ?? ""
        return source ? source.charAt(0).toUpperCase() : null
    }, [userState.displayName, userState.email])

    useEffect(() => {
        let isMounted = true

        const resolveUser = (user) => {
            if (!isMounted) return

            const metadata = user?.user_metadata ?? {}
            const prioritizedFields = [
                metadata.displayName,
                metadata.full_name,
                metadata.name,
                metadata.username,
                user?.email,
            ]
            const displayName =
                prioritizedFields
                    .map((value) => (typeof value === "string" ? value.trim() : ""))
                    .find((value) => value.length > 0) || null
            const avatarUrl = [metadata.avatar_url, metadata.picture]
                .map((value) => (typeof value === "string" ? value.trim() : ""))
                .find((value) => value.length > 0)

            setUserState({
                loading: false,
                displayName,
                email: user?.email ?? null,
                avatarUrl: avatarUrl || null,
            })
        }

        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser()
            if (error) {
                console.error("Get user error:", error.message)
                resolveUser(null)
                return
            }
            resolveUser(data?.user ?? null)
        }

        fetchUser()

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            resolveUser(session?.user ?? null)
        })

        return () => {
            isMounted = false
            authListener?.subscription?.unsubscribe()
        }
    }, [supabase])

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Yakin mau logout?")
        if (!confirmLogout) return

        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error("Logout error:", error.message)
            alert("Gagal logout, coba lagi")
        } else {
            router.push("/login")
        }
    }

    return (
        <header className="border-b border-gray-800 bg-transparent backdrop-blur-lg">
            <nav className="container mx-auto flex items-center justify-between py-4 px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/Logo.png"
                        alt="KoSurvive Logo"
                        width={120}
                        height={48}
                        className="h-12 w-auto"
                        priority
                    />
                </Link>

                {/* Tabs */}
                <div className="flex gap-4">
                    <Link
                        href="/feed"
                        className="text-gray-300 hover:text-white transition font-medium"
                    >
                        Makanan Sehat
                    </Link>
                    <Link
                        href="/olahraga"
                        className="text-gray-300 hover:text-white transition font-medium"
                    >
                        Olahraga
                    </Link>
                    <Link
                        href="/belajar"
                        className="text-gray-300 hover:text-white transition font-medium"
                    >
                        Belajar
                    </Link>
                    <Link
                        href="/onboarding"
                        className="text-gray-300 hover:text-white transition font-medium"
                    >
                        Pilih Makanan
                    </Link>
                </div>

                {/* User info & Logout */}
                <div className="flex items-center gap-4">
                    {userState.loading ? (
                        <div className="h-9 w-24 animate-pulse rounded-full bg-gray-700/60" aria-hidden="true" />
                    ) : userState.displayName ? (
                        <div className="flex items-center gap-2 rounded-full bg-gray-800/70 px-3 py-1">
                            {userState.avatarUrl ? (
                                <Image
                                    src={userState.avatarUrl}
                                    alt={userState.displayName}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : displayInitial ? (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                    {displayInitial}
                                </span>
                            ) : null}
                            <span className="text-sm font-medium text-gray-100">{userState.displayName}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-300">Tamu</span>
                    )}

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    )
}
