import { NextResponse } from "next/server"
import { createMiddlewareClient } from "@supabase/ssr"

import { getPublicSupabaseConfig, warnMissingSupabaseConfig } from "@/lib/env/public"

const isDev = process.env.NODE_ENV === "development"

export async function middleware(req) {
    const res = NextResponse.next()
    const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

    if (!isConfigured) {
        warnMissingSupabaseConfig()
        if (isDev) {
            console.warn("⚠️ Supabase env belum di-set, middleware melewati proteksi auth.")
        }
        return res
    }

    const supabase = createMiddlewareClient({ req, res }, { supabaseUrl: url, supabaseKey: anonKey })

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (isDev) {
        console.log("🔍 Path:", req.nextUrl.pathname)
        console.log("🔍 User:", user)
        console.log("🔍 Error:", error)
    }

    if (error && isDev) {
        console.warn("⚠️ Supabase middleware warning:", error.message)
    }

    const publicPaths = ["/", "/login", "/register"]
    const authOnlyPaths = ["/login", "/register"]
    const isAuthCallback = req.nextUrl.pathname === "/auth/callback"

    if (!user && !publicPaths.includes(req.nextUrl.pathname) && !isAuthCallback) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/login"
        if (req.nextUrl.pathname !== "/login") {
            redirectUrl.searchParams.set("next", req.nextUrl.pathname)
        }
        return NextResponse.redirect(redirectUrl)
    }

    if (user && (authOnlyPaths.includes(req.nextUrl.pathname) || req.nextUrl.pathname === "/")) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/home"
        return NextResponse.redirect(redirectUrl)
    }

    if (user) {
        const role = user.user_metadata?.role || "user"

        if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = "/home"
            return NextResponse.redirect(redirectUrl)
        }
    }

    return res
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|Logo.png|api/public).*)",
    ],
}
