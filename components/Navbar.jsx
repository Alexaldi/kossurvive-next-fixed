"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, LogOut, Menu, ShieldCheck, X } from "lucide-react"

const navigationLinks = [
    { href: "/feed", label: "Makanan Sehat" },
    { href: "/olahraga", label: "Olahraga" },
    { href: "/belajar", label: "Belajar" },
    { href: "/onboarding", label: "Pilih Makanan" },
]

const hiddenRoutes = ["/login", "/register", "/auth/callback"]

export default function Navbar() {
    const isSupabaseConfigured = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const supabase = useMemo(
        () => (isSupabaseConfigured ? createClient() : null),
        [isSupabaseConfigured]
    )
    const router = useRouter()
    const pathname = usePathname()
    const [userState, setUserState] = useState({
        loading: true,
        displayName: null,
        email: null,
        avatarUrl: null,
    })
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [feedback, setFeedback] = useState(null)
    const profileSectionRef = useRef(null)

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

        if (!supabase) {
            setUserState({
                loading: false,
                displayName: null,
                email: null,
                avatarUrl: null,
            })
            return
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                profileSectionRef.current &&
                !profileSectionRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (!feedback) return

        const timer = setTimeout(() => {
            setFeedback(null)
        }, 3500)

        return () => clearTimeout(timer)
    }, [feedback])

    useEffect(() => {
        setIsDropdownOpen(false)
        setIsMobileMenuOpen(false)
    }, [pathname])

    const toggleDropdown = () => {
        setIsDropdownOpen((previous) => !previous)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((previous) => !previous)
    }

    const requestLogout = () => {
        setIsConfirmOpen(true)
        setIsDropdownOpen(false)
        setIsMobileMenuOpen(false)
    }

    const handleLogout = async () => {
        if (!supabase) {
            setFeedback({
                type: "error",
                message: "Supabase belum dikonfigurasi, logout sementara dinonaktifkan.",
            })
            setIsConfirmOpen(false)
            return
        }

        setIsLoggingOut(true)
        const { error } = await supabase.auth.signOut()
        setIsLoggingOut(false)

        if (error) {
            console.error("Logout error:", error.message)
            setFeedback({
                type: "error",
                message: "Gagal logout. Coba lagi ya!",
            })
            return
        }

        setIsConfirmOpen(false)
        setIsMobileMenuOpen(false)
        router.push("/login")
        router.refresh()
    }

    if (hiddenRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
        return null
    }

    if (userState.loading) {
        return null
    }

    if (!userState.displayName) {
        return null
    }

    return (
        <>
            <header className="navbar border-b border-slate-800/70 bg-transparent">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="flex h-20 items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex flex-1 items-center gap-4">
                        <Link href="/home" className="flex items-center gap-3">
                            <Image
                                src="/Logo.png"
                                alt="KoSurvive Logo"
                                width={120}
                                height={48}
                                className="h-12 w-auto"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-slate-200 lg:flex">
                        {navigationLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative transition hover:text-white ${
                                    pathname === item.href
                                        ? "text-white after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-8 after:-translate-x-1/2 after:rounded-full after:bg-emerald-400"
                                        : "text-slate-300"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop User info & Logout */}
                    <div
                        ref={profileSectionRef}
                        className="relative hidden flex-1 items-center justify-end lg:flex"
                    >
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center gap-3 rounded-full bg-slate-900/80 px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800/80"
                            aria-haspopup="menu"
                            aria-expanded={isDropdownOpen}
                        >
                            {userState.avatarUrl ? (
                                <Image
                                    src={userState.avatarUrl}
                                    alt={userState.displayName}
                                    width={36}
                                    height={36}
                                    className="h-9 w-9 rounded-full object-cover"
                                />
                            ) : displayInitial ? (
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                                    {displayInitial}
                                </span>
                            ) : null}
                            <span className="font-medium">{userState.displayName}</span>
                        </button>

                        {isDropdownOpen && (
                            <div
                                role="menu"
                                aria-orientation="vertical"
                                className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 shadow-xl backdrop-blur"
                            >
                                <button
                                    onClick={requestLogout}
                                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-600/10 hover:text-red-100"
                                    role="menuitem"
                                >
                                    <LogOut className="h-4 w-4" aria-hidden="true" />
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu trigger */}
                    <div className="flex items-center justify-end lg:hidden">
                        <button
                            type="button"
                            onClick={toggleMobileMenu}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-900/60 text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
                            aria-label="Buka navigasi"
                            aria-expanded={isMobileMenuOpen}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </nav>

                {isMobileMenuOpen && (
                    <div className="lg:hidden">
                        <div className="mt-4 space-y-6 rounded-2xl border border-slate-800/80 bg-slate-950/95 p-6 shadow-xl backdrop-blur">
                            <nav className="grid gap-3 text-sm font-medium text-slate-200">
                                {navigationLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`rounded-xl px-4 py-2 transition hover:bg-slate-900 ${
                                            pathname === item.href ? "bg-slate-900 text-white" : ""
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="rounded-2xl bg-slate-900/60 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        {userState.avatarUrl ? (
                                            <Image
                                                src={userState.avatarUrl}
                                                alt={userState.displayName}
                                                width={40}
                                                height={40}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white">
                                                {displayInitial}
                                            </span>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-white">{userState.displayName}</p>
                                            {userState.email && (
                                                <p className="text-xs text-slate-400">{userState.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={requestLogout}
                                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
                                    >
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                        Keluar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </header>

            {isConfirmOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur"
                    onClick={() => {
                        if (!isLoggingOut) {
                            setIsConfirmOpen(false)
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="w-full max-w-sm rounded-3xl border border-slate-800/70 bg-slate-950/95 p-6 text-slate-100 shadow-2xl shadow-emerald-500/10"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 text-red-400">
                                <LogOut className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Keluar dari KoSurvive?</h3>
                                <p className="text-sm text-slate-400">
                                    Sesi kamu akan ditutup. Kamu bisa login lagi kapan pun.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button
                                onClick={() => setIsConfirmOpen(false)}
                                className="btn btn-outline"
                                type="button"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500"
                                type="button"
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? "Memproses..." : "Ya, logout"}
                            </button>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                            <span>Keamanan data kamu tetap terjaga.</span>
                        </div>
                    </div>
                </div>
            )}

            {feedback && (
                <div className="fixed bottom-6 right-6 z-50 max-w-xs animate-toast-in rounded-2xl border border-red-500/40 bg-slate-950/95 p-4 text-sm text-red-100 shadow-xl shadow-red-900/40">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <div>
                            <p className="font-semibold">Ups!</p>
                            <p className="text-slate-200">{feedback.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
