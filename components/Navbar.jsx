"use client"

import { useEffect, useMemo, useRef, useState } from "react"

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const profileButtonRef = useRef(null)

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
                profileButtonRef.current &&
                !profileButtonRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const toggleDropdown = () => {
        setIsDropdownOpen((previous) => !previous)
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
        }
    }

    return (
        <header className="border-b border-gray-800 bg-transparent backdrop-blur-lg">
            <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-8 px-6 py-4">
                {/* Logo */}
                <Link href="/" className="flex flex-shrink-0 items-center gap-2">
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
                <div className="hidden flex-1 items-center justify-center gap-6 text-sm font-medium text-gray-300 lg:flex">
                    <Link
                        href="/feed"
                        className="transition hover:text-white"
                    >
                        Makanan Sehat
                    </Link>
                    <Link
                        href="/olahraga"
                        className="transition hover:text-white"
                    >
                        Olahraga
                    </Link>
                    <Link
                        href="/belajar"
                        className="transition hover:text-white"
                    >
                        Belajar
                    </Link>
                    <Link
                        href="/onboarding"
                        className="transition hover:text-white"
                    >
                        Pilih Makanan
                    </Link>
                </div>

                {/* User info & Logout */}
                <div className="relative flex flex-shrink-0 items-center">
                    {userState.loading ? (
                        <div
                            className="h-10 w-10 animate-pulse rounded-full bg-gray-700/60"
                            aria-hidden="true"
                        />
                    ) : userState.displayName ? (
                        <button
                            ref={profileButtonRef}
                            onClick={toggleDropdown}
                            className="flex items-center gap-3 rounded-full bg-gray-800/80 px-3 py-2 text-left text-sm text-gray-100 transition hover:bg-gray-700/70"
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
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                    {displayInitial}
                                </span>
                            ) : null}
                            <span className="font-medium">{userState.displayName}</span>
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                        >
                            Masuk
                        </Link>
                    )}

                    {isDropdownOpen && (
                        <div
                            role="menu"
                            aria-orientation="vertical"
                            className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-gray-700/60 bg-gray-900/95 shadow-lg backdrop-blur"
                        >
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-gray-800"
                                role="menuitem"
                            >
                                Logout
                                <span aria-hidden>↩</span>
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}
