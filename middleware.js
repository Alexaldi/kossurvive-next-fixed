import { NextResponse } from "next/server"
import * as SupabaseSSR from "@supabase/ssr"

const isDev = process.env.NODE_ENV === "development"

export async function middleware(req) {
    const res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })
    const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

    if (!isConfigured) {
        warnMissingSupabaseConfig()
        if (isDev) {
            console.warn("⚠️ Supabase env belum di-set, middleware melewati proteksi auth.")
        }
        return res
    }

    const createServerClient = SupabaseSSR?.createServerClient

    if (typeof createServerClient !== "function") {
        console.error(
            "Supabase createServerClient tidak tersedia. Pastikan paket @supabase/ssr ter-install dan up-to-date.",
        )
        return res
    }

    const supabase = createServerClient(url, anonKey, {
        cookies: {
            get(name) {
                return req.cookies.get(name)?.value
            },
            set(name, value, options) {
                res.cookies.set({ name, value, ...options })
            },
            remove(name, options) {
                res.cookies.set({ name, value: "", ...options })
            },
        },
    })

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
