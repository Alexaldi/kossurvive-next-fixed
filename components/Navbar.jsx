"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LogOut, Menu, X } from "lucide-react"

const navigationLinks = [
    { href: "/feed", label: "Makanan Sehat" },
    { href: "/olahraga", label: "Olahraga" },
    { href: "/belajar", label: "Belajar" },
    { href: "/onboarding", label: "Pilih Makanan" },
]

export default function Navbar() {
    const supabase = useMemo(() => createClient(), [])
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
        setIsDropdownOpen(false)
        setIsMobileMenuOpen(false)
    }, [pathname])

    const toggleDropdown = () => {
        setIsDropdownOpen((previous) => !previous)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((previous) => !previous)
    }

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Yakin mau logout?")
        if (!confirmLogout) return

        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error("Logout error:", error.message)
            alert("Gagal logout, coba lagi")
        } else {
            router.push("/login")
            router.refresh()
            setIsDropdownOpen(false)
            setIsMobileMenuOpen(false)
        }
    }

    return (
        <header className="navbar border-b border-slate-800/70 bg-transparent">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <nav className="flex h-20 items-center justify-between gap-6">
                    {/* Logo */}
                    <div className="flex flex-1 items-center gap-4">
                        <Link href="/" className="flex items-center gap-3">
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
                        {userState.loading ? (
                            <div
                                className="h-10 w-10 animate-pulse rounded-full bg-slate-700/60"
                                aria-hidden="true"
                            />
                        ) : userState.displayName ? (
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
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                            >
                                Masuk
                            </Link>
                        )}

                        {isDropdownOpen && (
                            <div
                                role="menu"
                                aria-orientation="vertical"
                                className="absolute right-0 top-full mt-3 w-48 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 shadow-xl backdrop-blur"
                            >
                                <button
                                    onClick={handleLogout}
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
                                {userState.loading ? (
                                    <div className="h-12 w-12 animate-pulse rounded-full bg-slate-700/60" aria-hidden="true" />
                                ) : userState.displayName ? (
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
                                            ) : displayInitial ? (
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white">
                                                    {displayInitial}
                                                </span>
                                            ) : null}
                                            <div>
                                                <p className="text-sm font-semibold text-white">{userState.displayName}</p>
                                                {userState.email && (
                                                    <p className="text-xs text-slate-400">{userState.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500"
                                        >
                                            <LogOut className="h-4 w-4" aria-hidden="true" />
                                            Keluar
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
                                    >
                                        Masuk
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}
